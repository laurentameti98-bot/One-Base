import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Activity, PaginatedResponse } from '../types';
import { formatDate, formatTimestamp } from '../utils/formatters';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { usePagination } from '../hooks/usePagination';
import { PaginationSimple } from '../components/PaginationSimple';
import { SearchBar } from '../components/SearchBar';

const ACTIVITY_TYPES = ['call', 'meeting', 'email', 'task'] as const;

export function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pagination, setPagination, updatePagination, startIndex, endIndex } = usePagination(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const accountIdFilter = searchParams.get('accountId');
  const contactIdFilter = searchParams.get('contactId');
  const dealIdFilter = searchParams.get('dealId');
  const debouncedSearchQuery = useDebouncedSearch(searchQuery, 300, () => {
    // Reset to page 1 when search changes (only if not already page 1)
    if (pagination.page !== 1) {
      updatePagination({ ...pagination, page: 1 });
    }
  });

  useEffect(() => {
    loadActivities();
  }, [pagination.page, debouncedSearchQuery, typeFilter, accountIdFilter, contactIdFilter, dealIdFilter]);

  async function loadActivities() {
    try {
      // Only set loading to true if not already loading to avoid unnecessary re-renders
      if (!loading) {
        setLoading(true);
      }
      const response = await api.activities.list(
        pagination.page,
        pagination.pageSize,
        debouncedSearchQuery || undefined,
        accountIdFilter || undefined,
        contactIdFilter || undefined,
        dealIdFilter || undefined,
        typeFilter || undefined
      ) as PaginatedResponse<Activity>;

      setActivities(response.items);
      updatePagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }



  const activeFilter = accountIdFilter || contactIdFilter || dealIdFilter;

  if (loading && activities.length === 0) {
    return (
      <div className="page-container">
        <div className="breadcrumb">
          <span className="breadcrumb-current">Activities</span>
        </div>
        <div className="page-header">
          <div className="page-header-top">
            <div className="page-header-title-section">
              <h1 className="page-title">Activities</h1>
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
        <span className="breadcrumb-current">Activities</span>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">Activities</h1>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/activities/new')}>Log Activity</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {activeFilter && (
        <div style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Filtered by: {accountIdFilter && `Account: ${accountIdFilter.substring(0, 8)}...`}
          {contactIdFilter && `Contact: ${contactIdFilter.substring(0, 8)}...`}
          {dealIdFilter && `Deal: ${dealIdFilter.substring(0, 8)}...`}
          {' '}(<Link to="/activities" style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>Clear</Link>)
        </div>
      )}

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search activities..."
      >
        <select
          className="form-select"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            if (pagination.page !== 1) {
              updatePagination({ ...pagination, page: 1 });
            }
          }}
          style={{ width: '200px' }}
        >
          <option value="">All Activities</option>
          {ACTIVITY_TYPES.map(type => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>
      </SearchBar>

      {activities.length === 0 && !loading ? (
        <div className="content-section">
          <div className="section-body empty-state">
            <p className="empty-state-text">No activities found.</p>
            {!searchQuery && !typeFilter && !activeFilter && (
              <button className="btn btn-primary" onClick={() => navigate('/activities/new')}>Log Activity</button>
            )}
          </div>
        </div>
      ) : activities.length > 0 ? (
        <div className="content-section">
          <div className="section-body">
            <div className="timeline">
              {activities.map(activity => {
                const isExpanded = expandedActivityId === activity.id;
                return (
                  <div
                    key={activity.id}
                    className="timeline-entry"
                    onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}
                  >
                    <div className="timeline-entry-header">
                      <span className="timeline-entry-type">{activity.type.toUpperCase()}</span>
                      <div className="timeline-entry-content">
                        <div className="timeline-entry-title">
                          <Link to={`/activities/${activity.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            {activity.subject}
                          </Link>
                        </div>
                        <div className="timeline-entry-meta">
                          {formatTimestamp(activity.createdAt)}
                          {activity.deal && (
                            <> • <Link to={`/deals/${activity.deal.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Deal: {activity.deal.name}</Link></>
                          )}
                          {activity.contact && !activity.deal && (
                            <> • <Link to={`/contacts/${activity.contact.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Contact: {activity.contact.firstName} {activity.contact.lastName}</Link></>
                          )}
                          {activity.account && !activity.deal && !activity.contact && (
                            <> • <Link to={`/accounts/${activity.account.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Account: {activity.account.name}</Link></>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="timeline-entry-details expanded">
                        {activity.body && (
                          <div className="timeline-entry-notes">
                            {activity.body}
                          </div>
                        )}
                        {activity.status && (
                          <div className="timeline-entry-details-row">
                            <div className="timeline-entry-details-label">Status:</div>
                            <div>{activity.status}</div>
                          </div>
                        )}
                        {activity.dueDate && (
                          <div className="timeline-entry-details-row">
                            <div className="timeline-entry-details-label">Due Date:</div>
                            <div>{formatDate(activity.dueDate)}</div>
                          </div>
                        )}
                        <div className="timeline-entry-actions">
                          <Link to={`/activities/${activity.id}`} className="btn btn-sm btn-secondary">View Details</Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
