import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { AccountsList } from './pages/AccountsList';
import { AccountDetail } from './pages/AccountDetail';
import { AccountCreate } from './pages/AccountCreate';
import { ContactsList } from './pages/ContactsList';
import { ContactDetail } from './pages/ContactDetail';
import { ContactCreate } from './pages/ContactCreate';
import { DealsList } from './pages/DealsList';
import { DealDetail } from './pages/DealDetail';
import { DealCreate } from './pages/DealCreate';
import { DealsPipeline } from './pages/DealsPipeline';
import { ActivitiesList } from './pages/ActivitiesList';
import { ActivityDetail } from './pages/ActivityDetail';
import { ActivityCreate } from './pages/ActivityCreate';
import { Admin } from './pages/Admin';
import { AdminDesign } from './pages/AdminDesign';

function App() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div>
      <nav className="nav">
        <div className="nav-tabs">
          <Link to="/" className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/accounts" className={`nav-tab ${isActive('/accounts') ? 'active' : ''}`}>
            Accounts
          </Link>
          <Link to="/contacts" className={`nav-tab ${isActive('/contacts') ? 'active' : ''}`}>
            Contacts
          </Link>
          <Link to="/deals" className={`nav-tab ${isActive('/deals') ? 'active' : ''}`}>
            Deals
          </Link>
          <Link to="/activities" className={`nav-tab ${isActive('/activities') ? 'active' : ''}`}>
            Activities
          </Link>
          <Link to="/admin" className={`nav-tab ${isActive('/admin') ? 'active' : ''}`}>
            Admin
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accounts" element={<AccountsList />} />
        <Route path="/accounts/new" element={<AccountCreate />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/contacts" element={<ContactsList />} />
        <Route path="/contacts/new" element={<ContactCreate />} />
        <Route path="/contacts/:id" element={<ContactDetail />} />
        <Route path="/deals" element={<DealsList />} />
        <Route path="/deals/new" element={<DealCreate />} />
        <Route path="/deals/pipeline" element={<DealsPipeline />} />
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="/activities" element={<ActivitiesList />} />
        <Route path="/activities/new" element={<ActivityCreate />} />
        <Route path="/activities/:id" element={<ActivityDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/design" element={<AdminDesign />} />
      </Routes>
    </div>
  );
}

export default App;
