import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Deal, Account, PaginatedResponse, Activity, Contact } from '../types';
import { formatDate, formatAmount } from '../utils/formatters';

const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;

export function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    name: '',
    stage: 'lead' as typeof DEAL_STAGES[number],
    amount: '',
    closeDate: '',
  });
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDeal();
      loadAccounts();
      loadContacts();
    }
  }, [id]);

  async function loadDeal() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.deals.get(id) as Deal;
      setDeal(data);
      setFormData({
        accountId: data.accountId,
        name: data.name,
        stage: data.stage as typeof DEAL_STAGES[number],
        amount: data.amount ? data.amount.toString() : '',
        closeDate: data.closeDate ? new Date(data.closeDate).toISOString().split('T')[0] : '',
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deal');
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      const response = await api.accounts.list(1, 1000) as PaginatedResponse<Account>;
      setAccounts(response.items);
    } catch (err) {
      console.error('Failed to load accounts for dropdown');
    }
  }

  async function loadContacts() {
    if (!deal?.accountId) return;
    try {
      const response = await api.contacts.list(1, 1000, undefined, deal.accountId) as PaginatedResponse<Contact>;
      setContacts(response.items);
    } catch (err) {
      console.error('Failed to load contacts');
    }
  }

  useEffect(() => {
    if (deal?.accountId) {
      loadContacts();
    }
  }, [deal?.accountId]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setFieldErrors({});
    try {
      const updated = await api.deals.update(id, {
        accountId: formData.accountId,
        name: formData.name,
        stage: formData.stage,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        closeDate: formData.closeDate ? new Date(formData.closeDate).toISOString() : undefined,
      }) as Deal;
      setDeal(updated);
      setEditing(false);
      setError(null);
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
        const errors: Record<string, string> = {};
        err.details.forEach(detail => {
          const fieldName = detail.path.split('.').pop() || detail.path;
          errors[fieldName] = detail.message;
        });
        setFieldErrors(errors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update deal');
      }
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Delete this deal?')) return;
    try {
      await api.deals.delete(id);
      navigate('/deals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deal');
    }
  }

  function formatStage(stage: string): string {
    return stage.replace(/_/g, ' ');
  }

  function formatTimestamp(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    return date.toLocaleString();
  }

  if (!deal) {
    if (loading) {
      return null; // Skip full-page spinner per UX contract
    }
    return (
      <div className="page-container">
        <div>Deal not found</div>
      </div>
    );
  }

  const activities = deal.activities || [];

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/deals">Deals</Link>
        <span>›</span>
        <span className="breadcrumb-current">{deal.name}</span>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">{deal.name}</h1>
            <div className="page-meta">
              {deal.account && (
                <>
                  <Link to={`/accounts/${deal.account.id}`}>{deal.account.name}</Link>
                  <span>|</span>
                </>
              )}
              <span className={deal.stage === 'closed_won' ? 'badge badge-success' : 'badge badge-stage'}>
                {formatStage(deal.stage)}
              </span>
              <span>|</span>
              <span>Last Updated: {formatDate(deal.updatedAt)}</span>
            </div>
          </div>
          <div className="page-actions">
            {!editing && (
              <>
                <button className="btn btn-destructive" onClick={handleDelete}>Delete Deal</button>
                {deal.stage !== 'closed_won' && (
                  <button className="btn btn-secondary" onClick={() => {
                    // Mark as closed won - simplified, would need API call
                    setEditing(true);
                  }}>Mark as Closed Won</button>
                )}
                <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Deal</button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && !editing && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {!editing ? (
        <div>
          {/* Deal Details Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Deal Details</h2>
            </div>
            <div className="section-body">
              <div className="field-grid">
                <div className="field-row">
                  <div className="field-label">Deal Name:</div>
                  <div className="field-value">{deal.name}</div>
                  <div className="field-label">Stage:</div>
                  <div className="field-value">
                    <span className={deal.stage === 'closed_won' ? 'badge badge-success' : 'badge badge-stage'}>
                      {formatStage(deal.stage)}
                    </span>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">Account:</div>
                  <div className="field-value">
                    {deal.account ? (
                      <Link to={`/accounts/${deal.account.id}`}>{deal.account.name}</Link>
                    ) : (
                      <span className="field-value-empty">—</span>
                    )}
                  </div>
                  <div className="field-label">Value:</div>
                  <div className="field-value">{formatAmount(deal.amount)}</div>
                </div>
                <div className="field-row">
                  <div className="field-label">Close Date:</div>
                  <div className="field-value">{formatDate(deal.closeDate)}</div>
                  <div className="field-label"></div>
                  <div className="field-value"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Contacts Section */}
          {contacts.length > 0 && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Related Contacts</h2>
              </div>
              <div className="section-body section-body-compact">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Title</th>
                        <th>Email</th>
                        <th>Role in Deal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.slice(0, 5).map(contact => (
                        <tr key={contact.id} onClick={() => navigate(`/contacts/${contact.id}`)}>
                          <td>
                            <Link to={`/contacts/${contact.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                              {contact.firstName} {contact.lastName}
                            </Link>
                          </td>
                          <td>{contact.title || <span className="field-value-empty">—</span>}</td>
                          <td>
                            {contact.email ? (
                              <a href={`mailto:${contact.email}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                {contact.email}
                              </a>
                            ) : (
                              <span className="field-value-empty">—</span>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-primary">Contact</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Deal Activities Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Deal Activities</h2>
              <select className="form-select" style={{ width: '150px' }}>
                <option>All Activities</option>
                <option>Calls</option>
                <option>Meetings</option>
                <option>Tasks</option>
                <option>Notes</option>
              </select>
            </div>
            <div className="section-body">
              {activities.length > 0 ? (
                <div className="timeline">
                  {activities.map((activity: Activity) => {
                    const isExpanded = expandedActivityId === activity.id;
                    return (
                      <div key={activity.id} className="timeline-entry" onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}>
                        <div className="timeline-entry-header">
                          <span className="timeline-entry-type">{activity.type.toUpperCase()}</span>
                          <div className="timeline-entry-content">
                            <div className="timeline-entry-title">
                              <Link to={`/activities/${activity.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                {activity.subject}
                              </Link>
                            </div>
                            <div className="timeline-entry-meta">
                              {formatTimestamp(activity.createdAt)}
                              {activity.contact && (
                                <> • <Link to={`/contacts/${activity.contact.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>With: {activity.contact.firstName} {activity.contact.lastName}</Link></>
                              )}
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="timeline-entry-details expanded">
                            {activity.body && (
                              <div className="timeline-entry-notes">
                                {activity.body}
                              </div>
                            )}
                            {activity.status && (
                              <div className="timeline-entry-details-row">
                                <div className="timeline-entry-details-label">Status:</div>
                                <div>{activity.status}</div>
                              </div>
                            )}
                            {activity.dueDate && (
                              <div className="timeline-entry-details-row">
                                <div className="timeline-entry-details-label">Due Date:</div>
                                <div>{formatDate(activity.dueDate)}</div>
                              </div>
                            )}
                            <div className="timeline-entry-actions">
                              <Link to={`/activities/${activity.id}`} className="btn btn-sm btn-secondary">View Details</Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-text">No activities yet</p>
                  <button className="btn btn-secondary" onClick={() => navigate(`/activities/new?dealId=${deal.id}`)}>Log Activity</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Edit Deal</h2>
          </div>
          <div className="section-body">
            <form onSubmit={handleUpdate} noValidate>
              {error && (
                <div className="error-message">
                  <strong>Validation Error:</strong> {error}
                </div>
              )}
              <div className="field-grid">
                <div className="field-row">
                  <div className="field-label">Account:</div>
                  <div>
                    <select className="form-input" value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                    {fieldErrors.accountId && <div className="form-error">{fieldErrors.accountId}</div>}
                  </div>
                  <div className="field-label">Name:</div>
                  <div>
                    <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">Stage:</div>
                  <div>
                    <select className="form-input" value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value as typeof DEAL_STAGES[number] })}>
                      {DEAL_STAGES.map(stage => (
                        <option key={stage} value={stage}>{formatStage(stage)}</option>
                      ))}
                    </select>
                    {fieldErrors.stage && <div className="form-error">{fieldErrors.stage}</div>}
                  </div>
                  <div className="field-label">Amount:</div>
                  <div>
                    <input type="number" step="0.01" className="form-input" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                    {fieldErrors.amount && <div className="form-error">{fieldErrors.amount}</div>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">Close Date:</div>
                  <div>
                    <input type="date" className="form-input" value={formData.closeDate} onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })} />
                    {fieldErrors.closeDate && <div className="form-error">{fieldErrors.closeDate}</div>}
                  </div>
                  <div className="field-label"></div>
                  <div></div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                    setFieldErrors({});
                    if (deal) {
                      setFormData({
                        accountId: deal.accountId,
                        name: deal.name,
                        stage: deal.stage as typeof DEAL_STAGES[number],
                        amount: deal.amount ? deal.amount.toString() : '',
                        closeDate: deal.closeDate ? new Date(deal.closeDate).toISOString().split('T')[0] : '',
                      });
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
