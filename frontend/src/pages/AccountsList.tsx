import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Account, PaginatedResponse } from '../types';

export function AccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', industry: '', website: '', phone: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadAccounts();
  }, [pagination.page]);

  async function loadAccounts() {
    try {
      setLoading(true);
      const response = await api.accounts.list(pagination.page, pagination.pageSize) as PaginatedResponse<Account>;
      setAccounts(response.items);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const account = await api.accounts.create({
        name: formData.name,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
      }) as Account;
      setShowCreateForm(false);
      setFormData({ name: '', industry: '', website: '', phone: '' });
      navigate(`/accounts/${account.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  }

  if (loading && accounts.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Accounts</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create Account'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreate}>
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
          <button type="submit">Create</button>
        </form>
      )}

      <div>
        {accounts.map(account => (
          <div key={account.id}>
            <Link to={`/accounts/${account.id}`}>{account.name}</Link>
            {account.industry && <span> - {account.industry}</span>}
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
