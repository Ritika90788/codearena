import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Award,
  ExternalLink,
  Mail,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';

export const CandidateManagementPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBatch, setFilterBatch] = useState('All');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/candidates');
        if (res.success && res.candidates && res.candidates.length > 0) {
          setCandidates(
            res.candidates.map((c, i) => ({
              id: `CAND-${String(i + 1).padStart(2, '0')}`,
              name: c.name,
              email: c.email,
              batch: 'Registered Candidate',
              status: 'Active',
              readinessScore: c.rating ? Math.round((c.rating / 1500) * 100) : 85,
              assessmentsCompleted: c.assessmentsCompleted || 0,
              problemsSolved: c.problemsSolved || 0,
              lastActive: new Date(c.createdAt).toLocaleDateString(),
              rank: c.problemsSolved > 3 ? 'Top 10%' : 'Enrolled',
            }))
          );
        } else {
          // Fallback if none enrolled yet
          setCandidates([
            {
              id: 'CAND-01',
              name: 'Devon Vance',
              email: 'candidate@codearena.demo',
              batch: 'Registered Candidate',
              status: 'Active',
              readinessScore: 89,
              assessmentsCompleted: 2,
              lastActive: 'Active recently',
              rank: 'Top 10%',
            },
          ]);
        }
      } catch (err) {
        console.warn('Candidates fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) {
      error('Please provide name and email');
      return;
    }
    const newCand = {
      id: `CAND-0${candidates.length + 1}`,
      name: inviteName,
      email: inviteEmail,
      batch: '2026 Full Stack Cohort A',
      status: 'Invited',
      readinessScore: 0,
      assessmentsCompleted: 0,
      lastActive: 'Pending Enrollment',
      rank: 'New',
    };
    setCandidates((prev) => [newCand, ...prev]);
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteName('');
    success(`Invitation sent to ${inviteEmail}`);
  };

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesBatch = filterBatch === 'All' || c.batch === filterBatch;
    return matchesSearch && matchesBatch;
  });

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Users size={22} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Candidate Cohort Directory</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track individual progress, review interview readiness ratings, and inspect submitted code artifacts.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={16} />
          <span>Invite Candidate</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input-arena"
            placeholder="Search candidates by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <select
          value={filterBatch}
          onChange={(e) => setFilterBatch(e.target.value)}
          className="input-arena"
          style={{ width: 'auto', minWidth: '220px' }}
        >
          <option value="All">All Cohorts</option>
          <option value="2026 Full Stack Cohort A">2026 Full Stack Cohort A</option>
          <option value="2026 Systems & Backend Cohort">2026 Systems & Backend Cohort</option>
          <option value="2026 Core Engineering">2026 Core Engineering</option>
        </select>
      </div>

      {/* Candidate Table */}
      <div className="card-glass" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr auto',
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <div>Candidate</div>
          <div>Cohort / Batch</div>
          <div>Status</div>
          <div>Readiness</div>
          <div>Assessments</div>
          <div>Action</div>
        </div>

        <div style={{ divideY: '1px solid var(--border-primary)' }}>
          {filtered.map((cand) => (
            <div
              key={cand.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr auto',
                padding: '1rem 1.25rem',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-primary)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {cand.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {cand.email}
                </div>
              </div>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                {cand.batch}
              </div>

              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor:
                      cand.status === 'Active'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : cand.status === 'Review Required'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(59, 130, 246, 0.15)',
                    color:
                      cand.status === 'Active'
                        ? '#10b981'
                        : cand.status === 'Review Required'
                        ? '#ef4444'
                        : '#60a5fa',
                  }}
                >
                  {cand.status}
                </span>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {cand.readinessScore > 0 ? `${cand.readinessScore}%` : '—'}
                </div>
                {cand.rank && (
                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                    {cand.rank}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {cand.assessmentsCompleted} completed
              </div>

              <div>
                <Link
                  to="/instructor/submissions"
                  className="btn btn-outline btn-sm"
                  style={{ textDecoration: 'none', fontSize: '0.75rem' }}
                >
                  Submissions
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            className="card-glass"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '2rem',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Enroll New Candidate</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  className="input-arena"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Candidate Email Address
                </label>
                <input
                  type="email"
                  className="input-arena"
                  required
                  placeholder="alex.rivera@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
