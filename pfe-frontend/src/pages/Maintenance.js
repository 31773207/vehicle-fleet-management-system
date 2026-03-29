import React from "react";
import "./Dashboard.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";

import "./nav.css";

function Maintenance() {
      const navigate = useNavigate(); // ✅ THIS WAS MISSING

  return ( <div className="container">


      {/* Sidebar */}
      <div className="menu">
        <ul>

          {/* Profile */}
          <li className="profile">
            <div className="img-box">
            <i className="fas fa-user"></i>
            </div>
            <h2>Admin</h2>
          </li>

          {/* Menu Items */}
          <li onClick={() => navigate('/dashboard')}>
            <a>
              <i className="fas fa-home"></i>
              <p>Dashboard</p>
            </a>
          </li>

          <li onClick={() => navigate('/vehicles')}>
            <a>
              <i className="fas fa-car"></i>
              <p>Vehicles</p>
            </a>
          </li>

          <li onClick={() => navigate('/drivers')}>
            <a>
              <i className="fas fa-user"></i>
              <p>Drivers</p>
            </a>
          </li>

          <li onClick={() => navigate('/missions')}>
            <a>
              <i className="fas fa-id-card"></i>
              <p>Missions</p>
            </a>
          </li>

          <li onClick={() => navigate('/maintenance')}>
            <a className="active">
              <i className="fas fa-tools"></i>
              <p>Maintenance</p>
            </a>
          </li>

          <li onClick={() => navigate('/technical-checks')}>
            <a>
              <i className="fas fa-check"></i>
              <p>Technical Checks</p>
            </a>
          </li>

          <li className="logout">
            <a>
              <i className="fas fa-sign-out-alt"></i>
              <p>Logout</p>
            </a>
          </li>

        </ul>
      </div>
      
      {/* Main Content */}
      <div className="main">
        <h1>Maintenance Page</h1>
        <p>This is the maintenance page content.</p>
      </div>    
    
  </div>
   );
}
export default Maintenance;
