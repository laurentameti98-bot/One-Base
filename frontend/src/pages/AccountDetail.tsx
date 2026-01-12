import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Account } from '../types';

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', industry: '', website: '', phone: '' });

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
      setError(err instanceof Error ? err.message : 'Failed to update account');
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!account) {
    return <div>Account not found</div>;
  }

  return (
    <div>
      <Link to="/accounts">Back to Accounts</Link>
      <h1>{account.name}</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {!editing ? (
        <div>
          <div><strong>ID:</strong> {account.id}</div>
          <div><strong>Name:</strong> {account.name}</div>
          <div><strong>Industry:</strong> {account.industry || 'N/A'}</div>
          <div><strong>Website:</strong> {account.website || 'N/A'}</div>
          <div><strong>Phone:</strong> {account.phone || 'N/A'}</div>
          <div><strong>Created:</strong> {new Date(account.createdAt).toLocaleString()}</div>
          <div><strong>Updated:</strong> {new Date(account.updatedAt).toLocaleString()}</div>
          
          {account.contacts && account.contacts.length > 0 && (
            <div>
              <h2>Contacts</h2>
              {account.contacts.map(contact => (
                <div key={contact.id}>
                  <Link to={`/contacts/${contact.id}`}>
                    {contact.firstName} {contact.lastName}
                  </Link>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <div>
            <label>Name: <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></label>
          </div>
          <div>
            <label>Industry: <input value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} /></label>
          </div>
          <div>
            <label>Website: <input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} /></label>
          </div>
          <div>
            <label>Phone: <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></label>
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}
