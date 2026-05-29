import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TrackTicket from './pages/TrackTicket';
import './App.css';
import { UserContextProvider } from './services/contexts';

function App() {
  return (
    <>
    <UserContextProvider>
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path="/login" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/track/:ticketNumber" element={<TrackTicket />} />
    </Routes>
</UserContextProvider>
    </>

  );
}

export default App;
