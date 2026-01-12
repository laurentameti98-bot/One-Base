import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Contact, PaginatedResponse, Account } from '../types';

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ accountId: '', firstName: '', lastName: '', email: '', phone: '', title: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadContacts();
    loadAccounts();
  }, [pagination.page]);

  async function loadContacts() {
    try {
      setLoading(true);
      const response = await api.contacts.list(pagination.page, pagination.pageSize) as PaginatedResponse<Contact>;
      setContacts(response.items);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const contact = await api.contacts.create({
        accountId: formData.accountId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        title: formData.title || undefined,
      }) as Contact;
      setShowCreateForm(false);
      setFormData({ accountId: '', firstName: '', lastName: '', email: '', phone: '', title: '' });
      navigate(`/contacts/${contact.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
    }
  }

  if (loading && contacts.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Contacts</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create Contact'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreate}>
          <div>
            <label>Account: 
              <select value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} required>
                <option value="">Select account</option>
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
          <button type="submit">Create</button>
        </form>
      )}

      <div>
        {contacts.map(contact => (
          <div key={contact.id}>
            <Link to={`/contacts/${contact.id}`}>
              {contact.firstName} {contact.lastName}
            </Link>
            {contact.account && <span> - {contact.account.name}</span>}
          </div>
        ))}
      </div>

      <div>
        <button disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>Previous</button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>Next</button>
      </div>
    </div>
  );
}
