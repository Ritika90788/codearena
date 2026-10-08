import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FileCode2,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Play,
  RotateCcw,
  BarChart,
  Calendar,
} from 'lucide-react';

export const AssessmentsPage = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const statusOptions = ['All', 'Available', 'Upcoming', 'Completed'];
  const difficultyOptions = ['All', 'Easy', 'Medium', 'Hard', 'Mixed'];

  useEffect(() => {
    const fetchAssessments = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filterStatus !== 'All') queryParams.append('status', filterStatus);
        if (filterDifficulty !== 'All') queryParams.append('difficulty', filterDifficulty);

        const data = await api.get(`/assessments?${queryParams.toString()}`);
        if (data.success && data.assessments) {
          setAssessments(data.assessments);
        }
      } catch (err) {
        console.error('Failed to load assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [filterStatus, filterDifficulty]);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <div
            style={{
              padding: '0.4rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              color: '#06b6d4',
            }}
          >
            <FileCode2 size={22} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Timed Assessments & Challenges
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Standardized, proctored, and adaptive coding evaluations with automated hidden test scoring.
        </p>
      </div>

      {/* Filter Row */}
      <div
        className="card-glass"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by Status:</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {statusOptions.map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Difficulty:</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {difficultyOptions.map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`btn btn-sm ${filterDifficulty === diff ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assessment Cards Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton" style={{ height: '240px', borderRadius: '0.75rem' }} />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <div className="card-glass" style={{ padding: '3.5rem', textAlign: 'center', borderRadius: '0.75rem' }}>
          <FileCode2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No assessments found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            There are no assessments matching the chosen filters.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(370px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {assessments.map((assessment) => {
            const isCompleted = assessment.candidateInfo?.candidateStatus === 'completed';
            const isInProgress = assessment.candidateInfo?.candidateStatus === 'in_progress';
            const isUpcoming = assessment.status === 'Upcoming';

            return (
              <div
                key={assessment._id}
                className="card-glass animate-fade-in"
                style={{
                  padding: '1.75rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isCompleted
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : isInProgress
                    ? '1px solid rgba(59, 130, 246, 0.5)'
                    : '1px solid var(--border-primary)',
                  boxShadow: isInProgress ? '0 0 16px rgba(59, 130, 246, 0.15)' : 'none',
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span className={`badge badge-${assessment.difficulty.toLowerCase()}`}>
                        {assessment.difficulty}
                      </span>
                      {assessment.isAdaptive && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(168, 85, 247, 0.15)',
                            color: '#c084fc',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Sparkles size={11} />
                          Adaptive
                        </span>
                      )}
                    </div>

                    {isCompleted ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        Completed ({assessment.candidateInfo.score ?? 100}%)
                      </span>
                    ) : isInProgress ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <RotateCcw size={14} />
                        In Progress
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: isUpcoming ? '#f59e0b' : 'var(--text-muted)',
                        }}
                      >
                        {assessment.status}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {assessment.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {assessment.description}
                  </p>
                </div>

                {/* Details Bar & Action Button */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      padding: '0.75rem 0',
                      borderTop: '1px solid var(--border-primary)',
                      borderBottom: '1px solid var(--border-primary)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} color="var(--accent-primary)" />
                      {assessment.duration} Minutes
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileCode2 size={14} color="#06b6d4" />
                      {assessment.problems?.length || 3} Problems
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Award size={14} color="#f59e0b" />
                      Passing: {assessment.passingScore}%
                    </span>
                  </div>

                  {isCompleted ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div
                        style={{
                          padding: '0.55rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: '#10b981',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <CheckCircle2 size={15} />
                        <span>You have completed this assessment!</span>
                      </div>
                      <Link
                        to={`/results/${assessment._id}`}
                        className="btn btn-secondary"
                        style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
                      >
                        <BarChart size={15} />
                        <span>View Performance Report</span>
                      </Link>
                    </div>
                  ) : isUpcoming ? (
                    <button disabled className="btn btn-secondary" style={{ width: '100%' }}>
                      <Calendar size={15} />
                      <span>Starts Soon</span>
                    </button>
                  ) : (
                    <Link
                      to={`/assessments/${assessment._id}`}
                      className="btn btn-primary"
                      style={{ width: '100%', textDecoration: 'none' }}
                    >
                      <Play size={15} />
                      <span>{isInProgress ? 'Resume Assessment' : 'Start Assessment'}</span>
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
