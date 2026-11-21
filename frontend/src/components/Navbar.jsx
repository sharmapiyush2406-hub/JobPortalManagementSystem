import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  User, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Search
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin, isCandidate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* LOGO */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--primary)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Briefcase size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '20px',
              fontWeight: '800',
              color: 'var(--text-main)',
              letterSpacing: '-0.5px'
            }}>
              Job<span style={{ color: 'var(--primary)' }}>Portal</span>
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '-4px', fontWeight: '500' }}>
              Core Java &bull; Servlets &bull; JDBC
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px'
        }}>
          <Link 
            to="/" 
            style={{
              fontWeight: isActive('/') ? '700' : '500',
              color: isActive('/') ? 'var(--primary)' : 'var(--text-main)',
              fontSize: '14px'
            }}
          >
            Home
          </Link>

          <Link 
            to="/jobs" 
            style={{
              fontWeight: isActive('/jobs') ? '700' : '500',
              color: isActive('/jobs') ? 'var(--primary)' : 'var(--text-main)',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Search size={15} /> Browse Jobs
          </Link>

          {/* CANDIDATE SPECIFIC LINKS */}
          {isCandidate && (
            <>
              <Link 
                to="/candidate/applications" 
                style={{
                  fontWeight: isActive('/candidate/applications') ? '700' : '500',
                  color: isActive('/candidate/applications') ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '14px'
                }}
              >
                My Applications
              </Link>
              <Link 
                to="/candidate/dashboard" 
                style={{
                  fontWeight: isActive('/candidate/dashboard') ? '700' : '500',
                  color: isActive('/candidate/dashboard') ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '14px'
                }}
              >
                Dashboard
              </Link>
            </>
          )}

          {/* ADMIN SPECIFIC LINKS */}
          {isAdmin && (
            <Link 
              to="/admin/dashboard" 
              style={{
                fontWeight: '600',
                color: 'var(--primary)',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary-light)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <ShieldCheck size={16} /> Admin Panel
            </Link>
          )}
        </div>

        {/* AUTH BUTTONS OR PROFILE DROPDOWN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: isAdmin ? '#fef3c7' : 'var(--primary-light)',
                  color: isAdmin ? '#b25e00' : 'var(--primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '11px', color: isAdmin ? '#b25e00' : 'var(--text-muted)' }}>
                    {isAdmin ? 'Administrator' : 'Candidate'}
                  </span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {/* DROPDOWN MENU */}
              {dropdownOpen && (
                <div 
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '220px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px 0',
                    zIndex: 200
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {user.email}
                    </div>
                  </div>

                  {isCandidate && (
                    <>
                      <Link 
                        to="/candidate/dashboard"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: 'var(--text-main)',
                          transition: 'background 0.2s'
                        }}
                      >
                        <LayoutDashboard size={16} /> Candidate Dashboard
                      </Link>
                      <Link 
                        to="/candidate/applications"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: 'var(--text-main)',
                          transition: 'background 0.2s'
                        }}
                      >
                        <FileText size={16} /> My Applications
                      </Link>
                      <Link 
                        to="/candidate/profile"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: 'var(--text-main)',
                          transition: 'background 0.2s'
                        }}
                      >
                        <User size={16} /> Account Profile
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <Link 
                        to="/admin/dashboard"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: 'var(--text-main)',
                          transition: 'background 0.2s'
                        }}
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                      <Link 
                        to="/admin/jobs"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: 'var(--text-main)',
                          transition: 'background 0.2s'
                        }}
                      >
                        <Briefcase size={16} /> Manage Jobs
                      </Link>
                      <Link 
                        to="/admin/applications"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: 'var(--text-main)',
                          transition: 'background 0.2s'
                        }}
                      >
                        <FileText size={16} /> Manage Applications
                      </Link>
                    </>
                  )}

                  <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      color: 'var(--danger)',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Candidate Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
              <Link 
                to="/admin/login" 
                style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-muted)', 
                  fontWeight: '600',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)'
                }}
              >
                Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
