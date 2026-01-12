import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Activity, Account, Contact, Deal, PaginatedResponse } from '../types';

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

  function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  }

  if (!activity) {
    if (loading) {
      return null; // Skip full-page spinner per UX contract
    }
    return <div>Activity not found</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/activities">Activities</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #ccc' }}>
        <h1>{activity.subject}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!editing && (
            <>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
      </div>

      {error && !editing && <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '20px' }}>Error: {error}</div>}

      {!editing ? (
        <div>
          <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ccc' }}>
            <div style={{ fontSize: '14px', marginBottom: '5px' }}>Related To</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {activity.deal && (
                <Link to={`/deals/${activity.deal.id}`}>Deal: {activity.deal.name}</Link>
              )}
              {activity.contact && !activity.deal && (
                <Link to={`/contacts/${activity.contact.id}`}>Contact: {activity.contact.firstName} {activity.contact.lastName}</Link>
              )}
              {activity.account && !activity.deal && !activity.contact && (
                <Link to={`/accounts/${activity.account.id}`}>Account: {activity.account.name}</Link>
              )}
            </div>
          </div>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>Activity Information</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', margin: 0 }}>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Type:</dt>
              <dd style={{ margin: 0 }}>{activity.type}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Subject:</dt>
              <dd style={{ margin: 0 }}>{activity.subject}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Body:</dt>
              <dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{activity.body || '—'}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Status:</dt>
              <dd style={{ margin: 0 }}>{activity.status || '—'}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Due Date:</dt>
              <dd style={{ margin: 0 }}>{formatDate(activity.dueDate)}</dd>
            </dl>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>System Information</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', margin: 0 }}>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Created:</dt>
              <dd style={{ margin: 0 }}>{new Date(activity.createdAt).toLocaleString()}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Updated:</dt>
              <dd style={{ margin: 0 }}>{new Date(activity.updatedAt).toLocaleString()}</dd>
            </dl>
          </section>
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>Edit Activity</h2>
          <form onSubmit={handleUpdate} noValidate>
            {error && (
              <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '10px' }}>
                <strong>Validation Error:</strong> {error}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Type:</label>
              <div>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof ACTIVITY_TYPES[number] })} style={{ width: '100%', maxWidth: '400px' }}>
                  {ACTIVITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {fieldErrors.type && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.type}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Subject:</label>
              <div>
                <input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.subject && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.subject}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Body:</label>
              <div>
                <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={5} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.body && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.body}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Status:</label>
              <div>
                <input value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.status && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.status}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Account:</label>
              <div>
                <select value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} style={{ width: '100%', maxWidth: '400px' }}>
                  <option value="">None</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                {fieldErrors.accountId && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.accountId}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Contact:</label>
              <div>
                <select value={formData.contactId} onChange={(e) => setFormData({ ...formData, contactId: e.target.value })} style={{ width: '100%', maxWidth: '400px' }}>
                  <option value="">None</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName}</option>
                  ))}
                </select>
                {fieldErrors.contactId && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.contactId}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Deal:</label>
              <div>
                <select value={formData.dealId} onChange={(e) => setFormData({ ...formData, dealId: e.target.value })} style={{ width: '100%', maxWidth: '400px' }}>
                  <option value="">None</option>
                  {deals.map(deal => (
                    <option key={deal.id} value={deal.id}>{deal.name}</option>
                  ))}
                </select>
                {fieldErrors.dealId && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.dealId}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Due Date:</label>
              <div>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.dueDate && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.dueDate}</div>}
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => {
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
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
