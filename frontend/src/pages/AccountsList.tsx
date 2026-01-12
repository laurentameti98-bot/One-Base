import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Account, PaginatedResponse } from '../types';

export function AccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadAccounts();
  }, [pagination.page, searchQuery]);

  async function loadAccounts() {
    try {
      setLoading(true);
      const response = await api.accounts.list(pagination.page, pagination.pageSize, searchQuery || undefined) as PaginatedResponse<Account>;
      setAccounts(response.items);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }

  const startIndex = pagination.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.total);

  if (loading && accounts.length === 0) {
    return (
      <div>
        <h1>Accounts</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/">Home</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Accounts</h1>
        <button onClick={() => navigate('/accounts/new')}>Create Account</button>
      </div>

      {error && <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '10px' }}>Error: {error}</div>}
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
        />
      </div>

      {pagination.total > 0 && (
        <div style={{ marginBottom: '10px' }}>
          Showing {startIndex}–{endIndex} of {pagination.total}
        </div>
      )}

      {accounts.length === 0 && !loading ? (
        <div style={{ padding: '40px', textAlign: 'center', border: '1px solid #ccc' }}>
          <p>No accounts found.</p>
          {!searchQuery && (
            <button onClick={() => navigate('/accounts/new')}>Create Account</button>
          )}
        </div>
      ) : accounts.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Industry</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr
                key={account.id}
                onClick={() => navigate(`/accounts/${account.id}`)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{account.name}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{account.industry || '—'}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{new Date(account.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {pagination.totalPages > 1 && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>Previous</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>Next</button>
        </div>
      )}
    </div>
  );
}
