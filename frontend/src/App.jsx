import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/login';
import Signup from './pages/Signup';
import Dashboard from './pages/dashboard';
import TrackTicket from './pages/TrackTicket';
import DeviceManagement from './pages/DeviceManagement';
import './App.css';
import { UserContextProvider } from './services/contexts';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
    <UserContextProvider>
    <ErrorBoundary>
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path='/dashboard' element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        } />
        <Route path="/devices" element={
            <ProtectedRoute>
                <DeviceManagement />
            </ProtectedRoute>
        } />
        <Route path="/login" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/track/:ticketNumber" element={<TrackTicket />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
    </ErrorBoundary>
</UserContextProvider>
    </>

  );
}

export default App;
