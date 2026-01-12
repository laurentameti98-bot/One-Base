import { Routes, Route, Link } from 'react-router-dom';
import { AccountsList } from './pages/AccountsList';
import { AccountDetail } from './pages/AccountDetail';
import { ContactsList } from './pages/ContactsList';
import { ContactDetail } from './pages/ContactDetail';

function App() {
  return (
    <div>
      <nav>
        <Link to="/accounts">Accounts</Link> | <Link to="/contacts">Contacts</Link>
      </nav>
      <Routes>
        <Route path="/accounts" element={<AccountsList />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/contacts" element={<ContactsList />} />
        <Route path="/contacts/:id" element={<ContactDetail />} />
      </Routes>
    </div>
  );
}

export default App;
