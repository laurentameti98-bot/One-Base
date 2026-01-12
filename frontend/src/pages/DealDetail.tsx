import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Deal, Account, PaginatedResponse } from '../types';

const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;

export function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    name: '',
    stage: 'lead' as typeof DEAL_STAGES[number],
    amount: '',
    closeDate: '',
  });

  useEffect(() => {
    if (id) {
      loadDeal();
      loadAccounts();
    }
  }, [id]);

  async function loadDeal() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.deals.get(id) as Deal;
      setDeal(data);
      setFormData({
        accountId: data.accountId,
        name: data.name,
        stage: data.stage as typeof DEAL_STAGES[number],
        amount: data.amount ? data.amount.toString() : '',
        closeDate: data.closeDate ? new Date(data.closeDate).toISOString().split('T')[0] : '',
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deal');
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

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setFieldErrors({});
    try {
      const updated = await api.deals.update(id, {
        accountId: formData.accountId,
        name: formData.name,
        stage: formData.stage,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        closeDate: formData.closeDate ? new Date(formData.closeDate).toISOString() : undefined,
      }) as Deal;
      setDeal(updated);
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
        setError(err instanceof Error ? err.message : 'Failed to update deal');
      }
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Delete this deal?')) return;
    try {
      await api.deals.delete(id);
      navigate('/deals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deal');
    }
  }

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!deal) {
    return <div>Deal not found</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/deals">Deals</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #ccc' }}>
        <h1>{deal.name}</h1>
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
              {deal.account ? (
                <Link to={`/accounts/${deal.account.id}`}>{deal.account.name}</Link>
              ) : (
                deal.accountId
              )}
            </div>
          </div>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>Deal Information</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', margin: 0 }}>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Name:</dt>
              <dd style={{ margin: 0 }}>{deal.name}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Stage:</dt>
              <dd style={{ margin: 0 }}>{deal.stage}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Amount:</dt>
              <dd style={{ margin: 0 }}>{formatAmount(deal.amount)}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Close Date:</dt>
              <dd style={{ margin: 0 }}>{formatDate(deal.closeDate)}</dd>
            </dl>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>System Information</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', margin: 0 }}>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Created:</dt>
              <dd style={{ margin: 0 }}>{new Date(deal.createdAt).toLocaleString()}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Updated:</dt>
              <dd style={{ margin: 0 }}>{new Date(deal.updatedAt).toLocaleString()}</dd>
            </dl>
          </section>
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>Edit Deal</h2>
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
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Name:</label>
              <div>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.name && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.name}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Stage:</label>
              <div>
                <select value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value as typeof DEAL_STAGES[number] })} style={{ width: '100%', maxWidth: '400px' }}>
                  {DEAL_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                {fieldErrors.stage && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.stage}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Amount:</label>
              <div>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.amount && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.amount}</div>}
              </div>
              <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Close Date:</label>
              <div>
                <input type="date" value={formData.closeDate} onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
                {fieldErrors.closeDate && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.closeDate}</div>}
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => {
                setEditing(false);
                setError(null);
                setFieldErrors({});
                if (deal) {
                  setFormData({
                    accountId: deal.accountId,
                    name: deal.name,
                    stage: deal.stage as typeof DEAL_STAGES[number],
                    amount: deal.amount ? deal.amount.toString() : '',
                    closeDate: deal.closeDate ? new Date(deal.closeDate).toISOString().split('T')[0] : '',
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
