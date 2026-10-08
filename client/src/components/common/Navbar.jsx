import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun,
  Moon,
  LogOut,
  User,
  LayoutDashboard,
  Shield,
  ChevronDown,
  Terminal,
  FileCode2,
  Compass,
  Menu,
  X,
  Code2,
  Bot,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isInstructor, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)',
        backdropFilter: 'blur(12px)',
        height: '60px',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          height: '100%',
          padding: '0 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'inherit',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(236, 72, 153, 0.3)',
            }}
          >
            <Terminal size={18} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #f43f5e 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CodeArena
          </span>
        </Link>

        {/* Center: Clean Spacious Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="hidden md:flex"
        >
          {isInstructor ? (
            <>
              <Link
                to="/instructor/dashboard"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive('/instructor/dashboard') ? 700 : 500,
                  color: isActive('/instructor/dashboard') ? '#ec4899' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/instructor/problems"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive('/instructor/problems') ? 700 : 500,
                  color: isActive('/instructor/problems') ? '#ec4899' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
              >
                Problems
              </Link>
              <Link
                to="/instructor/assessments"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive('/instructor/assessments') ? 700 : 500,
                  color: isActive('/instructor/assessments') ? '#ec4899' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
              >
                Assessments
              </Link>
              <Link
                to="/instructor/submissions"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive('/instructor/submissions') ? 700 : 500,
                  color: isActive('/instructor/submissions') ? '#ec4899' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
              >
                Submissions
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/problems"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive('/problems') ? 700 : 500,
                  color: isActive('/problems') ? '#ec4899' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
              >
                Problems
              </Link>
              <Link
                to="/assessments"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive('/assessments') ? 700 : 500,
                  color: isActive('/assessments') ? '#ec4899' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
              >
                Assessments
              </Link>
              <Link
                to="/missions"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive('/missions') ? 700 : 500,
                  color: isActive('/missions') ? '#ec4899' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
              >
                Missions
              </Link>
              <Link
                to="/interview/simulator"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive('/interview/simulator') ? 700 : 500,
                  color: isActive('/interview/simulator') ? '#ec4899' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
              >
                Interview
              </Link>
              {isAuthenticated && (
                <Link
                  to="/candidate/dashboard"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: isActive('/candidate/dashboard') ? 700 : 500,
                    color: isActive('/candidate/dashboard') ? '#ec4899' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s ease',
                  }}
                >
                  Dashboard
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Section: Role Switcher & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '0.5rem',
              padding: '0.45rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>



          {/* User Profile or Login */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  padding: '0.2rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(236, 72, 153, 0.12)',
                    color: '#ec4899',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name ? user.name.split(' ')[0] : 'User'}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '210px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '0.65rem',
                    border: '1px solid var(--border-primary)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    padding: '0.4rem',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderBottom: '1px solid var(--border-primary)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>

                  <Link
                    to={isInstructor ? '/instructor/dashboard' : '/candidate/dashboard'}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      borderRadius: '0.35rem',
                    }}
                  >
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      borderRadius: '0.35rem',
                    }}
                  >
                    <User size={14} />
                    <span>My Profile</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.82rem',
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      borderRadius: '0.35rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: '0.25rem',
                      borderTop: '1px solid var(--border-primary)',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-pink btn-sm" style={{ textDecoration: 'none' }}>
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden"
            style={{
              padding: '0.45rem',
              borderRadius: '0.45rem',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden animate-fade-in"
          style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-primary)',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            zIndex: 99,
          }}
        >
          {isInstructor ? (
            <>
              <Link
                to="/instructor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive('/instructor/dashboard') ? 700 : 500,
                  color: isActive('/instructor/dashboard') ? '#ec4899' : 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/instructor/problems"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive('/instructor/problems') ? 700 : 500,
                  color: isActive('/instructor/problems') ? '#ec4899' : 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                }}
              >
                Problems Repository
              </Link>
              <Link
                to="/instructor/assessments"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive('/instructor/assessments') ? 700 : 500,
                  color: isActive('/instructor/assessments') ? '#ec4899' : 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                }}
              >
                Assessments
              </Link>
              <Link
                to="/instructor/submissions"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive('/instructor/submissions') ? 700 : 500,
                  color: isActive('/instructor/submissions') ? '#ec4899' : 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                }}
              >
                Submissions
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/problems"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive('/problems') ? 700 : 500,
                  color: isActive('/problems') ? '#ec4899' : 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                }}
              >
                Problems
              </Link>
              <Link
                to="/assessments"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive('/assessments') ? 700 : 500,
                  color: isActive('/assessments') ? '#ec4899' : 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                }}
              >
                Assessments
              </Link>
              <Link
                to="/missions"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive('/missions') ? 700 : 500,
                  color: isActive('/missions') ? '#ec4899' : 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                }}
              >
                Missions
              </Link>
              <Link
                to="/interview/simulator"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive('/interview/simulator') ? 700 : 500,
                  color: isActive('/interview/simulator') ? '#ec4899' : 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                }}
              >
                AI Interview
              </Link>
            </>
          )}

          <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={switchRole}
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Mode: {isInstructor ? 'Instructor' : 'Candidate'} (Switch)
            </button>
            <button
              onClick={toggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
