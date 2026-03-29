import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './nav.css';
import './Vehicles.css';

const API = 'http://localhost:8080/api';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    plateNumber: '', model: '', year: '', kilometrage: '',
    fuelType: '', brand: { id: '' }, vehicleType: { id: '' }
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchVehicles();
    fetchBrands();
    fetchTypes();
  }, []);

  const fetchVehicles = async () => {
    const res = await axios.get(`${API}/vehicles`, { headers });
    setVehicles(res.data);
  };

  const fetchBrands = async () => {
    const res = await axios.get(`${API}/brands`, { headers });
    setBrands(res.data);
  };

  const fetchTypes = async () => {
    const res = await axios.get(`${API}/vehicle-types`, { headers });
    setTypes(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editVehicle) {
        await axios.put(`${API}/vehicles/${editVehicle.id}`, form, { headers });
      } else {
        await axios.post(`${API}/vehicles`, form, { headers });
      }
      setShowForm(false);
      setEditVehicle(null);
      setForm({ plateNumber: '', model: '', year: '', kilometrage: '', fuelType: '', brand: { id: '' }, vehicleType: { id: '' } });
      fetchVehicles();
    } catch (err) {
      alert('Error saving vehicle!');
    }
  };

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setForm({
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      year: vehicle.year,
      kilometrage: vehicle.kilometrage,
      fuelType: vehicle.fuelType,
      brand: { id: vehicle.brand.id },
      vehicleType: { id: vehicle.vehicleType.id }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await axios.delete(`${API}/vehicles/${id}`, { headers });
      fetchVehicles();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: '#34a853',
      ASSIGNED: '#666',
      IN_MISSION: '#1a73e8',
      IN_REVISION: '#fbbc04',
      BREAKDOWN: '#ea4335',
      REFORMED: '#999'
    };
    return colors[status] || '#666';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'All': 'All',
      'ACTIVE': ' Active',
      'ASSIGNED': ' ASSIGNED',
      'IN_MISSION': ' In Mission',
      'IN_REVISION': ' In Revision',
      'BREAKDOWN': ' Breakdown',
      'REFORMED': ' Reformed'
    };
    return labels[status] || status;
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = `${v.plateNumber} ${v.model}`.toLowerCase().includes(search.toLowerCase());
    if (filter === 'All') return matchSearch;
    return v.status === filter && matchSearch;
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
              <a className="active"><i className="fas fa-car"></i><p>Vehicles</p></a>
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
            <h2>🚗 Vehicles</h2>
            <button className="btn-add" onClick={() => { setShowForm(true); setEditVehicle(null); }}>
              + Add Vehicle
            </button>
          </div>

          {/* FILTERS */}
          <div className="filters">
            {['All', 'ACTIVE', 'INACTIVE', 'IN_REVISION', 'REFORMED', 'BREAKDOWN'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active-filter' : ''}`}
                onClick={() => setFilter(f)}>
                {getStatusLabel(f)}
              </button>
            ))}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>{editVehicle ? '✏️ Edit Vehicle' : '➕ Add New Vehicle'}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <input placeholder="Plate Number" value={form.plateNumber}
                      onChange={e => setForm({...form, plateNumber: e.target.value})} required />
                    <input placeholder="Model" value={form.model}
                      onChange={e => setForm({...form, model: e.target.value})} required />
                    <input placeholder="Year" type="number" value={form.year}
                      onChange={e => setForm({...form, year: e.target.value})} required />
                    <input placeholder="Kilometrage" type="number" value={form.kilometrage}
                      onChange={e => setForm({...form, kilometrage: e.target.value})} />
                    <select value={form.fuelType}
                      onChange={e => setForm({...form, fuelType: e.target.value})} required>
                      <option value="">Select Fuel Type</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Electric">Electric</option>
                    </select>
                    <select value={form.brand.id}
                      onChange={e => setForm({...form, brand: { id: e.target.value }})} required>
                      <option value="">Select Brand</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
                    </select>
                    <select value={form.vehicleType.id}
                      onChange={e => setForm({...form, vehicleType: { id: e.target.value }})} required>
                      <option value="">Select Type</option>
                      {types.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                    </select>
                    <div className="form-buttons">
                      <button type="submit" className="btn-save">💾 Save</button>
                      <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>❌ Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TABLE */}
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Plate Number</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Year</th>
                <th>Fuel</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.plateNumber}</td>
                  <td>{v.brand?.brandName}</td>
                  <td>{v.model}</td>
                  <td>{v.year}</td>
                  <td>{v.fuelType}</td>
                  <td>{v.vehicleType?.typeName}</td>
                  <td>
                    <span className="badge" style={{backgroundColor: getStatusColor(v.status)}}>
                      {v.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(v)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(v.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      
    </div>
  );
}

export default Vehicles;