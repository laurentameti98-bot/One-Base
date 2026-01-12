import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Account } from '../types';

export function AccountCreate() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ name: '', industry: '', website: '', phone: '' });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    try {
      const account = await api.accounts.create({
        name: formData.name,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
      }) as Account;
      navigate(`/accounts/${account.id}`);
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
        setError(err instanceof Error ? err.message : 'Failed to create account');
      }
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/accounts">Accounts</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #ccc' }}>
        <h1>Create Account</h1>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '20px' }}>
          <strong>Validation Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleCreate} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Name:</label>
          <div>
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
            {fieldErrors.name && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.name}</div>}
          </div>
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Industry:</label>
          <div>
            <input value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
            {fieldErrors.industry && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.industry}</div>}
          </div>
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Website:</label>
          <div>
            <input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
            {fieldErrors.website && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.website}</div>}
          </div>
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Phone:</label>
          <div>
            <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
            {fieldErrors.phone && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.phone}</div>}
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit">Create</button>
          <button type="button" onClick={() => navigate('/accounts')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
