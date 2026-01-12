import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Deal, PaginatedResponse } from '../types';

export function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const accountIdFilter = searchParams.get('accountId');

  useEffect(() => {
    loadDeals();
  }, [pagination.page, searchQuery, accountIdFilter]);

  async function loadDeals() {
    try {
      setLoading(true);
      const response = await api.deals.list(
        pagination.page,
        pagination.pageSize,
        searchQuery || undefined,
        accountIdFilter || undefined
      ) as PaginatedResponse<Deal>;
      setDeals(response.items);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  }

  const startIndex = pagination.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.total);

  function formatAmount(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  }

  if (loading && deals.length === 0) {
    return (
      <div>
        <h1>Deals</h1>
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
        <h1>Deals</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/deals/pipeline')}>Pipeline View</button>
          <button onClick={() => navigate('/deals/new')}>Create Deal</button>
        </div>
      </div>

      {error && <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '10px' }}>Error: {error}</div>}
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search deals..."
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

      {deals.length === 0 && !loading ? (
        <div style={{ padding: '40px', textAlign: 'center', border: '1px solid #ccc' }}>
          <p>No deals found.</p>
          {!searchQuery && (
            <button onClick={() => navigate('/deals/new')}>Create Deal</button>
          )}
        </div>
      ) : deals.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Account</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Stage</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Close Date</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(deal => (
              <tr
                key={deal.id}
                onClick={() => navigate(`/deals/${deal.id}`)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{deal.name}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  {deal.account ? (
                    <Link to={`/accounts/${deal.account.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      {deal.account.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{deal.stage}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{formatAmount(deal.amount)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{formatDate(deal.closeDate)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{new Date(deal.updatedAt).toLocaleString()}</td>
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
