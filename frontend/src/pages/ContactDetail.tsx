import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Contact, Account, Activity } from '../types';
import { formatDate, formatTimestamp } from '../utils/formatters';

export function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ accountId: '', firstName: '', lastName: '', email: '', phone: '', title: '' });
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities'>('overview');

  useEffect(() => {
    if (id) {
      loadContact();
      loadAccounts();
    }
  }, [id]);

  async function loadContact() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.contacts.get(id) as Contact;
      setContact(data);
      setFormData({
        accountId: data.accountId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || '',
        phone: data.phone || '',
        title: data.title || '',
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contact');
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      const response = await api.accounts.list(1, 1000) as { items: Account[] };
      setAccounts(response.items);
    } catch (err) {
      console.error('Failed to load accounts for dropdown');
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setFieldErrors({});
    try {
      const updated = await api.contacts.update(id, {
        accountId: formData.accountId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        title: formData.title || undefined,
      }) as Contact;
      setContact(updated);
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
        setError(err instanceof Error ? err.message : 'Failed to update contact');
      }
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Delete this contact?')) return;
    try {
      await api.contacts.delete(id);
      navigate('/contacts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  }


  if (!contact) {
    if (loading) {
      return null;
    }
    return (
      <div className="page-container">
        <div>Contact not found</div>
      </div>
    );
  }

  const activities = contact.activities || [];
  const displayActivities = activities.slice(0, 5);
  const hasMoreActivities = activities.length > 5;

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/contacts">Contacts</Link>
        <span>›</span>
        <span className="breadcrumb-current">{contact.firstName} {contact.lastName}</span>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">{contact.firstName} {contact.lastName}</h1>
            <div className="page-subtitle">{contact.title || 'Contact'}</div>
            <div className="page-meta">
              <span>Last Updated: {new Date(contact.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="page-actions">
            {!editing && (
              <>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Contact</button>
                <button className="btn btn-primary" onClick={() => navigate(`/activities/new?contactId=${contact.id}`)}>Log Activity</button>
                <button className="btn btn-ghost" onClick={handleDelete}>Delete</button>
              </>
            )}
          </div>
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={`tab ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}>
            Activities
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
              {/* Contact Information Section */}
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Contact Information</h2>
                </div>
                <div className="section-body">
                  <div className="field-grid">
                    <div className="field-row">
                      <div className="field-label">Account:</div>
                      <div className="field-value">
                        {contact.account ? (
                          <Link to={`/accounts/${contact.account.id}`}>{contact.account.name}</Link>
                        ) : (
                          <span className="field-value-empty">—</span>
                        )}
                      </div>
                      <div className="field-label">Title:</div>
                      <div className="field-value">{contact.title || <span className="field-value-empty">—</span>}</div>
                    </div>
                    <div className="field-row">
                      <div className="field-label">Email:</div>
                      <div className="field-value">
                        {contact.email ? (
                          <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        ) : (
                          <span className="field-value-empty">—</span>
                        )}
                      </div>
                      <div className="field-label">Phone:</div>
                      <div className="field-value">{contact.phone || <span className="field-value-empty">—</span>}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities Preview */}
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Recent Activities</h2>
                  {hasMoreActivities && (
                    <Link to={`/activities?contactId=${contact.id}`} className="section-action">View all</Link>
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
                                  {activity.account && !activity.deal && (
                                    <> • <Link to={`/accounts/${activity.account.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Account: {activity.account.name}</Link></>
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
                      <button className="btn btn-primary" onClick={() => navigate(`/activities/new?contactId=${contact.id}`)}>Log Activity</button>
                    </div>
                  )}
                </div>
              </div>
            </>
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
                                {activity.account && !activity.deal && (
                                  <> • <Link to={`/accounts/${activity.account.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Account: {activity.account.name}</Link></>
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
                    <button className="btn btn-primary" onClick={() => navigate(`/activities/new?contactId=${contact.id}`)}>Log Activity</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Edit Contact</h2>
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
                    <select
                      className="form-input"
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                    {fieldErrors.accountId && <div className="form-error">{fieldErrors.accountId}</div>}
                  </div>
                  <div className="field-label">Title:</div>
                  <div>
                    <input
                      className="form-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    {fieldErrors.title && <div className="form-error">{fieldErrors.title}</div>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">First Name:</div>
                  <div>
                    <input
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    {fieldErrors.firstName && <div className="form-error">{fieldErrors.firstName}</div>}
                  </div>
                  <div className="field-label">Last Name:</div>
                  <div>
                    <input
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                    {fieldErrors.lastName && <div className="form-error">{fieldErrors.lastName}</div>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-label">Email:</div>
                  <div>
                    <input
                      className="form-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
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
                    if (contact) {
                      setFormData({
                        accountId: contact.accountId,
                        firstName: contact.firstName,
                        lastName: contact.lastName,
                        email: contact.email || '',
                        phone: contact.phone || '',
                        title: contact.title || '',
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
