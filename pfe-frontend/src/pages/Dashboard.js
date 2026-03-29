import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";
import "./nav.css";
import "./Dashboard.css";

function Dashboard() {

  const navigate = useNavigate();

  return (
 <div className="container">

     {/* Sidebar */}
        <div className="menu">
          <ul>
            <li className="profile">
            <div className="img-box">
            <i className="fas fa-user"></i>
            </div>
            <h2>Admin</h2>
          </li>
            <li onClick={() => navigate('/dashboard')}>
              <a className="active" ><i className="fas fa-home"></i><p>Dashboard</p></a>
            </li>
            <li onClick={() => navigate('/vehicles')}>
              <a><i className="fas fa-car"></i><p>Vehicles</p></a>
            </li>
            <li onClick={() => navigate('/drivers')}>
              <a ><i className="fas fa-user"></i><p>Drivers</p></a>
            </li>
            <li onClick={() => navigate('/missions')}>
              <a><i className="fas fa-id-card"></i><p>Missions</p></a>
            </li>
            <li onClick={() => navigate('/maintenance')}>
              <a><i className="fas fa-tools"></i><p>Maintenance</p></a>
            </li>
            <li onClick={() => navigate('/technical-checks')}>
              <a><i className="fas fa-check"></i><p>Technical Checks</p></a>
            </li>
            <li className="logout">
              <a onClick={() => { localStorage.clear(); navigate('/login'); }}>
                <i className="fas fa-sign-out-alt"></i><p>Logout</p>
              </a>
            </li>
          </ul>
        </div>

      {/* Content */}
      <div className="content">
        <h1>Dashboard</h1>
       {/* CONTENT */}
          <div className="content-header">
            <h2>Drivers List</h2>
            <button className="btn-add" onClick={() => navigate('/drivers')}>
              + Add New Driver
            </button>
          </div>
      </div>

</div>
  );
}

export default Dashboard;