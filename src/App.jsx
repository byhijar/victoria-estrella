import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RegisterSale from './pages/RegisterSale';
import History from './pages/History';
import Materials from './pages/Materials';
import Login from './pages/Login';
import { initializeUsers } from './services/userService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUsers(); // Ensure users exist
    const authStatus = localStorage.getItem('victoria_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    localStorage.setItem('victoria_auth', 'true');
    localStorage.setItem('victoria_user', user.displayName);
    localStorage.setItem('victoria_userId', user.id);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('victoria_auth');
    localStorage.removeItem('victoria_user');
    localStorage.removeItem('victoria_userId');
  };

  if (loading) return null;

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <Layout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vender" element={<RegisterSale />} />
            <Route path="/historial" element={<History />} />
            <Route path="/materiales" element={<Materials />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;
