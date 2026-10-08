import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Terminal, Lock, Mail, User, Shield, CheckCircle, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const user = await register({ name, email, password, role });
      success(`Welcome to CodeArena, ${user.name}!`);

      if (user.role === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        backgroundColor: 'var(--bg-primary)',
        background: 'radial-gradient(circle at 50% 30%, rgba(244, 63, 94, 0.06), transparent 70%)',
      }}
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
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
            Create Your Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Join CodeArena to start assessing, coding, or conducting evaluations.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            Select Your Role
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setRole('candidate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1.5px solid ${role === 'candidate' ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                backgroundColor: role === 'candidate' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-tertiary)',
                color: role === 'candidate' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.15s',
              }}
            >
              <User size={16} color={role === 'candidate' ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('instructor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1.5px solid ${role === 'instructor' ? '#a855f7' : 'var(--border-primary)'}`,
                backgroundColor: role === 'instructor' ? 'rgba(168, 85, 247, 0.12)' : 'var(--bg-tertiary)',
                color: role === 'instructor' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.15s',
              }}
            >
              <Shield size={16} color={role === 'instructor' ? '#a855f7' : 'currentColor'} />
              <span>Instructor / Admin</span>
            </button>
          </div>
          <div
            style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            {role === 'candidate'
              ? 'Solve coding problems, take timed assessments & practice AI technical interviews.'
              : 'Create assessments, author test cases, grade candidate submissions & track cohort analytics.'}
          </div>
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
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                required
                className="input-arena"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

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
                placeholder="alex@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

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
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                required
                minLength={6}
                className="input-arena"
                placeholder="At least 6 characters"
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
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Login Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
