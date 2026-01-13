import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Activity, PaginatedResponse, Deal, Account } from '../types';

export function Home() {
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ openDeals: 0, activitiesThisWeek: 0, totalAccounts: 0 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      // Load recent activities
      const activitiesRes = await api.activities.list(1, 3) as PaginatedResponse<Activity>;
      setRecentActivities(activitiesRes.items);

      // Load stats (simplified - in real app would have dedicated stats endpoint)
      const [dealsRes, accountsRes, allActivitiesRes] = await Promise.all([
        api.deals.list(1, 1000) as Promise<PaginatedResponse<Deal>>,
        api.accounts.list(1, 1000) as Promise<PaginatedResponse<Account>>,
        api.activities.list(1, 1000) as Promise<PaginatedResponse<Activity>>,
      ]);

      const openDeals = dealsRes.items.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length;
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const activitiesThisWeek = allActivitiesRes.items.filter(a => new Date(a.createdAt) >= weekAgo).length;

      setStats({
        openDeals,
        activitiesThisWeek,
        totalAccounts: accountsRes.items.length,
      });
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    return date.toLocaleDateString();
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">Home</h1>
            <div className="page-meta">
              <span>Welcome back</span>
            </div>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Open Deals</div>
          <div className="kpi-value">{stats.openDeals}</div>
          <div className="kpi-subtext">Active opportunities</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Activities This Week</div>
          <div className="kpi-value">{stats.activitiesThisWeek}</div>
          <div className="kpi-subtext">Recent activity</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Accounts</div>
          <div className="kpi-value">{stats.totalAccounts}</div>
          <div className="kpi-subtext">All accounts</div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="section-body">
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => navigate('/accounts/new')}>Create Account</button>
            <button className="btn btn-primary" onClick={() => navigate('/contacts/new')}>Create Contact</button>
            <button className="btn btn-primary" onClick={() => navigate('/deals/new')}>Create Deal</button>
            <button className="btn btn-secondary" onClick={() => navigate('/activities/new')}>Log Activity</button>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Recent Activities</h2>
          <Link to="/activities" className="section-action">View all</Link>
        </div>
        <div className="section-body">
          {loading ? (
            <div>Loading...</div>
          ) : recentActivities.length > 0 ? (
            <div className="timeline">
              {recentActivities.map(activity => (
                <div key={activity.id} className="timeline-entry">
                  <div className="timeline-entry-header">
                    <span className="timeline-entry-type">{activity.type.toUpperCase()}</span>
                    <div className="timeline-entry-content">
                      <div className="timeline-entry-title">
                        <Link to={`/activities/${activity.id}`}>{activity.subject}</Link>
                      </div>
                      <div className="timeline-entry-meta">
                        {formatTimestamp(activity.createdAt)}
                        {activity.account && (
                          <> • <Link to={`/accounts/${activity.account.id}`}>{activity.account.name}</Link></>
                        )}
                        {activity.deal && !activity.account && (
                          <> • <Link to={`/deals/${activity.deal.id}`}>{activity.deal.name}</Link></>
                        )}
                        {activity.contact && !activity.deal && !activity.account && (
                          <> • <Link to={`/contacts/${activity.contact.id}`}>{activity.contact.firstName} {activity.contact.lastName}</Link></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state-text">No activities yet</p>
              <button className="btn btn-primary" onClick={() => navigate('/activities/new')}>Log Activity</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
