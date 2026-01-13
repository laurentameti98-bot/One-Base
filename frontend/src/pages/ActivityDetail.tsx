import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Activity, Account, Contact, Deal, PaginatedResponse } from '../types';
import { formatTimestamp } from '../utils/formatters';

const ACTIVITY_TYPES = ['note', 'task', 'call', 'meeting'] as const;

export function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    type: 'note' as typeof ACTIVITY_TYPES[number],
    subject: '',
    body: '',
    status: '',
    accountId: '',
    contactId: '',
    dealId: '',
    dueDate: '',
  });

  useEffect(() => {
    if (id) {
      loadActivity();
      loadParentEntities();
    }
  }, [id]);

  async function loadActivity() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.activities.get(id) as Activity;
      setActivity(data);
      setFormData({
        type: data.type as typeof ACTIVITY_TYPES[number],
        subject: data.subject,
        body: data.body || '',
        status: data.status || '',
        accountId: data.accountId || '',
        contactId: data.contactId || '',
        dealId: data.dealId || '',
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }

  async function loadParentEntities() {
    try {
      const [accountsRes, contactsRes, dealsRes] = await Promise.all([
        api.accounts.list(1, 1000) as Promise<PaginatedResponse<Account>>,
        api.contacts.list(1, 1000) as Promise<PaginatedResponse<Contact>>,
        api.deals.list(1, 1000) as Promise<PaginatedResponse<Deal>>,
      ]);
      setAccounts(accountsRes.items);
      setContacts(contactsRes.items);
      setDeals(dealsRes.items);
    } catch (err) {
      console.error('Failed to load parent entities for dropdown');
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setFieldErrors({});
    try {
      const updated = await api.activities.update(id, {
        type: formData.type,
        subject: formData.subject,
        body: formData.body || undefined,
        status: formData.status || undefined,
        accountId: formData.accountId || undefined,
        contactId: formData.contactId || undefined,
        dealId: formData.dealId || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      }) as Activity;
      setActivity(updated);
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
        setError(err instanceof Error ? err.message : 'Failed to update activity');
      }
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Delete this activity?')) return;
    try {
      await api.activities.delete(id);
      navigate('/activities');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
    }
  }


  if (!activity) {
    if (loading) {
      return null; // Skip full-page spinner per UX contract
    }
    return (
      <div className="page-container">
        <div>Activity not found</div>
      </div>
    );
  }

  // Build breadcrumb path
  const breadcrumbPath = [];
  if (activity.account) {
    breadcrumbPath.push({ label: activity.account.name, path: `/accounts/${activity.account.id}` });
  }
  breadcrumbPath.push({ label: 'Activities', path: '/activities' });
  breadcrumbPath.push({ label: activity.subject, path: null });

  return (
    <div className="page-container">
      <div className="breadcrumb">
        {breadcrumbPath.map((item, index) => (
          <span key={index}>
            {item.path ? (
              <Link to={item.path}>{item.label}</Link>
            ) : (
              <span className="breadcrumb-current">{item.label}</span>
            )}
            {index < breadcrumbPath.length - 1 && <span>›</span>}
          </span>
        ))}
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">
              {activity.subject} <span className="badge badge-primary">{activity.type.toUpperCase()}</span>
            </h1>
            <div className="page-meta">
              <span>{formatTimestamp(activity.createdAt)}</span>
              {activity.deal && (
                <>
                  <span>|</span>
                  <span>Related to: <Link to={`/deals/${activity.deal.id}`}>{activity.deal.name}</Link></span>
                </>
              )}
              {activity.contact && !activity.deal && (
                <>
                  <span>|</span>
                  <span>Related to: <Link to={`/contacts/${activity.contact.id}`}>{activity.contact.firstName} {activity.contact.lastName}</Link></span>
                </>
              )}
              {activity.account && !activity.deal && !activity.contact && (
                <>
                  <span>|</span>
                  <span>Related to: <Link to={`/accounts/${activity.account.id}`}>{activity.account.name}</Link></span>
                </>
              )}
            </div>
          </div>
          <div className="page-actions">
            {!editing && (
              <>
                <button className="btn btn-secondary" onClick={() => navigate('/activities')}>Back to Activities</button>
                <button className="btn btn-destructive" onClick={handleDelete}>Delete Activity</button>
                <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Activity</button>
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
          {/* Activity Details Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Activity Details</h2>
            </div>
            <div className="section-body">
              <div className="field-grid">
                <div className="field-row">
                  <div className="field-label">Related Account:</div>
                  <div className="field-value">
                    {activity.account ? (
                      <Link to={`/accounts/${activity.account.id}`}>{activity.account.name}</Link>
                    ) : (
                      <span className="field-value-empty">—</span>
                    )}
                  </div>
                  <div className="field-label">Related Deal:</div>
                  <div className="field-value">
                    {activity.deal ? (
                      <Link to={`/deals/${activity.deal.id}`}>{activity.deal.name}</Link>
                    ) : (
                      <span className="field-value-empty">—</span>
                    )}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">Participants:</div>
                  <div className="field-value">
                    {activity.contact ? (
                      <Link to={`/contacts/${activity.contact.id}`}>{activity.contact.firstName} {activity.contact.lastName}</Link>
                    ) : (
                      <span className="field-value-empty">—</span>
                    )}
                  </div>
                  <div className="field-label">Status:</div>
                  <div className="field-value">
                    {activity.status ? (
                      <span className="badge badge-success">{activity.status}</span>
                    ) : (
                      <span className="field-value-empty">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {activity.body && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Notes</h2>
              </div>
              <div className="section-body">
                <div className="notes-section">
                  {activity.body}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Edit Activity</h2>
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
                  <div className="field-label">Type:</div>
                  <div>
                    <select className="form-input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof ACTIVITY_TYPES[number] })}>
                      {ACTIVITY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {fieldErrors.type && <div className="form-error">{fieldErrors.type}</div>}
                  </div>
                  <div className="field-label">Subject:</div>
                  <div>
                    <input className="form-input" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                    {fieldErrors.subject && <div className="form-error">{fieldErrors.subject}</div>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">Body:</div>
                  <div>
                    <textarea className="form-input" value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={5} />
                    {fieldErrors.body && <div className="form-error">{fieldErrors.body}</div>}
                  </div>
                  <div className="field-label">Status:</div>
                  <div>
                    <input className="form-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />
                    {fieldErrors.status && <div className="form-error">{fieldErrors.status}</div>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">Account:</div>
                  <div>
                    <select className="form-input" value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}>
                      <option value="">None</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                    {fieldErrors.accountId && <div className="form-error">{fieldErrors.accountId}</div>}
                  </div>
                  <div className="field-label">Contact:</div>
                  <div>
                    <select className="form-input" value={formData.contactId} onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}>
                      <option value="">None</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName}</option>
                      ))}
                    </select>
                    {fieldErrors.contactId && <div className="form-error">{fieldErrors.contactId}</div>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">Deal:</div>
                  <div>
                    <select className="form-input" value={formData.dealId} onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}>
                      <option value="">None</option>
                      {deals.map(deal => (
                        <option key={deal.id} value={deal.id}>{deal.name}</option>
                      ))}
                    </select>
                    {fieldErrors.dealId && <div className="form-error">{fieldErrors.dealId}</div>}
                  </div>
                  <div className="field-label">Due Date:</div>
                  <div>
                    <input type="date" className="form-input" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                    {fieldErrors.dueDate && <div className="form-error">{fieldErrors.dueDate}</div>}
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
                    if (activity) {
                      setFormData({
                        type: activity.type as typeof ACTIVITY_TYPES[number],
                        subject: activity.subject,
                        body: activity.body || '',
                        status: activity.status || '',
                        accountId: activity.accountId || '',
                        contactId: activity.contactId || '',
                        dealId: activity.dealId || '',
                        dueDate: activity.dueDate ? new Date(activity.dueDate).toISOString().split('T')[0] : '',
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
