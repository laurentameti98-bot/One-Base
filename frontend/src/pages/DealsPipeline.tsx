import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Deal, PaginatedResponse } from '../types';

const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;

export function DealsPipeline() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const accountIdFilter = searchParams.get('accountId');

  useEffect(() => {
    loadDeals();
  }, [accountIdFilter]);

  async function loadDeals() {
    try {
      setLoading(true);
      // Load all deals for pipeline view using pagination loop
      const allDeals: Deal[] = [];
      let page = 1;
      const pageSize = 100; // Backend max pageSize
      let totalPages = 1;

      do {
        const response = await api.deals.list(
          page,
          pageSize,
          undefined,
          accountIdFilter || undefined,
          undefined
        ) as PaginatedResponse<Deal>;
        allDeals.push(...response.items);
        totalPages = response.pagination.totalPages;
        page++;
      } while (page <= totalPages);

      setDeals(allDeals);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const dealsByStage = DEAL_STAGES.map(stage => {
    const stageDeals = deals.filter(deal => deal.stage === stage);
    const totalAmount = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    return {
      stage,
      deals: stageDeals,
      totalAmount,
    };
  });

  function getStageDisplayName(stage: string): string {
    return stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="breadcrumb">
          <Link to="/deals">Deals</Link>
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
        <Link to="/deals">Deals</Link>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">Deals</h1>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/deals')}>List View</button>
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
          <Link to="/deals/pipeline" style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>Clear</Link>
          )
        </div>
      )}

      <div className="pipeline-container">
        {dealsByStage.map(({ stage, deals: stageDeals, totalAmount }) => (
          <div key={stage} className="pipeline-column">
            <div className="pipeline-column-header">
              <div className="pipeline-column-title">{getStageDisplayName(stage)}</div>
              <div className="pipeline-column-stats">
                {stageDeals.length} {stageDeals.length === 1 ? 'deal' : 'deals'} · {formatAmount(totalAmount)}
              </div>
            </div>
            <div className="pipeline-column-body">
              {stageDeals.length === 0 ? (
                <div className="pipeline-empty">
                  No deals
                </div>
              ) : (
                stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    className="deal-card"
                    onClick={() => navigate(`/deals/${deal.id}`)}
                  >
                    <div className="deal-card-title">{deal.name}</div>
                    {deal.account && (
                      <div className="deal-card-account">
                        <Link to={`/accounts/${deal.account.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          {deal.account.name}
                        </Link>
                      </div>
                    )}
                    {deal.amount && (
                      <div className="deal-card-meta">
                        <span>{formatAmount(deal.amount)}</span>
                        {deal.closeDate && <span>{formatDate(deal.closeDate)}</span>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
