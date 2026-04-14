import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Missions.css';
import "./nav.css";

const API = 'http://localhost:8080/api';

function Missions() {
  const [missions, setMissions] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    destination: '',
    purpose: '',
    startDate: '',
    endDate: '',
    missionType: 'SHORT',
    driver: { id: '' },
    vehicle: { id: '' }
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await axios.get(`${API}/missions`, { headers });
      setMissions(res.data);
    } catch (err) {
      console.error('Error fetching missions:', err);
    }
  };

  const fetchAvailableDrivers = async () => {
  try {
    const res = await axios.get(`${API}/employees`, { headers });
    // Filter: employeeType = 'DRIVER' AND employeeStatus = 'AVAILABLE'
    const availableDrivers = res.data.filter(
      e => e.employeeType === 'DRIVER' && e.employeeStatus === 'AVAILABLE'
    );
    console.log('Available drivers:', availableDrivers);
    setAvailableDrivers(availableDrivers);
  } catch (err) {
    console.error('Error fetching drivers:', err);
  }
};

  const fetchAvailableVehicles = async () => {
    try {
      const res = await axios.get(`${API}/vehicles`, { headers });
      //FIX: Use 'AVAILABLE' instead of 'ACTIVE'
      setAvailableVehicles(res.data.filter(v => v.status === 'AVAILABLE'));
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleOpenForm = () => {
    fetchAvailableDrivers();
    fetchAvailableVehicles();
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/missions`, form, { headers });
      setShowForm(false);
      resetForm();
      fetchMissions();
    } catch (err) {
      console.error('Error creating mission:', err);
      alert('Error creating mission!');
    }
  };

  const resetForm = () => {
    setForm({
      destination: '', purpose: '', startDate: '',
      endDate: '', missionType: 'SHORT',
      driver: { id: '' }, vehicle: { id: '' }
    });
  };

  // ✅ FIXED: Correct status update endpoints
  const handleStatusChange = async (id, action) => {
    try {
      if (action === 'cancel') {
        await axios.patch(`${API}/missions/${id}/cancel`, {}, { headers });
      } else if (action === 'start') {
        await axios.patch(`${API}/missions/${id}/start`, {}, { headers });
      } else if (action === 'complete') {
        await axios.patch(`${API}/missions/${id}/complete`, {}, { headers });
      }
      fetchMissions();
    } catch (err) {
      console.error('Error updating mission status:', err);
      alert('Error updating mission status!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mission?')) {
      try {
        await axios.delete(`${API}/missions/${id}`, { headers });
        fetchMissions();
      } catch (err) {
        console.error('Error deleting mission:', err);
        alert('Error deleting mission!');
      }
    }
  };

  // Helper to get status badge class
  const getStatusClass = (status) => {
    switch(status) {
      case 'PLANNED': return 'badge-planned';
      case 'IN_PROGRESS': return 'badge-progress';
      case 'COMPLETED': return 'badge-completed';
      case 'CANCELLED': return 'badge-cancelled';
      default: return 'badge-default';
    }
  };

  // Helper to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'PLANNED': return '';
      case 'IN_PROGRESS': return '';
      case 'COMPLETED': return '';
      case 'CANCELLED': return '❌';
      default: return '';
    }
  };

  const filteredMissions = missions.filter(m => {
    const matchSearch = `${m.destination} ${m.driver?.firstName} ${m.driver?.lastName} ${m.driver?.displayId || ''}`
      .toLowerCase().includes(search.toLowerCase());
    if (filter === 'All') return matchSearch;
    return m.status === filter && matchSearch;
  });

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
            <a><i className="fas fa-home"></i><p>Dashboard</p></a>
          </li>
          <li onClick={() => navigate('/vehicles')}>
            <a><i className="fas fa-car"></i><p>Vehicles</p></a>
          </li>
          <li onClick={() => navigate('/drivers')}>
            <a><i className="fas fa-user"></i><p>Drivers</p></a>
          </li>
          <li onClick={() => navigate('/missions')}>
            <a className="active"><i className="fas fa-id-card"></i><p>Missions</p></a>
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

      {/* CONTENT */}
      <div className="content">
        <div className="content-header">
          <h2>Missions</h2>
          <button className="btn-add" onClick={handleOpenForm}>
            + New Mission
          </button>
        </div>

        {/* FILTERS */}
        <div className="filters">
          {['All', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(f => (
            <button 
              key={f} 
              className={`filter-btn ${filter === f ? 'active-filter' : ''}`}
              onClick={() => setFilter(f)}
            >
              {getStatusIcon(f)} {f === 'All' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
          <input 
            className="search-input" 
            placeholder="🔍 Search mission by destination or driver..."
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        {/* TABLE */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Destination</th>
                <th>Purpose</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMissions.map(m => (
                <tr key={m.id}>
                  <td>
                    <span className="mission-id">#{m.id}</span>
                    {m.assignedAt && (
                      <div className="mission-timestamp" title="Created">
                         {new Date(m.assignedAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>{m.destination}</td>
                  <td>{m.purpose}</td>
                  <td>
                    <strong>{m.driver?.firstName} {m.driver?.lastName}</strong>
                    <br/>
                    <small className="driver-id-text">{m.driver?.displayId}</small>
                  </td>
                  <td>
                    {m.vehicle?.plateNumber}
                    <br/>
                    <small>{m.vehicle?.brand?.brandName} {m.vehicle?.model}</small>
                  </td>
                  <td>{m.startDate}</td>
                  <td>{m.endDate}</td>
                  <td>
                    <span className={`mission-badge badge-${m.missionType?.toLowerCase()}`}>
                      {m.missionType === 'SHORT' ? 'SHORT' : 'LONG'}
                    </span>
                  </td>
                  <td>
                    <span className={`mission-badge ${getStatusClass(m.status)}`}>
                      {getStatusIcon(m.status)} {m.status}
                    </span>
                    {m.startedAt && (
                      <div className="mission-timestamp started" title="Started">
                         {new Date(m.startedAt).toLocaleString()}
                      </div>
                    )}
                    {m.completedAt && (
                      <div className="mission-timestamp completed" title="Completed">
                         {new Date(m.completedAt).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {m.status === 'PLANNED' && (
                        <>
                          <button 
                            className="action-btn start-btn"
                            onClick={() => handleStatusChange(m.id, 'start')}
                            title="Start Mission"
                          >
                             Start
                          </button>
                          <button 
                            className="action-btn cancel-btn"
                            onClick={() => handleStatusChange(m.id, 'cancel')}
                            title="Cancel Mission"
                          >
                            ❌ Cancel
                          </button>
                        </>
                      )}
                      {m.status === 'IN_PROGRESS' && (
                        <button 
                          className="action-btn complete-btn"
                          onClick={() => handleStatusChange(m.id, 'complete')}
                          title="Complete Mission"
                        >
                          ✅ Complete
                        </button>
                      )}
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(m.id)}
                        title="Delete Mission"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMissions.length === 0 && (
            <div className="empty-state">
              <p>📭 No missions found</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MISSION MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
              <button 
                   style={{ position: 'fixed', right: '500px', top: '65px' }}
        className="btn-x" 
        onClick={() => { 
          setShowForm(false); 
          resetForm(); 
        }}
      >
        ✕
      </button>
            <h3>New Mission</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Destination</label>
                  <input 
                    placeholder="e.g. Oran, Algiers" 
                    value={form.destination}
                    onChange={e => setForm({...form, destination: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Mission Type</label>
                  <select 
                    value={form.missionType}
                    onChange={e => setForm({...form, missionType: e.target.value})}>
                    <option value="SHORT">SHORT (≤ 100km)</option>
                    <option value="LONG">LONG ( > 100km)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Purpose</label>
                <textarea 
                  placeholder="Describe the mission purpose..." 
                  value={form.purpose}
                  onChange={e => setForm({...form, purpose: e.target.value})}
                  rows={2} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={form.startDate}
                    onChange={e => setForm({...form, startDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={form.endDate}
                    onChange={e => setForm({...form, endDate: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Driver</label>
                <select 
                  value={form.driver.id}
                  onChange={e => setForm({...form, driver: { id: e.target.value }})} 
                  required>
                  <option value="">Select Driver</option>
                  {availableDrivers.map((d, index) => (
                    <option key={d.id} value={d.id}>
                      #{index + 1} — {d.displayId || `Driver N0${d.id}`} | {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
                <div className="queue-info">
                  ℹ️ Drivers are ordered by availability — <span>Driver #1</span> has waited the longest!
                </div>
              </div>

              <div className="form-group">
                <label>Vehicle</label>
                <select 
                  value={form.vehicle.id}
                  onChange={e => setForm({...form, vehicle: { id: e.target.value }})} 
                  required>
                  <option value="">Select Vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} — {v.brand?.brandName} {v.model} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn-Dsave">Create Mission</button>
                <button 
                  type="button" 
                  className="btn-Dcancel"
                  onClick={() => { setShowForm(false); resetForm(); }}>
                  ❌ Cancel
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Missions;
