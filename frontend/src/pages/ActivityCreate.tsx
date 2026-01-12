import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Activity, Account, Contact, Deal, PaginatedResponse } from '../types';

const ACTIVITY_TYPES = ['note', 'task', 'call', 'meeting'] as const;

export function ActivityCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    type: 'note' as typeof ACTIVITY_TYPES[number],
    subject: '',
    body: '',
    status: '',
    accountId: searchParams.get('accountId') || '',
    contactId: searchParams.get('contactId') || '',
    dealId: searchParams.get('dealId') || '',
    dueDate: '',
  });

  useEffect(() => {
    loadParentEntities();
  }, []);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    try {
      const activity = await api.activities.create({
        type: formData.type,
        subject: formData.subject,
        body: formData.body || undefined,
        status: formData.status || undefined,
        accountId: formData.accountId || undefined,
        contactId: formData.contactId || undefined,
        dealId: formData.dealId || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      }) as Activity;
      navigate(`/activities/${activity.id}`);
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
        setError(err instanceof Error ? err.message : 'Failed to create activity');
      }
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/activities">Activities</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #ccc' }}>
        <h1>Create Activity</h1>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '20px' }}>
          <strong>Validation Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleCreate} noValidate>
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
          <button type="submit">Create</button>
          <button type="button" onClick={() => navigate('/activities')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
