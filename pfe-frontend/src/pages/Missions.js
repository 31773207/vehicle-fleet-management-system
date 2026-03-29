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
    const res = await axios.get(`${API}/missions`, { headers });
    setMissions(res.data);
  };

  const fetchAvailableDrivers = async () => {
    const res = await axios.get(`${API}/missions/available-drivers`, { headers });
    setAvailableDrivers(res.data);
  };

  const fetchAvailableVehicles = async () => {
    const res = await axios.get(`${API}/vehicles`, { headers });
    setAvailableVehicles(res.data.filter(v => v.status === 'ACTIVE'));
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

  const handleStatusChange = async (id, action) => {
    try {
      if (action === 'cancel') {
        await axios.patch(`${API}/missions/${id}/cancel`, {}, { headers });
      } else {
        const statusMap = {
          start: 'IN_PROGRESS',
          complete: 'COMPLETED'
        };
        await axios.patch(`${API}/missions/${id}/status?status=${statusMap[action]}`, {}, { headers });
      }
      fetchMissions();
    } catch (err) {
      alert('Error updating mission status!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mission?')) {
      await axios.delete(`${API}/missions/${id}`, { headers });
      fetchMissions();
    }
  };

  const filteredMissions = missions.filter(m => {
    const matchSearch = `${m.destination} ${m.driver?.firstName} ${m.driver?.lastName}`
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
            <h2>📋 Missions</h2>
            <button className="btn-add" onClick={handleOpenForm}>
              + New Mission
            </button>
          </div>

          {/* FILTERS */}
          <div className="filters">
            {['All', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active-filter' : ''}`}
                onClick={() => setFilter(f)}>
                {f === 'All' ? 'All' :
                 f === 'PLANNED' ? '🕐 Planned' :
                 f === 'IN_PROGRESS' ? '🚀 In Progress' :
                 f === 'COMPLETED' ? '✅ Completed' : '❌ Cancelled'}
              </button>
            ))}
            <input className="search-input" placeholder="🔍 Search mission..."
              value={search} onChange={e => setSearch(e.target.value)} />
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
                    <td>#{m.id}</td>
                    <td>{m.destination}</td>
                    <td>{m.purpose}</td>
                    <td>{m.driver?.firstName} {m.driver?.lastName}</td>
                    <td>{m.vehicle?.plateNumber}</td>
                    <td>{m.startDate}</td>
                    <td>{m.endDate}</td>
                    <td><span className={`badge badge-${m.missionType}`}>{m.missionType}</span></td>
                    <td><span className={`badge badge-${m.status}`}>{m.status}</span></td>
                    <td>
                      {m.status === 'PLANNED' && (
                        <>
                          <button className="btn-action btn-start"
                            onClick={() => handleStatusChange(m.id, 'start')}>
                            🚀 Start
                          </button>
                          <button className="btn-action btn-cancel"
                            onClick={() => handleStatusChange(m.id, 'cancel')}>
                            ❌ Cancel
                          </button>
                        </>
                      )}
                      {m.status === 'IN_PROGRESS' && (
                        <button className="btn-action btn-complete"
                          onClick={() => handleStatusChange(m.id, 'complete')}>
                          ✅ Complete
                        </button>
                      )}
                      <button className="btn-action btn-delete"
                        onClick={() => handleDelete(m.id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* CREATE MISSION MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>➕ New Mission</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Destination</label>
                  <input placeholder="e.g. Oran" value={form.destination}
                    onChange={e => setForm({...form, destination: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Mission Type</label>
                  <select value={form.missionType}
                    onChange={e => setForm({...form, missionType: e.target.value})}>
                    <option value="SHORT">SHORT</option>
                    <option value="LONG">LONG</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Purpose</label>
                <textarea placeholder="Mission purpose..." value={form.purpose}
                  onChange={e => setForm({...form, purpose: e.target.value})}
                  rows={2} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.startDate}
                    onChange={e => setForm({...form, startDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.endDate}
                    onChange={e => setForm({...form, endDate: e.target.value})} required />
                </div>
              </div>

              <div className="form-group">
                <label>Driver (Queue Order — First = Most Available)</label>
                <select value={form.driver.id}
                  onChange={e => setForm({...form, driver: { id: e.target.value }})} required>
                  <option value="">Select Driver</option>
                  {availableDrivers.map((d, index) => (
                    <option key={d.id} value={d.id}>
                      #{index + 1} — {d.firstName} {d.lastName} ({d.licenseNumber})
                    </option>
                  ))}
                </select>
                <div className="queue-info">
                  ℹ️ Drivers are ordered by availability — <span>Driver #1</span> has waited the longest!
                </div>
              </div>

              <div className="form-group">
                <label>Vehicle</label>
                <select value={form.vehicle.id}
                  onChange={e => setForm({...form, vehicle: { id: e.target.value }})} required>
                  <option value="">Select Vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} — {v.brand?.brandName} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn-save">🚀 Create Mission</button>
                <button type="button" className="btn-cancel-form"
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