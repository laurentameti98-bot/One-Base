import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api, ValidationError } from '../api/client';
import { Contact, Account, PaginatedResponse } from '../types';

export function ContactCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ accountId: searchParams.get('accountId') || '', firstName: '', lastName: '', email: '', phone: '', title: '' });

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
      const contact = await api.contacts.create({
        accountId: formData.accountId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        title: formData.title || undefined,
      }) as Contact;
      navigate(`/contacts/${contact.id}`);
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
        setError(err instanceof Error ? err.message : 'Failed to create contact');
      }
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/contacts">Contacts</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #ccc' }}>
        <h1>Create Contact</h1>
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
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>First Name:</label>
          <div>
            <input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
            {fieldErrors.firstName && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.firstName}</div>}
          </div>
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Last Name:</label>
          <div>
            <input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
            {fieldErrors.lastName && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.lastName}</div>}
          </div>
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Email:</label>
          <div>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
            {fieldErrors.email && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.email}</div>}
          </div>
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Phone:</label>
          <div>
            <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
            {fieldErrors.phone && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.phone}</div>}
          </div>
          <label style={{ fontWeight: 'bold', alignSelf: 'center' }}>Title:</label>
          <div>
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', maxWidth: '400px' }} />
            {fieldErrors.title && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{fieldErrors.title}</div>}
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit">Create</button>
          <button type="button" onClick={() => navigate('/contacts')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
