import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './nav.css';
import './Vehicles.css';

const API = 'http://localhost:8080/api';

function TechnicalChecks() {
  const [checks, setChecks]           = useState([]);
  const [vehicles, setVehicles]       = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [editCheck, setEditCheck]     = useState(null);
  const [filter, setFilter]           = useState('All');
  const [search, setSearch]           = useState('');
  const [form, setForm] = useState({
    checkDate: '', expiryDate: '', center: '', notes: '',
    vehicle: { id: '' }
  });

  const navigate = useNavigate();
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchChecks();
    fetchVehicles();
    fetchExpiringSoon();
  }, []);

  const fetchChecks = async () => {
    const res = await axios.get(`${API}/technical-checks`, { headers });
    setChecks(res.data);
  };

  const fetchVehicles = async () => {
    const res = await axios.get(`${API}/vehicles`, { headers });
    setVehicles(res.data);
  };

  const fetchExpiringSoon = async () => {
    const res = await axios.get(`${API}/technical-checks/expiring-soon`, { headers });
    setExpiringSoon(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCheck) {
        await axios.put(`${API}/technical-checks/${editCheck.id}`, form, { headers });
      } else {
        await axios.post(`${API}/technical-checks`, form, { headers });
      }
      closeForm();
      fetchChecks();
      fetchExpiringSoon();
    } catch (err) {
      alert('Error saving technical check!');
    }
  };

  const handleEdit = (check) => {
    setEditCheck(check);
    setForm({
      checkDate:  check.checkDate,
      expiryDate: check.expiryDate,
      center:     check.center,
      notes:      check.notes || '',
      status:     check.status,
      vehicle:    { id: check.vehicle.id }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this technical check?')) {
      await axios.delete(`${API}/technical-checks/${id}`, { headers });
      fetchChecks();
      fetchExpiringSoon();
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditCheck(null);
    setForm({ checkDate: '', expiryDate: '', center: '', notes: '', vehicle: { id: '' } });
  };

  const getStatusColor = (status) => {
    const colors = { VALID: '#34a853', EXPIRED: '#ea4335', FAILED: '#fbbc04' };
    return colors[status] || '#666';
  };

  // check if expiry is within 15 days
  const isExpiringSoon = (expiryDate) => {
    const today  = new Date();
    const expiry = new Date(expiryDate);
    const diff   = (expiry - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 15;
  };

  const filteredChecks = checks.filter(c => {
    const plate = c.vehicle?.plateNumber || '';
    const matchSearch = `${plate} ${c.center || ''}`.toLowerCase().includes(search.toLowerCase());
    if (filter === 'All') return matchSearch;
    if (filter === 'EXPIRING_SOON') return isExpiringSoon(c.expiryDate) && matchSearch;
    return c.status === filter && matchSearch;
  });

  return (
    <div className="container">

      {/* Sidebar */}
      <div className="menu">
        <ul>
          <li className="profile">
            <div className="img-box"><i className="fas fa-user"></i></div>
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
            <a><i className="fas fa-id-card"></i><p>Missions</p></a>
          </li>
          <li onClick={() => navigate('/maintenance')}>
            <a><i className="fas fa-tools"></i><p>Maintenance</p></a>
          </li>
          <li onClick={() => navigate('/technical-checks')}>
            <a className="active"><i className="fas fa-clipboard-check"></i><p>Technical Checks</p></a>
          </li>
          <li onClick={() => navigate('/gas-coupons')}>
            <a><i className="fas fa-gas-pump"></i><p>Gas Coupons</p></a>
          </li>
          <li onClick={() => navigate('/cart-naftal')}>
            <a><i className="fas fa-credit-card"></i><p>Naftal Cards</p></a>
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

        {/* Alert banner - expiring soon */}
        {expiringSoon.length > 0 && (
          <div style={{
            background: 'rgba(251,188,4,0.2)',
            border: '1px solid #fbbc04',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fbbc04',
            fontSize: '14px'
          }}>
            <i className="fas fa-exclamation-triangle"></i>
            <strong>{expiringSoon.length} vehicle(s)</strong> have technical checks expiring within 15 days.
            <button
              onClick={() => setFilter('EXPIRING_SOON')}
              style={{
                marginLeft: 'auto', background: '#fbbc04', color: '#333',
                border: 'none', borderRadius: '4px', padding: '4px 12px',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
              }}>
              View
            </button>
          </div>
        )}

        <div className="content-header">
          <h2>🔧 Technical Checks</h2>
          <button className="btn-add" onClick={() => { setShowForm(true); setEditCheck(null); }}>
            + Add Check
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          {['All', 'VALID', 'EXPIRED', 'FAILED', 'EXPIRING_SOON'].map(f => (
            <button key={f}
              className={`filter-btn ${filter === f ? 'active-filter' : ''}`}
              onClick={() => setFilter(f)}>
              {f === 'EXPIRING_SOON' ? '⚠️ Expiring Soon' : f}
            </button>
          ))}
          <input
            className="search-input"
            placeholder="🔍 Search by plate or center..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editCheck ? '✏️ Edit Technical Check' : '➕ Add Technical Check'}</h3>
              <p className="modal-subtitle">Fill in the inspection details below</p>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">

                  <div>
                    <label>Vehicle</label>
                    <select value={form.vehicle.id}
                      onChange={e => setForm({ ...form, vehicle: { id: e.target.value } })} required>
                      <option value="">Select Vehicle</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.plateNumber} — {v.model}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Inspection Center</label>
                    <input placeholder="Center name" value={form.center}
                      onChange={e => setForm({ ...form, center: e.target.value })} required />
                  </div>

                  <div>
                    <label>Check Date</label>
                    <input type="date" value={form.checkDate}
                      onChange={e => setForm({ ...form, checkDate: e.target.value })} required />
                  </div>

                  <div>
                    <label>Expiry Date</label>
                    <input type="date" value={form.expiryDate}
                      onChange={e => setForm({ ...form, expiryDate: e.target.value })} required />
                  </div>

                  {editCheck && (
                    <div>
                      <label>Status</label>
                      <select value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="VALID">VALID</option>
                        <option value="EXPIRED">EXPIRED</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </div>
                  )}

                  <div style={{ gridColumn: editCheck ? '2' : 'span 2' }}>
                    <label>Notes</label>
                    <input placeholder="Optional notes" value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="btn-save">💾 Save</button>
                    <button type="button" className="btn-cancel" onClick={closeForm}>❌ Cancel</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Center</th>
                <th>Check Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>
                    No technical checks found.
                  </td>
                </tr>
              ) : (
                filteredChecks.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>
                      <strong>{c.vehicle?.plateNumber}</strong>
                      <br />
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                        {c.vehicle?.model}
                      </span>
                    </td>
                    <td>{c.center}</td>
                    <td>{c.checkDate}</td>
                    <td>
                      {c.expiryDate}
                      {isExpiringSoon(c.expiryDate) && c.status === 'VALID' && (
                        <span style={{
                          marginLeft: '8px', fontSize: '11px',
                          background: 'rgba(251,188,4,0.2)', color: '#fbbc04',
                          padding: '2px 6px', borderRadius: '4px'
                        }}>
                          ⚠️ Soon
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: getStatusColor(c.status) }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                      {c.notes || '—'}
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(c)}>✏️ Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(c.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default TechnicalChecks;