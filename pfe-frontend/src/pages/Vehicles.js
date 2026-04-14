import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Vehicles.css';
import './theme.css';
import './nav.css';

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
    plateNumber: '',
    model: '',
    color: '',
    year: '',
    kilometrage: '',
    fuelType: '',
    brand: { id: '' },
    brandName: '',
    vehicleType: { id: '' }
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
    try {
      const res = await axios.get(`${API}/vehicles`, { headers });
      setVehicles(res.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API}/brands`, { headers });
      setBrands(res.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await axios.get(`${API}/vehicle-types`, { headers });
      setTypes(res.data);
    } catch (err) {
      console.error('Error fetching types:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let brandId = form.brand.id;
      
      // If user typed a new brand name (not in existing brands)
      if (form.brandName && !brandId) {
        // Check if brand exists in list
        const existingBrand = brands.find(b => b.brandName.toLowerCase() === form.brandName.toLowerCase());
        if (existingBrand) {
          brandId = existingBrand.id;
        } else {
          // Create new brand
          const newBrand = await axios.post(`${API}/brands`, {
            brandName: form.brandName,
            country: ''
          }, { headers });
          brandId = newBrand.data.id;
          // Refresh brands list
          fetchBrands();
        }
      }
      
      const vehicleData = {
        plateNumber: form.plateNumber,
        model: form.model,
        color: form.color,
        year: parseInt(form.year),
        kilometrage: parseFloat(form.kilometrage) || 0,
        fuelType: form.fuelType,
        brand: brandId ? { id: parseInt(brandId) } : null,
        vehicleType: { id: parseInt(form.vehicleType.id) }
      };

      if (editVehicle) {
        await axios.put(`${API}/vehicles/${editVehicle.id}`, vehicleData, { headers });
      } else {
        await axios.post(`${API}/vehicles`, vehicleData, { headers });
      }
      setShowForm(false);
      setEditVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      alert(err.response?.data?.message || 'Error saving vehicle!');
    }
  };

  const resetForm = () => {
    const currentYear = new Date().getFullYear();
    setForm({
      plateNumber: '',
      model: '',
      color: '',
      year: currentYear.toString(),
      kilometrage: '',
      fuelType: '',
      brand: { id: '' },
      brandName: '',
      vehicleType: { id: '' }
    });
  };

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setForm({
      plateNumber: vehicle.plateNumber || '',
      model: vehicle.model || '',
      color: vehicle.color || '',
      year: vehicle.year || '',
      kilometrage: vehicle.kilometrage || '',
      fuelType: vehicle.fuelType || '',
      brand: { id: vehicle.brand?.id || '' },
      brandName: vehicle.brand?.brandName || '',
      vehicleType: { id: vehicle.vehicleType?.id || '' }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`${API}/vehicles/${id}`, { headers });
        fetchVehicles();
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        alert('Error deleting vehicle!');
      }
    }
  };

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      AVAILABLE: '#28a745',
      ASSIGNED: '#17a2b8',
      IN_MISSION: '#ffc107',
      IN_REVISION: '#fd7e14',
      BREAKDOWN: '#dc3545',
      REFORMED: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  // Status labels with icons
  const getStatusLabel = (status) => {
    const labels = {
      'All': 'All',
      'AVAILABLE': 'Available',
      'ASSIGNED': 'Assigned',
      'IN_MISSION': 'In Mission',
      'IN_REVISION': 'In Revision',
      'BREAKDOWN': 'Breakdown',
      'REFORMED': 'Reformed'
    };
    return labels[status] || status;
  };

  // Status options for filter
  const statusOptions = ['All', 'AVAILABLE', 'ASSIGNED', 'IN_MISSION', 'IN_REVISION', 'BREAKDOWN', 'REFORMED'];

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = `${v.plateNumber} ${v.model} ${v.brand?.brandName || ''} ${v.color || ''}`.toLowerCase().includes(search.toLowerCase());
    if (filter === 'All') return matchSearch;
    return v.status === filter && matchSearch;
  });

  // Check if vehicle is old (10+ years)
  const isOldVehicle = (year) => {
    if (!year) return false;
    return new Date().getFullYear() - year >= 10;
  };

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
            <a><i className="fas fa-user"></i><p>Employees</p></a>
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
          <h2>Vehicles</h2>
          <button className="btn-add" onClick={() => { setShowForm(true); setEditVehicle(null); resetForm(); }}>
            + Add Vehicle
          </button>
        </div>

        {/* FILTERS */}
        <div className="filters">
          {statusOptions.map(f => (
            <button 
              key={f} 
              className={`filter-btn ${filter === f ? 'active-filter' : ''}`}
              onClick={() => setFilter(f)}
            >
              {getStatusLabel(f)}
            </button>
          ))}
          <input 
            className="search-input" 
            placeholder="🔍 Search by plate, model, brand or color..."
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
                <th>Plate Number</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Color</th>
                <th>Year</th>
                <th>Fuel</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map(v => {
                const old = isOldVehicle(v.year);
                return (
                  <tr key={v.id} className={old ? 'old-vehicle' : ''}>
                    <td>{v.id}</td>
                    <td className="plate-number">{v.plateNumber}</td>
                    <td>{v.brand?.brandName}</td>
                    <td>{v.model}</td>
                    <td>{v.color || '—'}</td>
                    <td>
                      {v.year}
                      {old && <span className="old-badge" title="Vehicle is 10+ years old"></span>}
                    </td>
                    <td>{v.fuelType}</td>
                    <td>{v.vehicleType?.typeName}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(v.status) }}>
                        {getStatusLabel(v.status)}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="btn-edit" onClick={() => handleEdit(v)} title="Edit">✏️</button>
                      <button className="btn-delete" onClick={() => handleDelete(v.id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredVehicles.length === 0 && (
            <div className="empty-state">
              <p>📭 No vehicles found</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-vhicule">
            <h3>{editVehicle ? '✏️ Edit Vehicle' : '➕ Add New Vehicle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label>Plate Number</label>
                  <input 
                    placeholder="ABC-123" 
                    value={form.plateNumber}
                    onChange={e => setForm({...form, plateNumber: e.target.value})} 
                    required 
                  />
                </div>

                <div>
                  <label>Brand</label>
                  <input 
                    list="brands-list"
                    placeholder="Select or type brand name..."
                    value={form.brandName}
                    onChange={e => {
                      const brandName = e.target.value;
                      const foundBrand = brands.find(b => b.brandName.toLowerCase() === brandName.toLowerCase());
                      setForm({
                        ...form,
                        brandName: brandName,
                        brand: foundBrand ? { id: foundBrand.id } : { id: '' }
                      });
                    }}
                    required
                  />
                  <datalist id="brands-list">
                    <option value="Toyota">Toyota</option>
                    <option value="Renault">Renault</option>
                    <option value="Peugeot">Peugeot</option>
                    <option value="Audi">Audi</option>
                    <option value="Ford">Ford</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Honda">Honda</option>
                    <option value="Fiat">Fiat</option>
                    <option value="Mazda">Mazda</option>
                    
                    {brands.map(b => (
                      <option key={b.id} value={b.brandName} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label>Model</label>
                  <input 
                    list="models-list"
                    placeholder="Select or type model..."
                    value={form.model}
                    onChange={e => setForm({...form, model: e.target.value})} 
                    required 
                  />
                  <datalist id="models-list">
                    <option value="Megane">Megane</option>
                    <option value="Clio">Clio</option>
                    <option value="Captur">Captur</option>
                    <option value="Talisman">Talisman</option>
                    <option value="Espace">Espace</option>
                    <option value="Corolla">Corolla</option>
                    <option value="Yaris">Yaris</option>
                    <option value="RAV4">RAV4</option>
                    <option value="Camry">Camry</option>
                    <option value="Land Cruiser">Land Cruiser</option>
                    <option value="208">208</option>
                    <option value="308">308</option>
                    <option value="508">508</option>
                    <option value="3008">3008</option>
                    <option value="5008">5008</option>
                    <option value="C3">C3</option>
                    <option value="C4">C4</option>
                    <option value="C5">C5</option>
                    <option value="Golf">Golf</option>
                    <option value="Passat">Passat</option>
                    <option value="Tiguan">Tiguan</option>
                    <option value="Series 3">Series 3</option>
                    <option value="Series 5">Series 5</option>
                    <option value="X5">X5</option>
                    <option value="A3">A3</option>
                    <option value="A4">A4</option>
                    <option value="Q5">Q5</option>
                    <option value="Classe C">Classe C</option>
                    <option value="Classe E">Classe E</option>
                    <option value="Classe S">Classe S</option>
                  </datalist>
                </div>

                <div>
                  <label>Color</label>
                  <input 
                    list="colors-list"
                    placeholder="Select or type color..."
                    value={form.color}
                    onChange={e => setForm({...form, color: e.target.value})}
                  />
                  <datalist id="colors-list">
                    <option value="White">White</option>
                    <option value="Black">Black</option>
                    <option value="Silver">Silver</option>
                    <option value="Gray">Gray</option>
                    <option value="Red">Red</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Orange">Orange</option>
                  </datalist>
                </div>

                <div>
                  <label>Year</label>
                  <input 
                    type="number" 
                    placeholder="2027" 
                    value={form.year}
                    onChange={e => setForm({...form, year: e.target.value})} 
                    min="1990"
                    max="2027"
                    required 
                  />
                </div>

                <div>
                  <label>Kilometrage (km)</label>
                  <input 
                    placeholder="0" 
                    type="number" 
                    value={form.kilometrage}
                    onChange={e => setForm({...form, kilometrage: e.target.value})} 
                  />
                </div>

                <div>
                  <label>Fuel Type</label>
                  <select 
                    value={form.fuelType}
                    onChange={e => setForm({...form, fuelType: e.target.value})} 
                    required
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Essence">Essence</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label>Vehicle Type</label>
                  <select 
                    value={form.vehicleType.id}
                    onChange={e => setForm({...form, vehicleType: { id: e.target.value }})} 
                    required
                  >
                    <option value="">Select Type</option>
                    {types.map(t => (
                      <option key={t.id} value={t.id}>{t.typeName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="vbtn-save">💾 Save</button>
                  <button type="button" className="vbtn-cancel" onClick={() => { setShowForm(false); setEditVehicle(null); resetForm(); }}>
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;
