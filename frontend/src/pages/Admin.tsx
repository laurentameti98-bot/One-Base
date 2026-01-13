import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';

const ADMIN_USERS = [
  {
    id: 'u1',
    name: 'Jordan Lee',
    email: 'jordan.lee@crm.io',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Jan 14, 2026',
  },
  {
    id: 'u2',
    name: 'Priya Patel',
    email: 'priya.patel@crm.io',
    role: 'Manager',
    status: 'Active',
    lastActive: 'Jan 13, 2026',
  },
  {
    id: 'u3',
    name: 'Dylan Cruz',
    email: 'dylan.cruz@crm.io',
    role: 'Sales',
    status: 'Suspended',
    lastActive: 'Dec 20, 2025',
  },
];

const ROLE_POLICIES = [
  { id: 'r1', role: 'Admin', scope: 'Full access', seats: '3' },
  { id: 'r2', role: 'Manager', scope: 'Team-level access', seats: '12' },
  { id: 'r3', role: 'Sales', scope: 'Assigned accounts only', seats: '48' },
];

const AUDIT_ENTRIES = [
  {
    id: 'a1',
    title: 'Password reset issued for Dylan Cruz',
    meta: 'Today at 9:10 AM | Actioned by Jordan Lee',
    type: 'Security',
  },
  {
    id: 'a2',
    title: 'Role updated: Priya Patel → Manager',
    meta: 'Yesterday at 4:02 PM | Actioned by Jordan Lee',
    type: 'Access',
  },
  {
    id: 'a3',
    title: 'New API key generated for CRM Integrations',
    meta: 'Jan 12, 2026 at 11:20 AM | Actioned by Priya Patel',
    type: 'Integrations',
  },
];

export function Admin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const location = useLocation();

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span className="breadcrumb-current">Admin</span>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">Admin</h1>
            <div className="page-subtitle">Manage access, policies, and system health</div>
            <div className="page-meta">
              <span>Workspace: North America</span>
              <span>|</span>
              <span>Security Level: Standard</span>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary">Security Settings</button>
            <button className="btn btn-primary">Invite User</button>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-body">
          <div className="nav-tabs">
            <Link
              to="/admin"
              className={`nav-tab ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Overview
            </Link>
            <Link
              to="/admin/design"
              className={`nav-tab ${location.pathname.startsWith('/admin/design') ? 'active' : ''}`}
            >
              Design
            </Link>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Active Users</div>
          <div className="kpi-value">63</div>
          <div className="kpi-subtext">4 pending invites</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Open Permissions</div>
          <div className="kpi-value">12</div>
          <div className="kpi-subtext">Policies needing review</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Security Alerts</div>
          <div className="kpi-value">2</div>
          <div className="kpi-subtext">Last 7 days</div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">User Management</h2>
          <a className="section-action" href="#">Export</a>
        </div>
        <div className="section-body">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users..."
          >
            <select
              className="form-select"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Sales">Sales</option>
            </select>
          </SearchBar>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_USERS.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge badge-primary">{user.role}</span>
                    </td>
                    <td>
                      <span className={user.status === 'Active' ? 'badge badge-success' : 'badge'}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastActive}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Access Policies</h2>
          <a className="section-action" href="/admin/design">Design settings</a>
        </div>
        <div className="section-body section-body-compact">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Access Scope</th>
                  <th>Assigned Seats</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ROLE_POLICIES.map((policy) => (
                  <tr key={policy.id}>
                    <td>{policy.role}</td>
                    <td>{policy.scope}</td>
                    <td>{policy.seats}</td>
                    <td>
                      <span className="badge">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Audit Log</h2>
          <a className="section-action" href="#">View all</a>
        </div>
        <div className="section-body">
          <div className="timeline">
            {AUDIT_ENTRIES.map((entry) => (
              <div className="timeline-entry" key={entry.id}>
                <div className="timeline-entry-header">
                  <span className="timeline-entry-type">{entry.type}</span>
                  <div className="timeline-entry-content">
                    <div className="timeline-entry-title">{entry.title}</div>
                    <div className="timeline-entry-meta">{entry.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
