import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RegisterSale from './pages/RegisterSale';
import History from './pages/History';
import Materials from './pages/Materials';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vender" element={<RegisterSale />} />
          <Route path="/historial" element={<History />} />
          <Route path="/materiales" element={<Materials />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
