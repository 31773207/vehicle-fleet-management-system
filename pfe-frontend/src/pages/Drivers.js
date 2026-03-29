import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Drivers.css";
import "./nav.css";

const API = 'http://localhost:8080/api';

function Drivers() {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [assignOrganizationId, setAssignOrganizationId] = useState(''); // ✅ ADDED
  const [organization, setOrganization] = useState('');
  const [removeDate, setRemoveDate] = useState('');
  const [manageHistory, setManageHistory] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '',
    email: '', address: '', dateOfBirth: '',
    licenseNumber: '', licenseExpiry: '',
    organization: { id: '' },
    assignedVehicle: { id: '' }
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
    fetchOrganizations();
  }, []);

  useEffect(() => {
    drivers.forEach(d => fetchManageHistory(d.id));
  }, [drivers]);

  const fetchDrivers = async () => {
    const res = await axios.get(`${API}/drivers`, { headers });
    setDrivers(res.data);
  };

  const fetchVehicles = async () => {
    const res = await axios.get(`${API}/vehicles`, { headers });
    setVehicles(res.data);
  };

  const fetchOrganizations = async () => {
    const res = await axios.get(`${API}/organizations`, { headers });
    setOrganizations(res.data);
  };

  const fetchManageHistory = async (driverId) => {
    try {
      const res = await axios.get(`${API}/manage/history/${driverId}`, { headers });
      const active = res.data.find(m => m.endDate === null);
      const lastRemoved = res.data
        .filter(m => m.endDate !== null)
        .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
      setManageHistory(prev => ({ ...prev, [driverId]: active || lastRemoved }));
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        organization: form.organization.id ? { id: form.organization.id } : null,
        assignedVehicle: form.assignedVehicle.id ? { id: form.assignedVehicle.id } : null
      };
      if (editDriver) {
        await axios.put(`${API}/drivers/${editDriver.id}`, data, { headers });
      } else {
        await axios.post(`${API}/drivers`, data, { headers });
      }
      setShowForm(false);
      setEditDriver(null);
      resetForm();
      fetchDrivers();
    } catch (err) {
      alert('Error saving driver!');
    }
  };

  const resetForm = () => {
    setForm({
      firstName: '', lastName: '', phone: '',
      email: '', address: '', dateOfBirth: '',
      licenseNumber: '', licenseExpiry: '',
      organization: { id: '' },
      assignedVehicle: { id: '' }
    });
  };

  const handleEdit = (driver) => {
    setEditDriver(driver);
    setForm({
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone,
      email: driver.email,
      address: driver.address,
      dateOfBirth: driver.dateOfBirth,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      organization: { id: driver.organization?.id || '' },
      assignedVehicle: { id: driver.assignedVehicle?.id || '' }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await axios.delete(`${API}/drivers/${id}`, { headers });
      fetchDrivers();
    }
  };

  const getStatusLabel = (driver) => {
    if (driver.assignedVehicle) return 'On Route';
    return 'Available';
  };

  const getStatusClass = (driver) => {
    if (driver.assignedVehicle) return 'status-on-route';
    return 'status-available';
  };

  const filteredDrivers = drivers.filter(d => {
    const matchSearch = `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase());
    if (filter === 'All') return matchSearch;
    if (filter === 'Available') return !d.assignedVehicle && matchSearch;
    if (filter === 'On Route') return d.assignedVehicle && matchSearch;
    return matchSearch;
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
            <a className="active"><i className="fas fa-user"></i><p>Drivers</p></a>
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

      {/* CONTENT */}
      <div className="content">
        <div className="content-header">
          <h2>Drivers List</h2>
          <button className="btn-add" onClick={() => { setShowForm(true); setEditDriver(null); resetForm(); }}>
            + Add New Driver
          </button>
        </div>

        <div className="content-body">
          {/* FILTERS */}
          <div className="filters">
            {['All', 'Available', 'On Route'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active-filter' : ''}`}
                onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
            <input className="search-input" placeholder="🔍 Search driver"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* CARDS */}
          <div className="cards-grid">
            {filteredDrivers.map(d => (
              <div key={d.id} className="driver-card">

                {/* CARD TOP */}
                <div className="card-top">
                  <div className="avatar">👤</div>
                  <div className="driver-name">{d.firstName} {d.lastName}</div>
                  <div className="badges">
                    <span className="badge-id">Driver N0{d.id}</span>
                    <span className={`badge-status ${getStatusClass(d)}`}>
                      {getStatusLabel(d)}
                    </span>
                  </div>
                </div>

                {/* CARD INFO */}
                <div className="card-info">
                  <div className="info-row">📞 {d.phone}</div>
                  <div className="info-row">📧 {d.email}</div>
                  <div className="info-row">🪪 {d.licenseNumber}</div>
                  <div className="info-row">📅 Exp: {d.licenseExpiry}</div>
                  <div className="info-row">🏢 {d.organization?.name || 'No Organization'}</div>
                </div>

                {/* VEHICLE BADGE */}
                {d.assignedVehicle ? (
                  <div className="vehicle-badge" style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedDriver(d); setShowAssignForm(true); }}>
                    <span className="vehicle-icon">🚗</span>
                    <div className="vehicle-info">
                      <span className="vehicle-plate">{d.assignedVehicle.plateNumber}</span>
                      <span className="vehicle-model">{d.assignedVehicle.mark} - {d.assignedVehicle.model}</span>
                    </div>
                  </div>
                ) : (
                  <div className="vehicle-badge" style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedDriver(d); setShowAssignForm(true); }}>
                    <span className="vehicle-icon">🚫</span>
                    <div className="vehicle-info">
                      <span className="vehicle-plate">No Assigned Vehicle</span>
                      <span className="vehicle-model" style={{ color: '#1a73e8' }}>Click to assign</span>
                    </div>
                  </div>
                )}

                {/* ASSIGNMENT DATES */}
                {manageHistory[d.id] && (
                  <div style={{ marginTop: '8px', padding: '8px', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '6px' }}>
                    <div className="info-row" style={{ color: '#34a853' }}>
                      ✅ Assigned: {manageHistory[d.id].startDate} {manageHistory[d.id].assignTime} | {manageHistory[d.id].vehicle?.model} - {manageHistory[d.id].vehicle?.plateNumber}
                    </div>
                    {manageHistory[d.id].endDate && (
                      <div className="info-row" style={{ color: '#ea4335', marginTop: '5px' }}>
                        🚫 Removed: {manageHistory[d.id].endDate} {manageHistory[d.id].removeTime} | {manageHistory[d.id].vehicle?.model} - {manageHistory[d.id].vehicle?.plateNumber}
                      </div>
                    )}
                  </div>
                )}

                {/* CARD BUTTONS */}
                <div className="card-buttons">
                  <button className="btn-edit" onClick={() => handleEdit(d)}>✏️ Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(d.id)}>🗑️ Delete</button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADD/EDIT DRIVER MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editDriver ? '✏️ Edit Driver' : '➕ Add New Driver'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>First Name</label>
                  <input placeholder="First Name" value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>Last Name</label>
                  <input placeholder="Last Name" value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>Phone</label>
                  <input placeholder="Phone" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>Email</label>
                  <input placeholder="Email" type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>Address</label>
                  <input placeholder="Address" value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>Date of Birth</label>
                  <input type="date" value={form.dateOfBirth}
                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>License Number</label>
                  <input placeholder="License Number" value={form.licenseNumber}
                    onChange={e => setForm({ ...form, licenseNumber: e.target.value })} required />
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>License Expiry</label>
                  <input type="date" value={form.licenseExpiry}
                    onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: '#aaa', fontSize: '12px' }}>Organization</label>
                  <select value={form.organization.id}
                    onChange={e => setForm({ ...form, organization: { id: e.target.value } })}>
                    <option value="">Select Organization</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="btn-save">💾 Save</button>
                  <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>❌ Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN/CHANGE/REMOVE VEHICLE MODAL */}
      {showAssignForm && selectedDriver && (
        <div className="modal-overlay">
          <div className="modal">
            {selectedDriver.assignedVehicle ? (
              <>
                <h3>🚗 Vehicle Assignment</h3>

                {/* Current vehicle info */}
                <div style={{ backgroundColor: '#2d3548', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
                  <p style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                    🚗 {selectedDriver.assignedVehicle.plateNumber}
                  </p>
                  <p style={{ color: '#aaa', fontSize: '13px' }}>{selectedDriver.assignedVehicle.model}</p>
                  <p style={{ color: '#aaa', fontSize: '13px' }}>
                    Status: <span style={{ color: 'white', backgroundColor: '#1a73e8', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                      {selectedDriver.assignedVehicle.status}
                    </span>
                  </p>
                  {manageHistory[selectedDriver.id] && (
                    <p style={{ color: '#aaa', fontSize: '13px', marginTop: '5px' }}>
                      📅 Since: {manageHistory[selectedDriver.id].startDate}
                    </p>
                  )}
                </div>

                {/* Change vehicle */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#aaa', fontSize: '13px' }}>🔄 Change Vehicle:</label>
                  <select value={assignVehicleId} onChange={e => setAssignVehicleId(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '5px', backgroundColor: '#2d3548', border: '1px solid #3d5166', borderRadius: '6px', color: 'white', fontSize: '14px' }}>
                    <option value="">Select new vehicle</option>
                    {vehicles.filter(v => v.status === 'AVAILABLE').map(v => ( // ✅ FIXED: ACTIVE → AVAILABLE
                      <option key={v.id} value={v.id}>{v.plateNumber} - {v.model}</option>
                    ))}
                  </select>
                </div>

                {/* Remove date */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#aaa', fontSize: '13px' }}>📅 Remove Date:</label>
                  <input type="date" value={removeDate}
                    onChange={e => setRemoveDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '5px', backgroundColor: '#2d3548', border: '1px solid #3d5166', borderRadius: '6px', color: 'white', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                {/* Organization */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#aaa', fontSize: '13px' }}>🏢 Organization:</label>
                  <select value={organization} onChange={e => setOrganization(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '5px', backgroundColor: '#2d3548', border: '1px solid #3d5166', borderRadius: '6px', color: 'white', fontSize: '14px' }}>
                    <option value="">Select Organization</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {assignVehicleId && (
                    <button className="btn-save" style={{ flex: 1 }}
                      onClick={async () => {
                        await axios.post(`${API}/manage/assign?driverId=${selectedDriver.id}&vehicleId=${assignVehicleId}`, {}, { headers });
                        setShowAssignForm(false);
                        setAssignVehicleId('');
                        fetchDrivers();
                      }}>
                      🔄 Change
                    </button>
                  )}
                  <button className="btn-delete" style={{ flex: 1 }}
                    onClick={async () => {
                      if (!removeDate) return alert('Please select remove date!');
                      await axios.post(
                        `${API}/manage/remove?driverId=${selectedDriver.id}&organization=${organization}&endDate=${removeDate}`,
                        {}, { headers }
                      );
                      setShowAssignForm(false);
                      setOrganization('');
                      setRemoveDate('');
                      fetchDrivers();
                    }}>
                    ❌ Remove
                  </button>
                  <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setShowAssignForm(false)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>🚗 Assign Vehicle to {selectedDriver.firstName}</h3>
                <div style={{ marginBottom: '15px' }}>
                  <select value={assignVehicleId} onChange={e => setAssignVehicleId(e.target.value)}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#2d3548', border: '1px solid #3d5166', borderRadius: '6px', color: 'white', fontSize: '14px' }}>
                    <option value="">Select Vehicle</option>
                    {vehicles.filter(v => v.status === 'AVAILABLE').map(v => ( // ✅ FIXED: ACTIVE → AVAILABLE
                      <option key={v.id} value={v.id}>{v.plateNumber} - {v.model}</option>
                    ))}
                  </select>
                  <select value={assignOrganizationId} onChange={e => setAssignOrganizationId(e.target.value)} // ✅ FIXED: state now declared
                    style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: '#2d3548', border: '1px solid #3d5166', borderRadius: '6px', color: 'white', fontSize: '14px' }}>
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-save" style={{ flex: 1 }}
                    onClick={async () => {
                      if (!assignVehicleId) return alert('Please select a vehicle!');
                      await axios.post(`${API}/manage/assign?driverId=${selectedDriver.id}&vehicleId=${assignVehicleId}`, {}, { headers });
                      setShowAssignForm(false);
                      setAssignVehicleId('');
                      setAssignOrganizationId(''); // ✅ Reset after assign
                      fetchDrivers();
                    }}>
                    ✅ Assign
                  </button>
                  <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setShowAssignForm(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Drivers;