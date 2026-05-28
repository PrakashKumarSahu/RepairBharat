import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import './App.css';
import { Dashboard } from './pages/Dashboard';
import { UserContextProvider } from './services/contexts';

function App() {
  return (
    <Routes>
        <Route path='/dashboard' element={<UserContextProvider><Dashboard /></UserContextProvider>} />
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
