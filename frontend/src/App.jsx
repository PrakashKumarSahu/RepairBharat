import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import './App.css';
import { UserContextProvider } from './services/contexts';

function App() {
  return (
    <>
    {/* <UserContextProvider> */}
    <Routes>
        <Route path='/dashboard' element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
    </Routes>
{/* </UserContextProvider> */}
    </>

  );
}

export default App;
