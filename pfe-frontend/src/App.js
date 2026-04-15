import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Missions from './pages/Missions';
import Maintenance from './pages/Maintenance';
import TechnicalChecks from './pages/TechnicalChecks'; // ✅ ADDED
import GasCoupons from './pages/GasCoupons';           // ✅ ADDED
import CartNaftal from './pages/CartNaftal';           // ✅ ADDED

function App() {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard"        element={isLoggedIn ? <Dashboard />       : <Navigate to="/login" />} />
        <Route path="/vehicles"         element={isLoggedIn ? <Vehicles />        : <Navigate to="/login" />} />
        <Route path="/drivers"          element={isLoggedIn ? <Drivers />         : <Navigate to="/login" />} />
        <Route path="/missions"         element={isLoggedIn ? <Missions />        : <Navigate to="/login" />} />
        <Route path="/maintenance"      element={isLoggedIn ? <Maintenance />     : <Navigate to="/login" />} />
        <Route path="/technical-checks" element={isLoggedIn ? <TechnicalChecks /> : <Navigate to="/login" />} /> {/* ✅ ADDED */}
        <Route path="/gas-coupons"      element={isLoggedIn ? <GasCoupons />      : <Navigate to="/login" />} /> {/* ✅ ADDED */}
        <Route path="/cart-naftal"      element={isLoggedIn ? <CartNaftal />      : <Navigate to="/login" />} /> {/* ✅ ADDED */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;