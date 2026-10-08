import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  FileCode2,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Play,
  ArrowLeft,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export const AssessmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, candidateEntry } = useAuth();
  const { success, error } = useToast();

  const [assessment, setAssessment] = useState(null);
  const [candidateSession, setCandidateSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Candidate intake state for unauthenticated link visits
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [intakeLoading, setIntakeLoading] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await api.get(`/assessments/${id}`);
        if (data.success && data.assessment) {
          setAssessment(data.assessment);
          setCandidateSession(data.candidateSession);
        }
      } catch (err) {
        error(err.message || 'Failed to load assessment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleStart = async () => {
    if (!isAuthenticated) {
      setShowIntakeModal(true);
      return;
    }

    try {
      setStarting(true);
      const res = await api.post(`/assessments/${id}/start`, {});
      if (res.success) {
        success('Assessment session initialized. Timer is running!');
        navigate(`/assessments/${id}/arena`);
      }
    } catch (err) {
      if (user?.role === 'instructor' || user?.role === 'admin' || candidateSession?.status === 'in_progress') {
        navigate(`/assessments/${id}/arena`);
        return;
      }
      error(err.message || 'Could not start assessment');
    } finally {
      setStarting(false);
    }
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) {
      error('Please enter both your name and email');
      return;
    }

    try {
      setIntakeLoading(true);
      await candidateEntry(candidateName.trim(), candidateEmail.trim());
      setShowIntakeModal(false);
      setStarting(true);
      const res = await api.post(`/assessments/${id}/start`, {});
      if (res.success) {
        success('Candidate verified! Assessment session initialized.');
      }
      navigate(`/assessments/${id}/arena`);
    } catch (err) {
      error(err.message || 'Failed to start assessment');
    } finally {
      setIntakeLoading(false);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div className="skeleton" style={{ height: '350px', borderRadius: '1rem' }} />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Assessment not found</h2>
        <Link to="/assessments" className="btn btn-secondary" style={{ marginTop: '1rem', textDecoration: 'none' }}>
          Back to Assessments
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <Link
        to="/assessments"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Assessments</span>
      </Link>

      <div
        className="card-glass animate-fade-in"
        style={{
          padding: '2.5rem',
          borderRadius: '1rem',
          border: '1px solid var(--border-secondary)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span className={`badge badge-${assessment.difficulty.toLowerCase()}`} style={{ marginBottom: '0.6rem' }}>
              {assessment.difficulty} Difficulty
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {assessment.title}
            </h1>
          </div>
        </div>

        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          {assessment.description}
        </p>

        {/* Quick Specs Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="card-glass" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DURATION</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
              <Clock size={18} color="var(--accent-primary)" />
              <span>{assessment.duration} mins</span>
            </div>
          </div>

          <div className="card-glass" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>QUESTIONS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
              <FileCode2 size={18} color="#06b6d4" />
              <span>{assessment.problems?.length || 0} Challenges</span>
            </div>
          </div>

          <div className="card-glass" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PASSING BENCHMARK</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
              <Award size={18} color="#10b981" />
              <span>{assessment.passingScore}% ({Math.round(assessment.totalPoints * (assessment.passingScore / 100))} pts)</span>
            </div>
          </div>
        </div>

        {/* Problems List in this Assessment */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            Assessment Content Overview
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {assessment.problems?.map((p, idx) => (
              <div
                key={p._id || idx}
                style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {p.problemId?.title || `Problem #${idx + 1}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>
                      ({p.problemId?.topic || 'Algorithmic'})
                    </span>
                  </div>
                </div>
                <span className="badge badge-info">
                  {p.points || 25} Points
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Proctored Rules & Instructions */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 700, marginBottom: '0.5rem' }}>
            <ShieldAlert size={18} />
            <span>Assessment Instructions & Honor Code</span>
          </div>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li>The timer starts immediately once you click "Launch IDE" and runs continuously.</li>
            <li>Submissions are evaluated across public and hidden test cases for edge condition verification.</li>
            <li>AST structural similarities are recorded for instructor review.</li>
            <li>You can run tests as many times as needed before submitting your final solution.</li>
          </ul>
        </div>

        {/* Start Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleStart}
            disabled={starting}
            className="btn btn-primary btn-lg"
            style={{ padding: '0.85rem 3rem', fontSize: '1.05rem', boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)' }}
          >
            <Play size={18} />
            <span>{starting ? 'Launching Arena...' : 'Begin Assessment & Launch IDE'}</span>
          </button>
        </div>
      </div>

      {/* Candidate Intake Modal for Shared Links */}
      {showIntakeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            className="card-glass animate-fade-in"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '2.25rem',
              borderRadius: '1rem',
              border: '1px solid var(--border-secondary)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'var(--accent-primary)',
                }}
              >
                <Zap size={24} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                Candidate Check-In
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                You were invited to take <strong>{assessment.title}</strong>. Enter your details below to begin your evaluation session.
              </p>
            </div>

            <form onSubmit={handleIntakeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Alex Johnson"
                  className="input-arena"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  className="input-arena"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={intakeLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
                >
                  <Play size={16} />
                  <span>{intakeLoading ? 'Verifying & Initializing...' : 'Start Assessment Now'}</span>
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowIntakeModal(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <Link
                    to="/login"
                    state={{ from: `/assessments/${id}` }}
                    style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none' }}
                  >
                    Already have an account? Sign In
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
