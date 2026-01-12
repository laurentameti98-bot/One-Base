import { Routes, Route, Link } from 'react-router-dom';
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

function App() {
  return (
    <div>
      <nav>
        <Link to="/accounts">Accounts</Link> | <Link to="/contacts">Contacts</Link> | <Link to="/deals">Deals</Link> | <Link to="/activities">Activities</Link>
      </nav>
      <Routes>
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
      </Routes>
    </div>
  );
}

export default App;
