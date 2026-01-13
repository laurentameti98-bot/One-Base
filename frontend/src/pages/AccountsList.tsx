import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Account, PaginatedResponse } from '../types';
import { formatDate } from '../utils/formatters';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { usePagination } from '../hooks/usePagination';
import { PaginationNumbered } from '../components/PaginationNumbered';
import { SearchBar } from '../components/SearchBar';

export function AccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pagination, setPagination, updatePagination, startIndex, endIndex } = usePagination(20);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const debouncedSearchQuery = useDebouncedSearch(searchQuery, 300, () => {
    // Reset to page 1 when search changes (only if not already page 1)
    if (pagination.page !== 1) {
      updatePagination({ ...pagination, page: 1 });
    }
  });

  useEffect(() => {
    loadAccounts();
  }, [pagination.page, debouncedSearchQuery]);

  async function loadAccounts() {
    try {
      setLoading(true);
      const response = await api.accounts.list(pagination.page, pagination.pageSize, debouncedSearchQuery || undefined) as PaginatedResponse<Account>;
      setAccounts(response.items);
      updatePagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }



  if (loading && accounts.length === 0) {
    return (
      <div className="page-container">
        <div className="breadcrumb">
          <span className="breadcrumb-current">Accounts</span>
        </div>
        <div className="page-header">
          <div className="page-header-top">
            <div className="page-header-title-section">
              <h1 className="page-title">Accounts</h1>
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
        <span className="breadcrumb-current">Accounts</span>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">Accounts</h1>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/accounts/new')}>Create Account</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search accounts..."
      >
        <select className="form-select" style={{ width: '200px' }}>
          <option>All Industries</option>
        </select>
      </SearchBar>

      {accounts.length === 0 && !loading ? (
        <div className="content-section">
          <div className="section-body empty-state">
            <p className="empty-state-text">No accounts found.</p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={() => navigate('/accounts/new')}>Create Account</button>
            )}
          </div>
        </div>
      ) : accounts.length > 0 ? (
        <div className="content-section">
          <div className="section-body section-body-compact">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Industry</th>
                    <th>Website</th>
                    <th>Phone</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => (
                    <tr
                      key={account.id}
                      onClick={() => navigate(`/accounts/${account.id}`)}
                    >
                      <td>
                        <Link to={`/accounts/${account.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          {account.name}
                        </Link>
                      </td>
                      <td>{account.industry || <span className="field-value-empty">—</span>}</td>
                      <td>
                        {account.website ? (
                          <a href={account.website.startsWith('http') ? account.website : `https://${account.website}`} target="_blank" rel="noopener noreferrer" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            {account.website}
                          </a>
                        ) : (
                          <span className="field-value-empty">—</span>
                        )}
                      </td>
                      <td>{account.phone || <span className="field-value-empty">—</span>}</td>
                      <td>{formatDate(account.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationNumbered
              pagination={pagination}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={(page: number) => setPagination({ ...pagination, page })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
