import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const COLOR_TOKENS = [
  { id: 'c1', name: 'Primary', value: 'var(--color-primary)' },
  { id: 'c2', name: 'Primary Hover', value: 'var(--color-primary-hover)' },
  { id: 'c3', name: 'Primary Active', value: 'var(--color-primary-active)' },
  { id: 'c4', name: 'Background Primary', value: 'var(--color-bg-primary)' },
  { id: 'c5', name: 'Background Secondary', value: 'var(--color-bg-secondary)' },
  { id: 'c6', name: 'Border Light', value: 'var(--color-border-light)' },
  { id: 'c7', name: 'Text Primary', value: 'var(--color-text-primary)' },
  { id: 'c8', name: 'Text Secondary', value: 'var(--color-text-secondary)' },
  { id: 'c9', name: 'Success', value: 'var(--color-success)' },
  { id: 'c10', name: 'Error', value: 'var(--color-error)' },
];

const TYPOGRAPHY_TOKENS = [
  { id: 't1', name: 'Font Family', value: 'var(--font-family)' },
  { id: 't2', name: 'Base Size', value: 'var(--font-size-base)' },
  { id: 't3', name: 'Large Size', value: 'var(--font-size-lg)' },
  { id: 't4', name: 'XL Size', value: 'var(--font-size-xl)' },
  { id: 't5', name: 'Heading Size', value: 'var(--font-size-2xl)' },
  { id: 't6', name: 'Weight Normal', value: 'var(--font-weight-normal)' },
  { id: 't7', name: 'Weight Medium', value: 'var(--font-weight-medium)' },
  { id: 't8', name: 'Weight Bold', value: 'var(--font-weight-bold)' },
  { id: 't9', name: 'Line Height', value: 'var(--line-height-normal)' },
];

export function AdminDesign() {
  const [colorSearch, setColorSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const location = useLocation();

  const filteredColors = COLOR_TOKENS.filter((token) =>
    token.name.toLowerCase().includes(colorSearch.toLowerCase())
  );
  const filteredTypography = TYPOGRAPHY_TOKENS.filter((token) =>
    token.name.toLowerCase().includes(typeSearch.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <a href="/admin">Admin</a>
        <span>›</span>
        <span className="breadcrumb-current">Design</span>
      </div>

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">Design Settings</h1>
            <div className="page-subtitle">Review tokens for colors and typography</div>
            <div className="page-meta">
              <span>Source: tokens.css</span>
              <span>|</span>
              <span>Changes require design review</span>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary">Request Update</button>
            <button className="btn btn-primary">Export Tokens</button>
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

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Color Tokens</h2>
          <span className="section-action">Read-only</span>
        </div>
        <div className="section-body">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search colors..."
              value={colorSearch}
              onChange={(event) => setColorSearch(event.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Token</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                {filteredColors.map((token) => (
                  <tr key={token.id}>
                    <td>{token.name}</td>
                    <td>{token.value}</td>
                    <td className="muted">Global</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Typography Tokens</h2>
          <span className="section-action">Read-only</span>
        </div>
        <div className="section-body">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search typography..."
              value={typeSearch}
              onChange={(event) => setTypeSearch(event.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Token</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                {filteredTypography.map((token) => (
                  <tr key={token.id}>
                    <td>{token.name}</td>
                    <td>{token.value}</td>
                    <td className="muted">Global</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
