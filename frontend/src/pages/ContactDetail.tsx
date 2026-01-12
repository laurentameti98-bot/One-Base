import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Contact, Account } from '../types';

export function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError(err instanceof Error ? err.message : 'Failed to update contact');
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
      <Link to="/contacts">Back to Contacts</Link>
      <h1>{contact.firstName} {contact.lastName}</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {!editing ? (
        <div>
          <div><strong>ID:</strong> {contact.id}</div>
          <div><strong>Account:</strong> {contact.account ? <Link to={`/accounts/${contact.account.id}`}>{contact.account.name}</Link> : contact.accountId}</div>
          <div><strong>First Name:</strong> {contact.firstName}</div>
          <div><strong>Last Name:</strong> {contact.lastName}</div>
          <div><strong>Email:</strong> {contact.email || 'N/A'}</div>
          <div><strong>Phone:</strong> {contact.phone || 'N/A'}</div>
          <div><strong>Title:</strong> {contact.title || 'N/A'}</div>
          <div><strong>Created:</strong> {new Date(contact.createdAt).toLocaleString()}</div>
          <div><strong>Updated:</strong> {new Date(contact.updatedAt).toLocaleString()}</div>

          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <div>
            <label>Account: 
              <select value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} required>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>First Name: <input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required /></label>
          </div>
          <div>
            <label>Last Name: <input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required /></label>
          </div>
          <div>
            <label>Email: <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></label>
          </div>
          <div>
            <label>Phone: <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></label>
          </div>
          <div>
            <label>Title: <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></label>
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}
