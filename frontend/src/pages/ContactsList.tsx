import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Contact, PaginatedResponse } from '../types';
import { formatDate } from '../utils/formatters';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { usePagination } from '../hooks/usePagination';
import { PaginationNumbered } from '../components/PaginationNumbered';
import { SearchBar } from '../components/SearchBar';

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pagination, setPagination, updatePagination, startIndex, endIndex } = usePagination(20);
  const [searchQuery, setSearchQuery] = useState('');
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
    loadContacts();
  }, [pagination.page, debouncedSearchQuery, accountIdFilter]);

  async function loadContacts() {
    try {
      // Only set loading to true if not already loading to avoid unnecessary re-renders
      if (!loading) {
        setLoading(true);
      }
      const response = await api.contacts.list(
        pagination.page,
        pagination.pageSize,
        debouncedSearchQuery || undefined,
        accountIdFilter || undefined
      ) as PaginatedResponse<Contact>;
      setContacts(response.items);
      updatePagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }



  // Removed early return to prevent input focus loss when loading state changes
  // The table structure is now always rendered, preventing DOM unmounting

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span className="breadcrumb-current">Contacts</span>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">Contacts</h1>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/contacts/new')}>Create Contact</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {accountIdFilter && (
        <div className="filter-indicator">
          Filtered by Account: {accountIdFilter.substring(0, 8)}... (
          <Link to="/contacts">Clear</Link>
          )
        </div>
      )}

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search contacts..."
      >
        <select className="form-select select-200">
          <option>All Accounts</option>
        </select>
      </SearchBar>

      <div className="content-section">
        <div className="section-body section-body-compact">
          {loading && contacts.length === 0 ? (
            <div className="empty-state text-center">Loading...</div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Account</th>
                      <th>Title</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Last Contacted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={6} className="text-center" style={{ padding: 'var(--space-lg)' }}>
                          <div className="empty-state">
                            <p className="empty-state-text">No contacts found.</p>
                            {!searchQuery && !accountIdFilter && (
                              <button className="btn btn-primary" onClick={() => navigate('/contacts/new')}>Create Contact</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      contacts.map(contact => (
                        <tr
                          key={contact.id}
                          onClick={() => navigate(`/contacts/${contact.id}`)}
                        >
                          <td>
                            <Link to={`/contacts/${contact.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                              {contact.firstName} {contact.lastName}
                            </Link>
                          </td>
                          <td>
                            {contact.account ? (
                              <Link to={`/accounts/${contact.account.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                {contact.account.name}
                              </Link>
                            ) : (
                              <span className="field-value-empty">—</span>
                            )}
                          </td>
                          <td>{contact.title || <span className="field-value-empty">—</span>}</td>
                          <td>
                            {contact.email ? (
                              <a href={`mailto:${contact.email}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                {contact.email}
                              </a>
                            ) : (
                              <span className="field-value-empty">—</span>
                            )}
                          </td>
                          <td>{contact.phone || <span className="field-value-empty">—</span>}</td>
                          <td>{formatDate(contact.updatedAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationNumbered
                pagination={pagination}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={(page: number) => setPagination({ ...pagination, page })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
