import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Drivers.css";
import "./nav.css";

const API = 'http://localhost:8080/api';

function Drivers() {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [manageHistory, setManageHistory] = useState({});
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [assignmentStartDate, setAssignmentStartDate] = useState('');
const [assignmentEndDate, setAssignmentEndDate] = useState('');
  const [form, setForm] = useState({
    employeeType: 'DRIVER',
    firstName: '', lastName: '', phone: '',
    email: '', address: '', dateOfBirth: '',
    licenseNumber: '', licenseExpiry: '',
    organization: { id: '' },
    assignedVehicleId: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchEmployees();
    fetchVehicles();
    fetchOrganizations();
  }, []);

  useEffect(() => {
    employees.forEach(e => fetchManageHistory(e.id));
  }, [employees]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`, { headers });
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API}/vehicles`, { headers });
      setVehicles(res.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(`${API}/organizations`, { headers });
      setOrganizations(res.data);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchManageHistory = async (employeeId) => {
    try {
      const res = await axios.get(`${API}/manage/history/employee/${employeeId}`, { headers });
      const active = res.data.find(m => m.removedAt === null);
      const lastRemoved = res.data
        .filter(m => m.removedAt !== null)
        .sort((a, b) => new Date(b.removedAt) - new Date(a.removedAt))[0];
      setManageHistory(prev => ({ ...prev, [employeeId]: active || lastRemoved }));
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        employeeType: form.employeeType,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        dateOfBirth: form.dateOfBirth,
        organization: form.organization.id ? { id: form.organization.id } : null,
        licenseNumber: form.employeeType === 'DRIVER' ? form.licenseNumber : null,
        licenseExpiry: form.employeeType === 'DRIVER' ? form.licenseExpiry : null
      };
      
      if (editEmployee) {
        await axios.put(`${API}/employees/${editEmployee.id}`, data, { headers });
        
        if (form.employeeType === 'EMPLOYEE') {
          const currentVehicle = editEmployee.currentlyAssignedVehicle;
          if (form.assignedVehicleId !== (currentVehicle?.id || '')) {
            if (currentVehicle) {
              await axios.delete(`${API}/employees/${editEmployee.id}/remove-vehicle`, { headers });
            }
            if (form.assignedVehicleId) {
              await axios.post(`${API}/employees/${editEmployee.id}/assign-vehicle/${form.assignedVehicleId}`, {}, { headers });
            }
          }
        }
      } else {
        await axios.post(`${API}/employees`, data, { headers });
      }
      
      setShowForm(false);
      setEditEmployee(null);
      resetForm();
      fetchEmployees();
      fetchVehicles();
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error saving!');
    }
  };

  const resetForm = () => {
    setForm({
      employeeType: 'DRIVER',
      firstName: '', lastName: '', phone: '',
      email: '', address: '', dateOfBirth: '',
      licenseNumber: '', licenseExpiry: '',
      organization: { id: '' },
      assignedVehicleId: ''
    });
  };

  const handleEdit = (employee) => {
    setEditEmployee(employee);
    setForm({
      employeeType: employee.employeeType || 'DRIVER',
      firstName: employee.firstName,
      lastName: employee.lastName,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      dateOfBirth: employee.dateOfBirth,
      licenseNumber: employee.licenseNumber || '',
      licenseExpiry: employee.licenseExpiry || '',
      organization: { id: employee.organization?.id || '' },
      assignedVehicleId: employee.currentlyAssignedVehicle?.id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API}/employees/${id}`, { headers });
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting:', err);
        alert('Error deleting!');
      }
    }
  };

 const handleAssignVehicle = async () => {
  if (!assignVehicleId) {
    alert('Please select a vehicle');
    return;
  }
  if (!assignmentStartDate) {
    alert('Please select start date');
    return;
  }
  try {
    await axios.post(`${API}/employees/${selectedEmployee.id}/assign-vehicle/${assignVehicleId}`, {
      startDate: assignmentStartDate,
      endDate: assignmentEndDate
    }, { headers });
    setShowAssignForm(false);
    setAssignVehicleId('');
    setAssignmentStartDate('');
    setAssignmentEndDate('');
    fetchEmployees();
    fetchVehicles();
    alert('Vehicle assigned successfully!');
  } catch (err) {
    console.error('Error assigning vehicle:', err);
    alert(err.response?.data?.message || 'Error assigning vehicle!');
  }
};

  const handleRemoveVehicle = async () => {
    try {
      await axios.delete(`${API}/employees/${selectedEmployee.id}/remove-vehicle`, { headers });
      setShowAssignForm(false);
      fetchEmployees();
      fetchVehicles();
      alert('Vehicle removed successfully!');
    } catch (err) {
      console.error('Error removing vehicle:', err);
      alert('Error removing vehicle!');
    }
  };

  const getStatusClass = (employee) => {
    if (employee.employeeStatus === 'ON_MISSION') return 'status-on-mission-red';
    if (employee.employeeStatus === 'AVAILABLE') return 'status-available-green';
    return 'status-default';
  };

  const getStatusText = (employee) => {
    if (employee.employeeStatus === 'ON_MISSION') return 'On Mission';
    if (employee.employeeStatus === 'AVAILABLE') return 'Available';
    return 'Unknown';
  };

  const getDisplayId = (employee) => {
    return employee.displayId || `${employee.employeeType === 'EMPLOYEE' ? 'Employee' : 'Driver'} N0${employee.id}`;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const drivers = employees.filter(e => e.employeeType === 'DRIVER');
  const employeesOnly = employees.filter(e => e.employeeType === 'EMPLOYEE');

  const filteredDrivers = drivers.filter(d => {
    const matchSearch = `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase());
    if (filter === 'All' || filter === 'Driver') return matchSearch;
    if (filter === 'Available') return d.employeeStatus === 'AVAILABLE' && matchSearch;
    if (filter === 'On Route') return d.employeeStatus === 'ON_MISSION' && matchSearch;
    return matchSearch;
  });

  const filteredEmployees = employeesOnly.filter(e => {
    const matchSearch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase());
    if (filter === 'All' || filter === 'Employee') return matchSearch;
    if (filter === 'Available') return e.employeeStatus === 'AVAILABLE' && matchSearch;
    return matchSearch;
  });

  const showDriversSection = filter === 'All' || filter === 'Driver' || filter === 'Available' || filter === 'On Route';
  const showEmployeesSection = filter === 'All' || filter === 'Employee' || filter === 'Available';

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
            <a className="active"><i className="fas fa-user"></i><p>Employees</p></a>
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
          <h2 style={{ fontSize: '40px' }}>Drivers & Employees</h2>
          <button className="btn-add" onClick={() => { setShowForm(true); setEditEmployee(null); resetForm(); }}>
            + Add Employee
          </button>
        </div>

        <div className="content-body">
          {/* FILTERS */}
          <div className="filters">
            {['All', 'Driver', 'Employee', 'Available', 'On Route'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active-filter' : ''}`}
                onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
            <input className="search-input" placeholder="🔍 Search..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* DRIVERS SECTION */}
          {showDriversSection && filteredDrivers.length > 0 && (
            <>
              <div className="section-title">
                <h3>🚗 Drivers</h3>
                <span className="section-count">{filteredDrivers.length}</span>
              </div>
              <div className="cards-grid">
                {filteredDrivers.map(d => (
                  <div key={d.id} className="driver-card">
                    <div className="card-top">
                      <div className="avatar">
                        <div className="avatar-initials">
                          {getInitials(d.firstName, d.lastName)}
                        </div>
                      </div>
                      <div className="driver-name">{d.firstName} {d.lastName}</div>
                      <div className="badges">
                        <span className="badge-id">{getDisplayId(d)}</span>
                        <span className={`badge-status ${getStatusClass(d)}`}>
                          {getStatusText(d)}
                        </span>
                      </div>
                    </div>

                    <div className="card-info">
                      <div className="info-row">📞 {d.phone}</div>
                      <div className="info-row">📧 {d.email}</div>
                      <div className="info-row">🪪 {d.licenseNumber}</div>
                      <div className="info-row">📅 Exp: {d.licenseExpiry}</div>
                      <div className="info-row">🏢 {d.organization?.name || 'No Organization'}</div>
                    </div>

                    {d.currentlyAssignedVehicle ? (
                      <div className="vehicle-assignment-info">
                        <div className="vehicle-header">
                          <span className="vehicle-icon">🚗</span>
                          <span className="vehicle-plate">{d.currentlyAssignedVehicle.plateNumber}</span>
                          <span className="vehicle-model">
                            {d.currentlyAssignedVehicle.brand?.brandName} {d.currentlyAssignedVehicle.model}
                          </span>
                        </div>
                        {d.vehicleAssignedAt && (
                          <div className="assignment-dates">
                            <span className="assigned-date">
                              📅 Assigned: {new Date(d.vehicleAssignedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="vehicle-assignment-info empty">
                        <span className="vehicle-icon">🚫</span>
                        <span>No vehicle assigned</span>
                      </div>
                    )}

                    <div className="card-buttons">
                      <button className="btn-edit" onClick={() => handleEdit(d)}>✏️ Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(d.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* EMPLOYEES SECTION */}
          {showEmployeesSection && filteredEmployees.length > 0 && (
            <>
              <div className="section-title">
                <h3>Employees</h3>
                <span className="section-count">{filteredEmployees.length}</span>
              </div>
              <div className="cards-grid">
                {filteredEmployees.map(e => (
                  <div key={e.id} className="driver-card">
                    <div className="card-top">
                      <div className="avatar">
                        <div className="avatar-initials">
                          {getInitials(e.firstName, e.lastName)}
                        </div>
                      </div>
                      <div className="driver-name">{e.firstName} {e.lastName}</div>
                      <div className="badges">
                        <span className="badge-id">{getDisplayId(e)}</span>
                        <span className={`badge-status ${getStatusClass(e)}`}>
                          {getStatusText(e)}
                        </span>
                      </div>
                    </div>

                    <div className="card-info">
                      <div className="info-row">📞 {e.phone}</div>
                      <div className="info-row">📧 {e.email}</div>
                      <div className="info-row">🏢 {e.organization?.name || 'No Organization'}</div>
                    </div>

                    {/* Employee Vehicle Assignment with History */}
                    {e.currentlyAssignedVehicle ? (
                      <div 
                        className="vehicle-assignment-info"
                        onClick={() => { setSelectedEmployee(e); setShowAssignForm(true); setAssignVehicleId(e.currentlyAssignedVehicle.id || ''); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="vehicle-header">
                          <span className="vehicle-icon"></span>
                          <span className="vehicle-plate">{e.currentlyAssignedVehicle.plateNumber}</span>
                          <span className="vehicle-model">
                            {e.currentlyAssignedVehicle.brand?.brandName} {e.currentlyAssignedVehicle.model}
                          </span>
                        </div>
                        <div className="assignment-dates-employee">
                          <span className="assigned-date">
                            📅 Assigned: {e.vehicleAssignedAt ? new Date(e.vehicleAssignedAt).toLocaleString() : 'N/A'}
                          </span>
                          {e.vehicleRemovedAt && (
                            <span className="removed" >
                              🚫 Removed: {new Date(e.vehicleRemovedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="vehicle-assignment-info empty"
                        onClick={() => { setSelectedEmployee(e); setShowAssignForm(true); setAssignVehicleId(''); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="vehicle-icon">+</span>
                        <span> Click to assign vehicle</span>
                        {e.vehicleRemovedAt && (
                          <div className="removed-date" style={{ marginTop: '5px', fontSize: '18px' }}>
                            🚫 Last removed: {new Date(e.vehicleRemovedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="card-buttons">
                      <button className="btn-edit" onClick={() => handleEdit(e)}>✏️ Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(e.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {filteredDrivers.length === 0 && filteredEmployees.length === 0 && (
            <div className="empty-state">
              <p>📭 No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-driver">
      
            <h3>{editEmployee ? '✏️ Edit' : '➕ Add Employee'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Type</label>
                  <select 
                    value={form.employeeType}
                    onChange={e => setForm({ ...form, employeeType: e.target.value })}
                    required
                  >
                    <option value="DRIVER">🚗 Driver (has license)</option>
                    <option value="EMPLOYEE">👔 Employee (no license)</option>
                  </select>
                </div>

                <div>
                  <label>First Name</label>
                  <input 
                    placeholder="First Name" 
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })} 
                    required />
                </div>
                
                <div>
                  <label>Last Name</label>
                  <input 
                    placeholder="Last Name" 
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })} 
                    required />
                </div>
                
                <div>
                  <label>Phone</label>
                  <input 
                    placeholder="Phone" 
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                    required />
                </div>
                
                <div>
                  <label>Email</label>
                  <input 
                    placeholder="Email" 
                    type="email" 
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    required />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Address</label>
                  <input 
                    placeholder="Address" 
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                
                <div>
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    value={form.dateOfBirth}
                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>

                {form.employeeType === 'DRIVER' && (
                  <>
                    <div>
                      <label>License Number</label>
                      <input 
                        placeholder="License Number" 
                        value={form.licenseNumber}
                        onChange={e => setForm({ ...form, licenseNumber: e.target.value })} 
                        required />
                    </div>
                    <div>
                      <label>License Expiry</label>
                      <input 
                        type="date" 
                        value={form.licenseExpiry}
                        onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} 
                        required />
                    </div>
                  </>
                )}

                <div style={{ gridColumn: 'span 2' }}>
                  <label>Organization</label>
                  <select 
                    value={form.organization.id}
                    onChange={e => setForm({ ...form, organization: { id: e.target.value } })}>
                    <option value="">Select Organization</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="btn-Dsave">💾 Save</button>
                  <button type="button" className="btn-Dcancel" onClick={() => setShowForm(false)}>❌ Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN VEHICLE MODAL - ONLY FOR EMPLOYEES */}
{showAssignForm && selectedEmployee && selectedEmployee.employeeType === 'EMPLOYEE' && (
  <div className="modal-overlay">
    <div className="modal-assign">
              {/* X Button - Close Modal */}
              <button className="btn-x" onClick={() => { setShowAssignForm(false); setAssignVehicleId(''); setAssignmentStartDate(''); setAssignmentEndDate(''); }}>

        ✕
      </button>


      <h3>Assign Vehicle to {selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
      
      {selectedEmployee.currentlyAssignedVehicle && (
        <div className="modal-assign-header" >
          <p style={{ color: '#FFD700', marginBottom: '8px' }}>Currently Assigned:</p>
          <p style={{ color: 'white' }}>
            🚗 {selectedEmployee.currentlyAssignedVehicle.plateNumber} - {selectedEmployee.currentlyAssignedVehicle.model}
          </p>
          <p style={{ color: '#aaa', fontSize: '15px', marginTop: '5px' }}>
            📅 Since: {selectedEmployee.vehicleAssignedAt ? new Date(selectedEmployee.vehicleAssignedAt).toLocaleString() : 'N/A'}
          </p>
        </div>
      )}
      
      <div className="form-assign">
        <div className='select'>
        <label>Select Vehicle</label>
        <select 
          value={assignVehicleId}
          onChange={e => setAssignVehicleId(e.target.value)}
        >
          <option value="">-- Select Vehicle --</option>
          {vehicles.filter(v => v.status === 'AVAILABLE').map(v => (
            <option key={v.id} value={v.id}>
              {v.plateNumber} - {v.brand?.brandName} {v.model}
            </option>
          ))}
        </select>
      </div>

      <div className="date-row">
        <div className="form-group">
          <label>Start Date</label>
          <input 
            type="date"
            value={assignmentStartDate}
            onChange={e => setAssignmentStartDate(e.target.value)}
          />
        </div>
        <div className="form-group" >
          <label>End Date</label>
          <input 
            type="date"
            value={assignmentEndDate}
            onChange={e => setAssignmentEndDate(e.target.value)}
          />
        </div>
      </div>
</div>
      <div className="form-buttons" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="btn-assign" onClick={handleAssignVehicle} style={{ flex: 1 }}>
           Assign
        </button>
        {selectedEmployee.currentlyAssignedVehicle && (
          <button className="btn-remove" onClick={handleRemoveVehicle} style={{ flex: 1 }}>
            🚫 Remove
          </button>
        )}
        <button className="btn-cancel" onClick={() => { setShowAssignForm(false); setAssignVehicleId(''); setAssignmentStartDate(''); setAssignmentEndDate(''); }} style={{ flex: 1 }}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Drivers;