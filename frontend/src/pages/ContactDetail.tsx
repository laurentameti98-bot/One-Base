import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Contact, Account } from '../types';

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!contact) {
    return <div>Contact not found</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/contacts">Contacts</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #ccc' }}>
        <h1>{contact.firstName} {contact.lastName}</h1>
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
            <div style={{ fontSize: '14px', marginBottom: '5px' }}>Account</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {contact.account ? (
                <Link to={`/accounts/${contact.account.id}`}>{contact.account.name}</Link>
              ) : (
                contact.accountId
              )}
            </div>
          </div>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>Contact Information</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', margin: 0 }}>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>First Name:</dt>
              <dd style={{ margin: 0 }}>{contact.firstName}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Last Name:</dt>
              <dd style={{ margin: 0 }}>{contact.lastName}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Email:</dt>
              <dd style={{ margin: 0 }}>{contact.email || '—'}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Phone:</dt>
              <dd style={{ margin: 0 }}>{contact.phone || '—'}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Title:</dt>
              <dd style={{ margin: 0 }}>{contact.title || '—'}</dd>
            </dl>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>System Information</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', margin: 0 }}>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Created:</dt>
              <dd style={{ margin: 0 }}>{new Date(contact.createdAt).toLocaleString()}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Updated:</dt>
              <dd style={{ margin: 0 }}>{new Date(contact.updatedAt).toLocaleString()}</dd>
            </dl>
          </section>
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>Edit Contact</h2>
          <form onSubmit={handleUpdate} noValidate>
            {error && (
              <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '10px' }}>
                <strong>Validation Error:</strong> {error}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Account:</label>
              <div>
                <select value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} style={{ width: '100%', maxWidth: '400px' }}>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                {fieldErrors.accountId && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.accountId}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>First Name:</label>
              <div>
                <input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.firstName && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.firstName}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Last Name:</label>
              <div>
                <input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.lastName && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.lastName}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Email:</label>
              <div>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.email && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.email}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Phone:</label>
              <div>
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.phone && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.phone}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Title:</label>
              <div>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.title && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.title}</div>}
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => {
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
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
