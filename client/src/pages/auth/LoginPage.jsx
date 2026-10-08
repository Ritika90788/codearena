import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Terminal, Lock, Mail, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'candidate') {
      setEmail('candidate@codearena.demo');
      setPassword('password123');
    } else {
      setEmail('instructor@codearena.demo');
      setPassword('password123');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: 'var(--bg-primary)',
        background: 'radial-gradient(circle at 50% 30%, rgba(244, 63, 94, 0.06), transparent 70%)',
      }}
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          borderRadius: '1.25rem',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-primary)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)',
            }}
          >
            <Terminal size={22} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Sign In to CodeArena
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Enter your credentials to access your assessment workspace.
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.65rem',
              textAlign: 'center',
            }}
          >
            ⚡ Quick Demo Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => handleDemoFill('candidate')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
            >
              <UserCheck size={14} color="#10b981" />
              <span>Candidate Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('instructor')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
            >
              <ShieldAlert size={14} color="#a855f7" />
              <span>Instructor Demo</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-primary)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR SIGN IN WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-primary)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.4rem',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                required
                className="input-arena"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                required
                className="input-arena"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Register Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
