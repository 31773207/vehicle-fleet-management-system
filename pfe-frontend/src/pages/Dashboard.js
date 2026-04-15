import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './nav.css';
import './Vehicles.css';
import './Dashboard.css';

const API = 'http://localhost:8080/api';

function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/stats`, { headers });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

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
            <a className="active"><i className="fas fa-home"></i><p>Dashboard</p></a>
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

        <div className="content-header" style={{ marginBottom: '24px' }}>
          <h2>📊 Dashboard</h2>
          <button
            onClick={fetchStats}
            style={{
              padding: '8px 18px', background: 'transparent',
              border: '1px solid rgba(255,215,0,0.4)', borderRadius: '6px',
              color: '#FFD700', cursor: 'pointer', fontSize: '13px'
            }}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.5)' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}></i>
            Loading dashboard...
          </div>
        ) : !stats ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#ea4335' }}>
            ⚠️ Failed to load stats. Make sure the backend is running.
          </div>
        ) : (
          <>
            {/* ── SECTION 1: VEHICLES ── */}
            <SectionTitle icon="fa-car" title="Fleet Overview" onNavigate={() => navigate('/vehicles')} />
            <div style={gridStyle(4)}>
              <KpiCard label="Total Vehicles"  value={stats.totalVehicles}  color="#FFD700" icon="fa-car" />
              <KpiCard label="Active"          value={stats.activeVehicles} color="#34a853" icon="fa-check-circle"
                onClick={() => navigate('/vehicles')} />
              <KpiCard label="In Mission"      value={stats.inMission}      color="#1a73e8" icon="fa-road" />
              <KpiCard label="In Revision"     value={stats.inRevision}     color="#fbbc04" icon="fa-search" />
              <KpiCard label="Breakdown"       value={stats.breakdown}      color="#ea4335" icon="fa-exclamation-triangle"
                onClick={() => navigate('/vehicles')} />
              <KpiCard label="Assigned"        value={stats.assignedVehicles} color="#9c27b0" icon="fa-link" />
              <KpiCard label="Reformed"        value={stats.reformed}       color="#9e9e9e" icon="fa-archive" />
              <KpiCard label="Total Drivers"   value={stats.totalDrivers}   color="#00bcd4" icon="fa-users"
                onClick={() => navigate('/drivers')} />
            </div>

            <Divider />

            {/* ── SECTION 2: MISSIONS ── */}
            <SectionTitle icon="fa-id-card" title="Missions" onNavigate={() => navigate('/missions')} />
            <div style={gridStyle(5)}>
              <KpiCard label="Total Missions"   value={stats.totalMissions}      color="#FFD700" icon="fa-flag" />
              <KpiCard label="Planned"          value={stats.missionsPlanned}    color="#fbbc04" icon="fa-calendar" />
              <KpiCard label="In Progress"      value={stats.missionsInProgress} color="#1a73e8" icon="fa-spinner" />
              <KpiCard label="Completed"        value={stats.missionsCompleted}  color="#34a853" icon="fa-check" />
              <KpiCard label="Cancelled"        value={stats.missionsCancelled}  color="#ea4335" icon="fa-times" />
            </div>

            <Divider />

            {/* ── SECTION 3: MAINTENANCE ── */}
            <SectionTitle icon="fa-tools" title="Maintenance" onNavigate={() => navigate('/maintenance')} />
            <div style={gridStyle(4)}>
              <KpiCard label="Total Records"  value={stats.totalMaintenance}    color="#FFD700" icon="fa-clipboard-list" />
              <KpiCard label="Scheduled"      value={stats.scheduledMaintenance} color="#fbbc04" icon="fa-calendar-check" />
              <KpiCard label="In Progress"    value={stats.openMaintenance}     color="#1a73e8" icon="fa-wrench" />
              <KpiCard label="Completed"      value={stats.doneMaintenance}     color="#34a853" icon="fa-check-double" />
            </div>

            {/* Maintenance cost banner */}
            <div style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: '10px', padding: '16px 24px', marginTop: '12px',
              display: 'flex', alignItems: 'center', gap: '12px',
              backdropFilter: 'blur(8px)'
            }}>
              <i className="fas fa-coins" style={{ color: '#FFD700', fontSize: '24px' }}></i>
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Maintenance Cost
                </div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFD700' }}>
                  {Number(stats.totalMaintenanceCost).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DZD
                </div>
              </div>
            </div>

            <Divider />

            {/* ── SECTION 4: TECHNICAL CHECKS ── */}
            <SectionTitle icon="fa-clipboard-check" title="Technical Checks" onNavigate={() => navigate('/technical-checks')} />
            <div style={gridStyle(3)}>
              <KpiCard label="Valid"          value={stats.validChecks}   color="#34a853" icon="fa-check-circle" />
              <KpiCard label="Expired"        value={stats.expiredChecks} color="#ea4335" icon="fa-times-circle"
                onClick={() => navigate('/technical-checks')} />
              <KpiCard label="Expiring Soon"  value={stats.expiringSoon}  color="#fbbc04" icon="fa-exclamation-circle"
                onClick={() => navigate('/technical-checks')} />
            </div>

            {/* Alert if any expiring soon */}
            {stats.expiringSoon > 0 && (
              <div style={{
                marginTop: '12px', background: 'rgba(251,188,4,0.15)',
                border: '1px solid #fbbc04', borderRadius: '8px',
                padding: '12px 18px', display: 'flex', alignItems: 'center',
                gap: '10px', color: '#fbbc04', fontSize: '14px'
              }}>
                <i className="fas fa-exclamation-triangle"></i>
                <span>
                  <strong>{stats.expiringSoon}</strong> vehicle(s) have technical checks expiring within 15 days.
                </span>
                <button onClick={() => navigate('/technical-checks')}
                  style={{
                    marginLeft: 'auto', background: '#fbbc04', color: '#333',
                    border: 'none', borderRadius: '4px', padding: '4px 14px',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                  }}>
                  View →
                </button>
              </div>
            )}

            <Divider />

            {/* ── SECTION 5: FUEL / GAS COUPONS ── */}
            <SectionTitle icon="fa-gas-pump" title="Fuel & Coupons" onNavigate={() => navigate('/gas-coupons')} />
            <div style={gridStyle(4)}>
              <KpiCard label="Available"    value={stats.couponsAvailable}   color="#34a853" icon="fa-ticket-alt" />
              <KpiCard label="Assigned"     value={stats.couponsAssigned}    color="#1a73e8" icon="fa-user-check" />
              <KpiCard label="Used"         value={stats.couponsUsed}        color="#9e9e9e" icon="fa-check-circle" />
              <KpiCard label="Transferred"  value={stats.couponsTransferred} color="#ff9800" icon="fa-exchange-alt" />
            </div>

            {/* Total fuel banner */}
            <div style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: '10px', padding: '16px 24px', marginTop: '12px',
              display: 'flex', alignItems: 'center', gap: '12px',
              backdropFilter: 'blur(8px)'
            }}>
              <i className="fas fa-gas-pump" style={{ color: '#34a853', fontSize: '24px' }}></i>
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Fuel Consumed
                </div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#34a853' }}>
                  {Number(stats.totalFuelUsed).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} L
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

// ── REUSABLE COMPONENTS ──

function SectionTitle({ icon, title, onNavigate }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <i className={`fas ${icon}`} style={{ color: '#FFD700', fontSize: '18px' }}></i>
        <span style={{ fontSize: '16px', fontWeight: '600', color: 'rgba(255,255,255,0.85)',
          textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
      </div>
      <button onClick={onNavigate} style={{
        background: 'transparent', border: '1px solid rgba(255,215,0,0.3)',
        borderRadius: '4px', color: 'rgba(255,215,0,0.7)', cursor: 'pointer',
        fontSize: '12px', padding: '3px 10px'
      }}>
        View all →
      </button>
    </div>
  );
}

function KpiCard({ label, value, color, icon, onClick }) {
  return (
    <div onClick={onClick}
      style={{
        background: 'rgba(0,0,0,0.45)', borderRadius: '10px',
        padding: '16px 18px', border: `1px solid rgba(255,255,255,0.08)`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s', backdropFilter: 'blur(8px)',
        borderLeft: `3px solid ${color}`,
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {label}
        </span>
        <i className={`fas ${icon}`} style={{ color, fontSize: '16px', opacity: 0.8 }}></i>
      </div>
      <div style={{ fontSize: '26px', fontWeight: 'bold', color }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'rgba(255,215,0,0.1)', margin: '24px 0' }} />;
}

function gridStyle(cols) {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '12px',
    marginBottom: '8px'
  };
}

export default Dashboard;