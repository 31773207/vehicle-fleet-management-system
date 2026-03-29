import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Missions from './pages/Missions';
import Maintenance from './pages/Maintenance';

function App() {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
         <Route path="/login" element={<Login />} /> 
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/vehicles" element={isLoggedIn ? <Vehicles /> : <Navigate to="/login" />} />
        <Route path="/drivers" element={isLoggedIn ? <Drivers /> : <Navigate to="/login" />} />
        <Route path="/missions" element={isLoggedIn ? <Missions /> : <Navigate to="/login" />} />
        <Route path="/maintenance" element={isLoggedIn ? <Maintenance /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;