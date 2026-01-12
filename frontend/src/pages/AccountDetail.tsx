import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Account, Deal } from '../types';

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', industry: '', website: '', phone: '' });

  useEffect(() => {
    if (id) loadAccount();
  }, [id]);

  async function loadAccount() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.accounts.get(id) as Account;
      setAccount(data);
      setFormData({
        name: data.name,
        industry: data.industry || '',
        website: data.website || '',
        phone: data.phone || '',
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setFieldErrors({});
    try {
      const updated = await api.accounts.update(id, {
        name: formData.name,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
      }) as Account;
      setAccount(updated);
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
        setError(err instanceof Error ? err.message : 'Failed to update account');
      }
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Delete this account?')) return;
    try {
      await api.accounts.delete(id);
      navigate('/accounts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!account) {
    return <div>Account not found</div>;
  }

  const contacts = account.contacts || [];
  const displayContacts = contacts.slice(0, 5);
  const hasMoreContacts = contacts.length > 5;

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/accounts">Accounts</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #ccc' }}>
        <h1>{account.name}</h1>
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
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>Account Information</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', margin: 0 }}>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Name:</dt>
              <dd style={{ margin: 0 }}>{account.name}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Industry:</dt>
              <dd style={{ margin: 0 }}>{account.industry || '—'}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Website:</dt>
              <dd style={{ margin: 0 }}>{account.website || '—'}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Phone:</dt>
              <dd style={{ margin: 0 }}>{account.phone || '—'}</dd>
            </dl>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>System Information</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', margin: 0 }}>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Created:</dt>
              <dd style={{ margin: 0 }}>{new Date(account.createdAt).toLocaleString()}</dd>
              <dt style={{ fontWeight: 'bold', margin: 0 }}>Updated:</dt>
              <dd style={{ margin: 0 }}>{new Date(account.updatedAt).toLocaleString()}</dd>
            </dl>
          </section>

          {contacts.length > 0 && (
            <section style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Contacts ({contacts.length})</h2>
                {hasMoreContacts && (
                  <Link to={`/contacts?accountId=${account.id}`}>View all</Link>
                )}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Title</th>
                  </tr>
                </thead>
                <tbody>
                  {displayContacts.map(contact => (
                    <tr key={contact.id}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <Link to={`/contacts/${contact.id}`}>{contact.firstName} {contact.lastName}</Link>
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{contact.email || '—'}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{contact.title || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {(() => {
            const deals = account.deals || [];
            const displayDeals = deals.slice(0, 5);
            const hasMoreDeals = deals.length > 5;

            function formatAmount(amount: number | null | undefined): string {
              if (amount === null || amount === undefined) return '—';
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(amount);
            }

            return (
              <section style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h2 style={{ fontSize: '18px', margin: 0 }}>Deals ({deals.length})</h2>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => navigate(`/deals/new?accountId=${account.id}`)}>Create Deal</button>
                    {hasMoreDeals && (
                      <Link to={`/deals?accountId=${account.id}`}>View all</Link>
                    )}
                  </div>
                </div>
                {deals.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Stage</th>
                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayDeals.map((deal: Deal) => (
                        <tr key={deal.id}>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            <Link to={`/deals/${deal.id}`}>{deal.name}</Link>
                          </td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{deal.stage}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{formatAmount(deal.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc' }}>
                    <p>No deals yet.</p>
                  </div>
                )}
              </section>
            );
          })()}
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>Edit Account</h2>
          <form onSubmit={handleUpdate} noValidate>
            {error && (
              <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '10px' }}>
                <strong>Validation Error:</strong> {error}
              </div>
            )}
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
              <button type="submit">Save</button>
              <button type="button" onClick={() => {
                setEditing(false);
                setError(null);
                setFieldErrors({});
                if (account) {
                  setFormData({
                    name: account.name,
                    industry: account.industry || '',
                    website: account.website || '',
                    phone: account.phone || '',
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
