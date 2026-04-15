import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './nav.css';
import './Vehicles.css';

const API = 'http://localhost:8080/api';

function CartNaftal() {
  const [carts, setCarts]         = useState([]);
  const [drivers, setDrivers]     = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  const [assignType, setAssignType] = useState('driver'); // 'driver' or 'vehicle'
  const [assignId, setAssignId]   = useState('');
  const [filter, setFilter]       = useState('All');
  const [search, setSearch]       = useState('');
  const [form, setForm] = useState({
    cardNumber: '', expiryDate: '',
    driver: { id: '' }, vehicle: { id: '' }
  });

  const navigate = useNavigate();
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCarts();
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchCarts    = async () => {
    const res = await axios.get(`${API}/cart-naftal`, { headers });
    setCarts(res.data);
  };
  const fetchDrivers  = async () => {
    const res = await axios.get(`${API}/drivers`, { headers });
    setDrivers(res.data);
  };
  const fetchVehicles = async () => {
    const res = await axios.get(`${API}/vehicles`, { headers });
    setVehicles(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        cardNumber: form.cardNumber,
        expiryDate: form.expiryDate,
        driver:  form.driver.id  ? { id: form.driver.id }  : null,
        vehicle: form.vehicle.id ? { id: form.vehicle.id } : null,
      };
      await axios.post(`${API}/cart-naftal`, payload, { headers });
      closeForm();
      fetchCarts();
    } catch (err) {
      alert('Error saving Naftal card!');
    }
  };

  const handleToggle = async (id) => {
    await axios.patch(`${API}/cart-naftal/${id}/toggle`, {}, { headers });
    fetchCarts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this Naftal card?')) {
      await axios.delete(`${API}/cart-naftal/${id}`, { headers });
      fetchCarts();
    }
  };

  const openAssign = (cart) => {
    setSelectedCart(cart);
    setAssignType('driver');
    setAssignId('');
    setShowAssign(true);
  };

  const handleAssign = async () => {
    if (!assignId) return alert('Please select a target.');
    try {
      if (assignType === 'driver') {
        await axios.patch(`${API}/cart-naftal/${selectedCart.id}/assign/driver/${assignId}`, {}, { headers });
      } else {
        await axios.patch(`${API}/cart-naftal/${selectedCart.id}/assign/vehicle/${assignId}`, {}, { headers });
      }
      setShowAssign(false);
      fetchCarts();
    } catch (err) {
      alert('Error assigning card!');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({ cardNumber: '', expiryDate: '', driver: { id: '' }, vehicle: { id: '' } });
  };

  // expiry warning within 30 days
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const diff = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };

  const getAssignedTo = (cart) => {
    if (cart.driver)  return `👤 ${cart.driver.name}`;
    if (cart.vehicle) return `🚗 ${cart.vehicle.plateNumber}`;
    return '—';
  };

  const filteredCarts = carts.filter(c => {
    const matchSearch = c.cardNumber?.toLowerCase().includes(search.toLowerCase()) ||
      (c.driver?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.vehicle?.plateNumber || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'ACTIVE')   return c.active && matchSearch;
    if (filter === 'INACTIVE') return !c.active && matchSearch;
    if (filter === 'UNASSIGNED') return !c.driver && !c.vehicle && matchSearch;
    return matchSearch;
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
            <a><i className="fas fa-clipboard-check"></i><p>Technical Checks</p></a>
          </li>
          <li onClick={() => navigate('/gas-coupons')}>
            <a><i className="fas fa-gas-pump"></i><p>Gas Coupons</p></a>
          </li>
          <li onClick={() => navigate('/cart-naftal')}>
            <a className="active"><i className="fas fa-credit-card"></i><p>Naftal Cards</p></a>
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

        <div className="content-header">
          <h2>💳 Naftal Cards</h2>
          <button className="btn-add" onClick={() => setShowForm(true)}>+ Add Card</button>
        </div>

        {/* Filters */}
        <div className="filters">
          {['All', 'ACTIVE', 'INACTIVE', 'UNASSIGNED'].map(f => (
            <button key={f}
              className={`filter-btn ${filter === f ? 'active-filter' : ''}`}
              onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
          <input
            className="search-input"
            placeholder="🔍 Search by card number or assignee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Add Card Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>➕ Add New Naftal Card</h3>
              <p className="modal-subtitle">Create a new fuel card and optionally assign it</p>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">

                  <div>
                    <label>Card Number</label>
                    <input placeholder="e.g. NAFTAL-2024-001" value={form.cardNumber}
                      onChange={e => setForm({ ...form, cardNumber: e.target.value })} required />
                  </div>

                  <div>
                    <label>Expiry Date</label>
                    <input type="date" value={form.expiryDate}
                      onChange={e => setForm({ ...form, expiryDate: e.target.value })} required />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label>Assign To (optional)</label>
                    <select
                      value={form.driver.id ? `driver-${form.driver.id}` : form.vehicle.id ? `vehicle-${form.vehicle.id}` : ''}
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) {
                          setForm({ ...form, driver: { id: '' }, vehicle: { id: '' } });
                        } else if (val.startsWith('driver-')) {
                          setForm({ ...form, driver: { id: val.replace('driver-', '') }, vehicle: { id: '' } });
                        } else {
                          setForm({ ...form, vehicle: { id: val.replace('vehicle-', '') }, driver: { id: '' } });
                        }
                      }}>
                      <option value="">— Leave Unassigned —</option>
                      <optgroup label="Drivers">
                        {drivers.map(d => (
                          <option key={d.id} value={`driver-${d.id}`}>👤 {d.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Vehicles">
                        {vehicles.map(v => (
                          <option key={v.id} value={`vehicle-${v.id}`}>🚗 {v.plateNumber} — {v.model}</option>
                        ))}
                      </optgroup>
                    </select>
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

        {/* Assign Modal */}
        {showAssign && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>🔄 Reassign Card</h3>
              <p className="modal-subtitle">Card: <strong>{selectedCart?.cardNumber}</strong></p>
              <div className="form-grid">
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Assign To</label>
                  <select value={assignType} onChange={e => { setAssignType(e.target.value); setAssignId(''); }}>
                    <option value="driver">Driver</option>
                    <option value="vehicle">Vehicle</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>{assignType === 'driver' ? 'Select Driver' : 'Select Vehicle'}</label>
                  <select value={assignId} onChange={e => setAssignId(e.target.value)}>
                    <option value="">— Select —</option>
                    {assignType === 'driver'
                      ? drivers.map(d  => <option key={d.id} value={d.id}>{d.name}</option>)
                      : vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} — {v.model}</option>)
                    }
                  </select>
                </div>
                <div className="form-buttons">
                  <button className="btn-save" onClick={handleAssign}>✅ Assign</button>
                  <button className="btn-cancel" onClick={() => setShowAssign(false)}>❌ Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Card Number</th>
                <th>Expiry Date</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>
                    No Naftal cards found.
                  </td>
                </tr>
              ) : (
                filteredCarts.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td><strong>{c.cardNumber}</strong></td>
                    <td>
                      {c.expiryDate || '—'}
                      {isExpiringSoon(c.expiryDate) && (
                        <span style={{
                          marginLeft: '8px', fontSize: '11px',
                          background: 'rgba(251,188,4,0.2)', color: '#fbbc04',
                          padding: '2px 6px', borderRadius: '4px'
                        }}>⚠️ Soon</span>
                      )}
                    </td>
                    <td>{getAssignedTo(c)}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: c.active ? '#34a853' : '#ea4335'
                      }}>
                        {c.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => openAssign(c)}
                        style={{ marginRight: '5px' }}>
                        🔄 Assign
                      </button>
                      <button
                        onClick={() => handleToggle(c.id)}
                        style={{
                          padding: '5px 12px', border: 'none', borderRadius: '4px',
                          cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                          marginRight: '5px',
                          backgroundColor: c.active ? '#6c757d' : '#28a745',
                          color: 'white'
                        }}>
                        {c.active ? '⏸ Deactivate' : '▶ Activate'}
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(c.id)}>🗑️</button>
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

export default CartNaftal;