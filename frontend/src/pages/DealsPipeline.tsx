import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Deal, PaginatedResponse } from '../types';

const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;

export function DealsPipeline() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    try {
      setLoading(true);
      // Load all deals for pipeline view using pagination loop
      const allDeals: Deal[] = [];
      let page = 1;
      const pageSize = 100; // Backend max pageSize
      let totalPages = 1;

      do {
        const response = await api.deals.list(page, pageSize) as PaginatedResponse<Deal>;
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

  const dealsByStage = DEAL_STAGES.map(stage => ({
    stage,
    deals: deals.filter(deal => deal.stage === stage),
  }));

  if (loading) {
    return (
      <div>
        <h1>Pipeline</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/deals">Deals</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #ccc' }}>
        <h1>Pipeline</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/deals')}>Table View</button>
          <button onClick={() => navigate('/deals/new')}>Create Deal</button>
        </div>
      </div>

      {error && <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '20px' }}>Error: {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${DEAL_STAGES.length}, 1fr)`, gap: '20px', overflowX: 'auto' }}>
        {dealsByStage.map(({ stage, deals: stageDeals }) => (
          <div key={stage} style={{ minWidth: '200px' }}>
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #ccc' }}>
              <h2 style={{ fontSize: '16px', margin: 0, textTransform: 'capitalize' }}>{stage.replace('_', ' ')} ({stageDeals.length})</h2>
            </div>
            <div>
              {stageDeals.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #ccc' }}>
                  No deals
                </div>
              ) : (
                stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    onClick={() => navigate(`/deals/${deal.id}`)}
                    style={{
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ccc',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{deal.name}</div>
                    {deal.account && (
                      <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                        <Link to={`/accounts/${deal.account.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          {deal.account.name}
                        </Link>
                      </div>
                    )}
                    {deal.amount && (
                      <div style={{ fontSize: '12px' }}>{formatAmount(deal.amount)}</div>
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
