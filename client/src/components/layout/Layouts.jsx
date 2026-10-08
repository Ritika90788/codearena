import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Moon,
  Sun,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Menu,
} from 'lucide-react';

export const CandidateLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/problems?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Candidate';
  const initial = displayName[0].toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-primary)' }}>
      {/* Responsive Left Sidebar */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            gap: '1rem',
          }}
        >
          {/* Mobile Sidebar Hamburger Trigger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden"
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search problems, topics, missions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.5rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-primary)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                title="Notifications"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <Bell size={17} />
              </button>
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#f43f5e',
                  border: '2px solid var(--bg-secondary)',
                }}
              />
            </div>

            {/* User Profile or Sign In / Sign Up */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.3rem 0.65rem 0.3rem 0.35rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#ffe4e6',
                      color: '#f43f5e',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                    }}
                  >
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name ? user.name.split(' ')[0] : 'User'}
                  </span>
                  <ChevronDown size={13} color="var(--text-muted)" />
                </button>

                {dropdownOpen && (
                  <div
                    className="card-glass animate-fade-in"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '180px',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '0.4rem',
                      zIndex: 50,
                    }}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                      }}
                    >
                      <User size={15} /> My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                    textDecoration: 'none',
                    backgroundColor: 'var(--bg-primary)',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(244, 63, 94, 0.25)',
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const InstructorLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const PublicLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};
