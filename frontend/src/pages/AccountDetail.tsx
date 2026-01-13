import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Account, Deal, Activity } from '../types';
import { formatDate, formatAmount, formatTimestamp } from '../utils/formatters';

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', industry: '', website: '', phone: '' });
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'deals' | 'activities' | 'notes'>('overview');

  useEffect(() => {
    if (id) loadAccount();
  }, [id]);

  async function loadAccount() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.accounts.get(id) as Account;
      setAccount(data);
      setFormData({
        name: data.name,
        industry: data.industry || '',
        website: data.website || '',
        phone: data.phone || '',
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setFieldErrors({});
    try {
      const updated = await api.accounts.update(id, {
        name: formData.name,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
      }) as Account;
      setAccount(updated);
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
        setError(err instanceof Error ? err.message : 'Failed to update account');
      }
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Delete this account?')) return;
    try {
      await api.accounts.delete(id);
      navigate('/accounts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  }

  if (!account) {
    if (loading) {
      return null; // Skip full-page spinner per UX contract
    }
    return (
      <div className="page-container">
        <div>Account not found</div>
      </div>
    );
  }

  const contacts = account.contacts || [];
  const displayContacts = contacts.slice(0, 5);
  const hasMoreContacts = contacts.length > 5;

  const deals = account.deals || [];
  const activeDeals = deals.filter(deal => deal.stage !== 'closed_won' && deal.stage !== 'closed_lost');
  const displayActiveDeals = activeDeals.slice(0, 5);
  const hasMoreActiveDeals = activeDeals.length > 5;

  const activities = account.activities || [];
  const displayActivities = activities.slice(0, 5);
  const hasMoreActivities = activities.length > 5;


  function formatStage(stage: string): string {
    return stage.replace(/_/g, ' ');
  }

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/accounts">Accounts</Link>
        <span>›</span>
        <span className="breadcrumb-current">{account.name}</span>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">{account.name}</h1>
            <div className="page-meta">
              <span>Last Updated: {new Date(account.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="page-actions">
            {!editing && (
              <>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Account</button>
                <button className="btn btn-primary" onClick={() => navigate(`/deals/new?accountId=${account.id}`)}>Create Deal</button>
                <button className="btn btn-ghost" onClick={handleDelete}>Delete</button>
              </>
            )}
          </div>
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={`tab ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
            Contacts
          </button>
          <button className={`tab ${activeTab === 'deals' ? 'active' : ''}`} onClick={() => setActiveTab('deals')}>
            Deals
          </button>
          <button className={`tab ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}>
            Activities
          </button>
          <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            Notes
          </button>
        </div>
      </div>

      {error && !editing && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {!editing ? (
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Account Details Section */}
              <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Account Details</h2>
            </div>
            <div className="section-body">
              <div className="field-grid">
                <div className="field-row">
                  <div className="field-label">Company Name:</div>
                  <div className="field-value">{account.name}</div>
                  <div className="field-label">Industry:</div>
                  <div className="field-value">{account.industry || <span className="field-value-empty">—</span>}</div>
                </div>
                <div className="field-row">
                  <div className="field-label">Website:</div>
                  <div className="field-value">
                    {account.website ? (
                      <a href={account.website.startsWith('http') ? account.website : `https://${account.website}`} target="_blank" rel="noopener noreferrer">
                        {account.website}
                      </a>
                    ) : (
                      <span className="field-value-empty">—</span>
                    )}
                  </div>
                  <div className="field-label">Phone:</div>
                  <div className="field-value">{account.phone || <span className="field-value-empty">—</span>}</div>
                </div>
              </div>
            </div>
          </div>

              {/* Key Contacts Preview */}
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Key Contacts</h2>
                  {hasMoreContacts && (
                    <Link to={`/contacts?accountId=${account.id}`} className="section-action">View all</Link>
                  )}
                </div>
            <div className="section-body section-body-compact">
              {contacts.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Title</th>
                        <th>Email</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayContacts.map(contact => (
                        <tr key={contact.id} onClick={() => navigate(`/contacts/${contact.id}`)}>
                          <td>
                            <Link to={`/contacts/${contact.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                              {contact.firstName} {contact.lastName}
                            </Link>
                          </td>
                          <td>{contact.title || <span className="field-value-empty">—</span>}</td>
                          <td>{contact.email || <span className="field-value-empty">—</span>}</td>
                          <td>{contact.phone || <span className="field-value-empty">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-text">No contacts yet</p>
                  <button className="btn btn-primary" onClick={() => navigate(`/contacts/new?accountId=${account.id}`)}>Create Contact</button>
                </div>
              )}
            </div>
          </div>

              {/* Active Deals Preview */}
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Active Deals</h2>
                  {hasMoreActiveDeals && (
                    <Link to={`/deals?accountId=${account.id}`} className="section-action">View all</Link>
                  )}
                </div>
                <div className="section-body section-body-compact">
                  {activeDeals.length > 0 ? (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Stage</th>
                            <th>Amount</th>
                            <th>Close Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayActiveDeals.slice(0, 3).map((deal: Deal) => (
                            <tr key={deal.id} onClick={() => navigate(`/deals/${deal.id}`)}>
                              <td>
                                <Link to={`/deals/${deal.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                  {deal.name}
                                </Link>
                              </td>
                              <td>
                                <span className={deal.stage === 'closed_won' ? 'badge badge-success' : 'badge badge-stage'}>
                                  {formatStage(deal.stage)}
                                </span>
                              </td>
                              <td>{formatAmount(deal.amount)}</td>
                              <td>{formatDate(deal.closeDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p className="empty-state-text">No active deals</p>
                      <button className="btn btn-primary" onClick={() => navigate(`/deals/new?accountId=${account.id}`)}>Create Deal</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activities Preview */}
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Recent Activities</h2>
                  {hasMoreActivities && (
                    <Link to={`/activities?accountId=${account.id}`} className="section-action">View all</Link>
                  )}
                </div>
            <div className="section-body">
              {activities.length > 0 ? (
                <div className="timeline">
                  {displayActivities.map((activity: Activity) => {
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
                              {activity.deal && (
                                <> • <Link to={`/deals/${activity.deal.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Deal: {activity.deal.name}</Link></>
                              )}
                              {activity.contact && !activity.deal && (
                                <> • <Link to={`/contacts/${activity.contact.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Contact: {activity.contact.firstName} {activity.contact.lastName}</Link></>
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
                  <button className="btn btn-primary" onClick={() => navigate(`/activities/new?accountId=${account.id}`)}>Log Activity</button>
                </div>
              )}
                </div>
              </div>
            </>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">All Contacts</h2>
              </div>
              <div className="section-body section-body-compact">
                {contacts.length > 0 ? (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Title</th>
                          <th>Email</th>
                          <th>Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map(contact => (
                          <tr key={contact.id} onClick={() => navigate(`/contacts/${contact.id}`)}>
                            <td>
                              <Link to={`/contacts/${contact.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                {contact.firstName} {contact.lastName}
                              </Link>
                            </td>
                            <td>{contact.title || <span className="field-value-empty">—</span>}</td>
                            <td>{contact.email || <span className="field-value-empty">—</span>}</td>
                            <td>{contact.phone || <span className="field-value-empty">—</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p className="empty-state-text">No contacts yet</p>
                    <button className="btn btn-primary" onClick={() => navigate(`/contacts/new?accountId=${account.id}`)}>Create Contact</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">All Deals</h2>
              </div>
              <div className="section-body section-body-compact">
                {deals.length > 0 ? (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Stage</th>
                          <th>Amount</th>
                          <th>Close Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map((deal: Deal) => (
                          <tr key={deal.id} onClick={() => navigate(`/deals/${deal.id}`)}>
                            <td>
                              <Link to={`/deals/${deal.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                {deal.name}
                              </Link>
                            </td>
                            <td>
                              <span className={deal.stage === 'closed_won' ? 'badge badge-success' : 'badge badge-stage'}>
                                {formatStage(deal.stage)}
                              </span>
                            </td>
                            <td>{formatAmount(deal.amount)}</td>
                            <td>{formatDate(deal.closeDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p className="empty-state-text">No deals yet</p>
                    <button className="btn btn-primary" onClick={() => navigate(`/deals/new?accountId=${account.id}`)}>Create Deal</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">All Activities</h2>
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
                                {activity.deal && (
                                  <> • <Link to={`/deals/${activity.deal.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Deal: {activity.deal.name}</Link></>
                                )}
                                {activity.contact && !activity.deal && (
                                  <> • <Link to={`/contacts/${activity.contact.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Contact: {activity.contact.firstName} {activity.contact.lastName}</Link></>
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
                    <button className="btn btn-primary" onClick={() => navigate(`/activities/new?accountId=${account.id}`)}>Log Activity</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="content-section">
              <div className="section-body">
                <div className="empty-state">
                  <p className="empty-state-text">Notes functionality coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Edit Account</h2>
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
                  <div className="field-label">Name:</div>
                  <div>
                    <input
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
                  </div>
                  <div className="field-label">Industry:</div>
                  <div>
                    <input
                      className="form-input"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                    {fieldErrors.industry && <div className="form-error">{fieldErrors.industry}</div>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">Website:</div>
                  <div>
                    <input
                      className="form-input"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                    {fieldErrors.website && <div className="form-error">{fieldErrors.website}</div>}
                  </div>
                  <div className="field-label">Phone:</div>
                  <div>
                    <input
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    {fieldErrors.phone && <div className="form-error">{fieldErrors.phone}</div>}
                  </div>
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
                    if (account) {
                      setFormData({
                        name: account.name,
                        industry: account.industry || '',
                        website: account.website || '',
                        phone: account.phone || '',
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
