import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './nav.css';
import './Vehicles.css';

const API = 'http://localhost:8080/api';

function GasCoupons() {
  const [coupons, setCoupons]         = useState([]);
  const [drivers, setDrivers]         = useState([]);
  const [filter, setFilter]           = useState('All');
  const [search, setSearch]           = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [showAssign, setShowAssign]   = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [transferTarget, setTransferTarget] = useState('');
  const [form, setForm] = useState({ couponNumber: '', fuelAmount: '' });

  const navigate = useNavigate();
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCoupons();
    fetchDrivers();
  }, []);

  const fetchCoupons = async () => {
    const res = await axios.get(`${API}/gas-coupons`, { headers });
    setCoupons(res.data);
  };

  const fetchDrivers = async () => {
    const res = await axios.get(`${API}/drivers`, { headers });
    setDrivers(res.data);
  };

  // ── CREATE ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/gas-coupons`, {
        couponNumber: form.couponNumber,
        fuelAmount:   parseFloat(form.fuelAmount),
      }, { headers });
      closeForm();
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating coupon!');
    }
  };

  // ── ASSIGN ──
  const openAssign = (coupon) => {
    setSelectedCoupon(coupon);
    setAssignDriverId('');
    setShowAssign(true);
  };

  const handleAssign = async () => {
    if (!assignDriverId) return alert('Please select a driver.');
    try {
      await axios.patch(
        `${API}/gas-coupons/${selectedCoupon.id}/assign/${assignDriverId}`,
        {}, { headers }
      );
      setShowAssign(false);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning coupon!');
    }
  };

  // ── TRANSFER ──
  const openTransfer = (coupon) => {
    setSelectedCoupon(coupon);
    setTransferTarget('');
    setShowTransfer(true);
  };

  const handleTransfer = async () => {
    if (!transferTarget.trim()) return alert('Please enter a transfer destination.');
    try {
      await axios.patch(
        `${API}/gas-coupons/${selectedCoupon.id}/transfer?transferredTo=${encodeURIComponent(transferTarget)}`,
        {}, { headers }
      );
      setShowTransfer(false);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Error transferring coupon!');
    }
  };

  // ── MARK AS USED ──
  const handleMarkUsed = async (coupon) => {
    if (!window.confirm(`Mark coupon ${coupon.couponNumber} as USED?`)) return;
    try {
      await axios.patch(`${API}/gas-coupons/${coupon.id}/use`, {}, { headers });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking coupon as used!');
    }
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`${API}/gas-coupons/${id}`, { headers });
      fetchCoupons();
    } catch (err) {
      alert('Error deleting coupon!');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({ couponNumber: '', fuelAmount: '' });
  };

  // ── STATUS COLORS ──
  const statusColor = {
    AVAILABLE:   '#34a853',
    ASSIGNED:    '#1a73e8',
    USED:        '#9e9e9e',
    TRANSFERRED: '#ff9800',
  };

  // ── COUNTS for summary bar ──
  const counts = {
    AVAILABLE:   coupons.filter(c => c.status === 'AVAILABLE').length,
    ASSIGNED:    coupons.filter(c => c.status === 'ASSIGNED').length,
    USED:        coupons.filter(c => c.status === 'USED').length,
    TRANSFERRED: coupons.filter(c => c.status === 'TRANSFERRED').length,
  };

  const filteredCoupons = coupons.filter(c => {
    const matchSearch =
      c.couponNumber?.toLowerCase().includes(search.toLowerCase()) ||
      (c.driver?.name || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'All') return matchSearch;
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
            <a><i className="fas fa-clipboard-check"></i><p>Technical Checks</p></a>
          </li>
          <li onClick={() => navigate('/gas-coupons')}>
            <a className="active"><i className="fas fa-gas-pump"></i><p>Gas Coupons</p></a>
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

        <div className="content-header">
          <h2>⛽ Gas Coupons</h2>
          <button className="btn-add" onClick={() => setShowForm(true)}>+ Add Coupon</button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Available', key: 'AVAILABLE', color: '#34a853', icon: 'fa-check-circle' },
            { label: 'Assigned',  key: 'ASSIGNED',  color: '#1a73e8', icon: 'fa-user-check' },
            { label: 'Used',      key: 'USED',      color: '#9e9e9e', icon: 'fa-times-circle' },
            { label: 'Transferred', key: 'TRANSFERRED', color: '#ff9800', icon: 'fa-exchange-alt' },
          ].map(s => (
            <div key={s.key}
              onClick={() => setFilter(s.key)}
              style={{
                background: 'rgba(0,0,0,0.45)',
                border: `1px solid ${filter === s.key ? s.color : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '10px', padding: '16px 20px',
                cursor: 'pointer', transition: 'all 0.2s',
                backdropFilter: 'blur(8px)',
                boxShadow: filter === s.key ? `0 0 12px ${s.color}55` : 'none',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: '18px' }}></i>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: s.color, marginTop: '6px' }}>
                {counts[s.key]}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filters">
          {['All', 'AVAILABLE', 'ASSIGNED', 'USED', 'TRANSFERRED'].map(f => (
            <button key={f}
              className={`filter-btn ${filter === f ? 'active-filter' : ''}`}
              onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
          <input
            className="search-input"
            placeholder="🔍 Search by coupon # or driver..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── ADD COUPON MODAL ── */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>➕ Add New Gas Coupon</h3>
              <p className="modal-subtitle">New coupons start as AVAILABLE automatically</p>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div>
                    <label>Coupon Number</label>
                    <input placeholder="e.g. GC-2024-001" value={form.couponNumber}
                      onChange={e => setForm({ ...form, couponNumber: e.target.value })} required />
                  </div>
                  <div>
                    <label>Fuel Amount (L)</label>
                    <input type="number" step="0.01" min="0" placeholder="e.g. 50.00"
                      value={form.fuelAmount}
                      onChange={e => setForm({ ...form, fuelAmount: e.target.value })} required />
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

        {/* ── ASSIGN MODAL ── */}
        {showAssign && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>👤 Assign Coupon to Driver</h3>
              <p className="modal-subtitle">
                Coupon: <strong style={{ color: '#FFD700' }}>{selectedCoupon?.couponNumber}</strong>
                &nbsp;·&nbsp;{selectedCoupon?.fuelAmount} L
              </p>
              <div className="form-grid">
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Select Driver</label>
                  <select value={assignDriverId} onChange={e => setAssignDriverId(e.target.value)}>
                    <option value="">— Select a driver —</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.licenseNumber}</option>
                    ))}
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

        {/* ── TRANSFER MODAL ── */}
        {showTransfer && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>🔄 Transfer Coupon</h3>
              <p className="modal-subtitle">
                Coupon: <strong style={{ color: '#FFD700' }}>{selectedCoupon?.couponNumber}</strong>
                &nbsp;·&nbsp;{selectedCoupon?.fuelAmount} L
              </p>
              <div className="form-grid">
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Transfer To (Department / Person)</label>
                  <input
                    placeholder="e.g. Finance Department"
                    value={transferTarget}
                    onChange={e => setTransferTarget(e.target.value)}
                  />
                </div>
                <div className="form-buttons">
                  <button className="btn-save" onClick={handleTransfer}>🔄 Transfer</button>
                  <button className="btn-cancel" onClick={() => setShowTransfer(false)}>❌ Cancel</button>
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
                <th>Coupon #</th>
                <th>Fuel (L)</th>
                <th>Issue Date</th>
                <th>Assigned To</th>
                <th>Assigned Date</th>
                <th>Transferred To</th>
                <th>Used Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>
                    No coupons found.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td><strong>{c.couponNumber}</strong></td>
                    <td>{c.fuelAmount} L</td>
                    <td>{c.issueDate || '—'}</td>
                    <td>{c.driver ? `👤 ${c.driver.name}` : '—'}</td>
                    <td>{c.assignedDate || '—'}</td>
                    <td>{c.transferredTo || '—'}</td>
                    <td>{c.usedDate || '—'}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: statusColor[c.status] }}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {/* AVAILABLE → can assign or transfer */}
                      {c.status === 'AVAILABLE' && (
                        <>
                          <button className="btn-edit" onClick={() => openAssign(c)}
                            style={{ marginRight: '4px', fontSize: '11px', padding: '4px 8px' }}>
                            👤 Assign
                          </button>
                          <button onClick={() => openTransfer(c)}
                            style={{
                              padding: '4px 8px', border: 'none', borderRadius: '4px',
                              cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                              backgroundColor: '#ff9800', color: 'white', marginRight: '4px'
                            }}>
                            🔄 Transfer
                          </button>
                        </>
                      )}

                      {/* ASSIGNED → can mark as used or transfer */}
                      {c.status === 'ASSIGNED' && (
                        <>
                          <button onClick={() => handleMarkUsed(c)}
                            style={{
                              padding: '4px 8px', border: 'none', borderRadius: '4px',
                              cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                              backgroundColor: '#6c757d', color: 'white', marginRight: '4px'
                            }}>
                            ✅ Mark Used
                          </button>
                          <button onClick={() => openTransfer(c)}
                            style={{
                              padding: '4px 8px', border: 'none', borderRadius: '4px',
                              cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                              backgroundColor: '#ff9800', color: 'white', marginRight: '4px'
                            }}>
                            🔄 Transfer
                          </button>
                        </>
                      )}

                      {/* Always show delete */}
                      <button className="btn-delete" onClick={() => handleDelete(c.id)}
                        style={{ fontSize: '11px', padding: '4px 8px' }}>
                        🗑️
                      </button>
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

export default GasCoupons;