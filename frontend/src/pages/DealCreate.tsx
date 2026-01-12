import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Deal, Account, PaginatedResponse } from '../types';

const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;

export function DealCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    accountId: searchParams.get('accountId') || '',
    name: '',
    stage: 'lead' as typeof DEAL_STAGES[number],
    amount: '',
    closeDate: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

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
    setError(null);
    setFieldErrors({});
    try {
      const deal = await api.deals.create({
        accountId: formData.accountId,
        name: formData.name,
        stage: formData.stage,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        closeDate: formData.closeDate ? new Date(formData.closeDate).toISOString() : undefined,
      }) as Deal;
      navigate(`/deals/${deal.id}`);
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
        setError(err instanceof Error ? err.message : 'Failed to create deal');
      }
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/deals">Deals</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #ccc' }}>
        <h1>Create Deal</h1>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '20px' }}>
          <strong>Validation Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleCreate} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Account:</label>
          <div>
            <select value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} style={{ width: '100%', maxWidth: '400px' }}>
              <option value="">Select account</option>
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
          <button type="submit">Create</button>
          <button type="button" onClick={() => navigate('/deals')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
