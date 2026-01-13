import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Deal, PaginatedResponse } from '../types';
import { formatDate, formatAmount } from '../utils/formatters';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { usePagination } from '../hooks/usePagination';
import { PaginationSimple } from '../components/PaginationSimple';
import { SearchBar } from '../components/SearchBar';

const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;

export function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pagination, setPagination, updatePagination, startIndex, endIndex } = usePagination(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const accountIdFilter = searchParams.get('accountId');
  const debouncedSearchQuery = useDebouncedSearch(searchQuery, 300, () => {
    // Reset to page 1 when search changes (only if not already page 1)
    if (pagination.page !== 1) {
      updatePagination({ ...pagination, page: 1 });
    }
  });

  useEffect(() => {
    loadDeals();
  }, [pagination.page, debouncedSearchQuery, stageFilter, accountIdFilter]);

  async function loadDeals() {
    try {
      // Only set loading to true if not already loading to avoid unnecessary re-renders
      if (!loading) {
        setLoading(true);
      }
      const response = await api.deals.list(
        pagination.page,
        pagination.pageSize,
        debouncedSearchQuery || undefined,
        accountIdFilter || undefined,
        stageFilter || undefined
      ) as PaginatedResponse<Deal>;
      setDeals(response.items);
      updatePagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  }



  function getStageBadgeClass(stage: string): string {
    if (stage === 'closed_won') return 'badge badge-success';
    if (stage === 'closed_lost') return 'badge';
    return 'badge badge-primary';
  }

  function formatStage(stage: string): string {
    return stage.replace(/_/g, ' ');
  }

  if (loading && deals.length === 0) {
    return (
      <div className="page-container">
        <div className="breadcrumb">
          <span className="breadcrumb-current">Deals</span>
        </div>
        <div className="page-header">
          <div className="page-header-top">
            <div className="page-header-title-section">
              <h1 className="page-title">Deals</h1>
            </div>
          </div>
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span className="breadcrumb-current">Deals</span>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">Deals</h1>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/deals/pipeline')}>Pipeline View</button>
            <button className="btn btn-primary" onClick={() => navigate('/deals/new')}>Create Deal</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {accountIdFilter && (
        <div style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Filtered by Account: {accountIdFilter.substring(0, 8)}... (
          <Link to="/deals" style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>Clear</Link>
          )
        </div>
      )}

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search deals..."
      >
        <select
          className="form-select"
          value={stageFilter}
          onChange={(e) => {
            setStageFilter(e.target.value);
            if (pagination.page !== 1) {
              updatePagination({ ...pagination, page: 1 });
            }
          }}
          style={{ width: '200px' }}
        >
          <option value="">All Stages</option>
          {DEAL_STAGES.map(stage => (
            <option key={stage} value={stage}>{formatStage(stage)}</option>
          ))}
        </select>
      </SearchBar>

      {deals.length === 0 && !loading ? (
        <div className="content-section">
          <div className="section-body empty-state">
            <p className="empty-state-text">No deals found.</p>
            {!searchQuery && !stageFilter && !accountIdFilter && (
              <button className="btn btn-primary" onClick={() => navigate('/deals/new')}>Create Deal</button>
            )}
          </div>
        </div>
      ) : deals.length > 0 ? (
        <div className="content-section">
          <div className="section-body section-body-compact">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Account</th>
                    <th>Stage</th>
                    <th>Amount</th>
                    <th>Close Date</th>
                    <th>Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map(deal => (
                    <tr
                      key={deal.id}
                      onClick={() => navigate(`/deals/${deal.id}`)}
                    >
                      <td>{deal.name}</td>
                      <td>
                        {deal.account ? (
                          <Link to={`/accounts/${deal.account.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            {deal.account.name}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className={getStageBadgeClass(deal.stage)}>{formatStage(deal.stage)}</span>
                      </td>
                      <td>{formatAmount(deal.amount)}</td>
                      <td>{formatDate(deal.closeDate)}</td>
                      <td>{new Date(deal.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      <PaginationSimple
        pagination={pagination}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={(page: number) => setPagination({ ...pagination, page })}
      />
    </div>
  );
}
