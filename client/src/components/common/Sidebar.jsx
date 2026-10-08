import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileCode2,
  Terminal,
  History,
  Bot,
  Compass,
  Code2,
  CheckCircle2,
  Zap,
  ArrowRight,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen = false, onClose }) => {
  const { isInstructor } = useAuth();

  const candidateLinks = [
    { name: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { name: 'Problems', path: '/problems', icon: Code2 },
    { name: 'Assessments', path: '/assessments', icon: FileCode2 },
    { name: 'Missions', path: '/missions', icon: Compass },
    { name: 'Interview', path: '/interview/simulator', icon: Bot },
    { name: 'Solved Problems', path: '/candidate/submissions', icon: CheckCircle2 },
  ];

  const instructorLinks = [
    { name: 'Overview', path: '/instructor/dashboard', icon: LayoutDashboard },
    { name: 'Problems Repository', path: '/instructor/problems', icon: Terminal },
    { name: 'Assessments Manager', path: '/instructor/assessments', icon: FileCode2 },
    { name: 'Submissions Review', path: '/instructor/submissions', icon: History },
  ];

  const links = isInstructor ? instructorLinks : candidateLinks;

  const sidebarContent = (
    <aside
      style={{
        width: '240px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.85rem',
        overflowY: 'auto',
      }}
    >
      <div>
        {/* Brand Logo at Top with Close button on Mobile */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
          <Link
            to="/"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(244, 63, 94, 0.25)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              &gt;_
            </div>
            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#f43f5e',
              }}
            >
              CodeArena
            </span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  color: isActive ? '#f43f5e' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(244, 63, 94, 0.08)' : 'transparent',
                  transition: 'all 0.15s ease-in-out',
                })}
              >
                <Icon size={18} color="currentColor" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Instructor Console Note (if instructor) */}
      {isInstructor && (
        <div
          style={{
            padding: '0.85rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            marginTop: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            Instructor Console
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Manage candidate assessments and evaluate test benchmarks.
          </p>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block" style={{ height: '100vh', position: 'sticky', top: 0, zIndex: 30 }}>
        {sidebarContent}
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isOpen && (
        <div
          className="lg:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Drawer Panel */}
          <div
            className="animate-fade-in"
            style={{
              position: 'relative',
              zIndex: 101,
              width: '260px',
              height: '100%',
              backgroundColor: 'var(--bg-secondary)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
            }}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

