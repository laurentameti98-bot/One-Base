import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Activity, PaginatedResponse } from '../types';

export function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadActivities();
  }, [pagination.page, searchQuery]);

  async function loadActivities() {
    try {
      setLoading(true);
      const response = await api.activities.list(
        pagination.page,
        pagination.pageSize,
        searchQuery || undefined
      ) as PaginatedResponse<Activity>;
      setActivities(response.items);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }

  const startIndex = pagination.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.total);

  function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  }

  function getRelatedTo(activity: Activity): string {
    if (activity.deal) {
      return `Deal: ${activity.deal.name}`;
    }
    if (activity.contact) {
      return `Contact: ${activity.contact.firstName} ${activity.contact.lastName}`;
    }
    if (activity.account) {
      return `Account: ${activity.account.name}`;
    }
    return '—';
  }

  function getRelatedLink(activity: Activity): string | null {
    if (activity.dealId) {
      return `/deals/${activity.dealId}`;
    }
    if (activity.contactId) {
      return `/contacts/${activity.contactId}`;
    }
    if (activity.accountId) {
      return `/accounts/${activity.accountId}`;
    }
    return null;
  }

  if (loading && activities.length === 0) {
    return (
      <div>
        <h1>Activities</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        <Link to="/">Home</Link> / Activities
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Activities</h1>
        <button onClick={() => navigate('/activities/new')}>Create Activity</button>
      </div>

      {error && <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '10px' }}>Error: {error}</div>}
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
        />
      </div>

      {pagination.total > 0 && (
        <div style={{ marginBottom: '10px' }}>
          Showing {startIndex}–{endIndex} of {pagination.total}
        </div>
      )}

      {activities.length === 0 && !loading ? (
        <div style={{ padding: '40px', textAlign: 'center', border: '1px solid #ccc' }}>
          <p>No activities found.</p>
          {!searchQuery && (
            <button onClick={() => navigate('/activities/new')}>Create Activity</button>
          )}
        </div>
      ) : activities.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Subject</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Related To</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Due Date</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ccc' }}>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(activity => {
              const relatedLink = getRelatedLink(activity);
              return (
                <tr
                  key={activity.id}
                  onClick={() => navigate(`/activities/${activity.id}`)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{activity.type}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{activity.subject}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    {relatedLink ? (
                      <Link to={relatedLink} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        {getRelatedTo(activity)}
                      </Link>
                    ) : (
                      getRelatedTo(activity)
                    )}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{formatDate(activity.dueDate)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{new Date(activity.updatedAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}

      {pagination.totalPages > 1 && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>Previous</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>Next</button>
        </div>
      )}
    </div>
  );
}
