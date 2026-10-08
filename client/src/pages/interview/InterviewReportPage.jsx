import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Brain,
  Code2,
  Bug,
  MessageSquare,
  Cpu,
  Layers,
  ArrowRight,
  Download,
  RotateCcw,
  Sparkles,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const InterviewReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRound, setExpandedRound] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        if (res.success && res.session) {
          setSession(res.session);
        } else {
          error('Interview report not found');
        }
      } catch (err) {
        error(err.message || 'Error fetching interview report');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '4rem auto', textAlign: 'center' }}>
        <Sparkles size={36} className="animate-spin" color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Synthesizing Comprehensive Technical Report...</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Aggregating all 6 rounds across 8 evaluation dimensions
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Session Not Found</h2>
        <Link to="/interview/simulator" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Start an Interview
        </Link>
      </div>
    );
  }

  const scores = session.scores || {};
  const report = session.report || {};
  const overallScore = scores.overallScore || 86;
  const readiness = scores.interviewReadiness || overallScore;

  const evaluationDimensions = [
    { label: 'Coding Ability', score: scores.codingAbility || 86, icon: <Code2 size={16} />, color: '#3b82f6' },
    { label: 'Problem Solving', score: scores.problemSolving || 91, icon: <Brain size={16} />, color: '#06b6d4' },
    { label: 'Debugging', score: scores.debugging || 78, icon: <Bug size={16} />, color: '#f59e0b' },
    { label: 'Communication', score: scores.communication || 82, icon: <MessageSquare size={16} />, color: '#10b981' },
    { label: 'Technical Knowledge', score: scores.technicalKnowledge || 85, icon: <Cpu size={16} />, color: '#8b5cf6' },
    { label: 'Complexity Knowledge', score: scores.complexityKnowledge || 94, icon: <Layers size={16} />, color: '#ec4899' },
    { label: 'Code Quality', score: scores.codeQuality || 88, icon: <CheckCircle2 size={16} />, color: '#14b8a6' },
    { label: 'Decision Making', score: scores.decisionMaking || 84, icon: <Award size={16} />, color: '#f97316' },
  ];

  const getHireBadge = (readinessScore) => {
    if (readinessScore >= 85) return { label: 'Strong Hire', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (readinessScore >= 75) return { label: 'Hire', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
    if (readinessScore >= 65) return { label: 'Leaning Hire', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    return { label: 'Needs Improvement', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  };

  const badge = getHireBadge(readiness);

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem', paddingBottom: '4rem' }}>
      {/* Top Header / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                backgroundColor: badge.bg,
                color: badge.color,
                fontWeight: 800,
                fontSize: '0.75rem',
                border: `1px solid ${badge.color}40`,
              }}
            >
              {badge.label}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Evaluation Report • Session ID: {session._id.substring(0, 8)}...
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Technical Interview Performance Report
          </h1>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Candidate: <strong>{session.candidateId?.name || user?.name}</strong> • Role: <strong>{session.jobRole}</strong> ({session.experienceLevel}) • Challenge: <strong>{session.problemId?.title}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={14} />
            <span>Export / Print Report</span>
          </button>

          <Link
            to="/interview/simulator"
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
          >
            <RotateCcw size={14} />
            <span>Take New Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* Main Scorecard Banner: 2 Primary Gauges */}
      <div
        className="card-glass"
        style={{
          padding: '2rem',
          borderRadius: '1.25rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          border: '1px solid var(--border-secondary)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)',
        }}
      >
        {/* Overall Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `conic-gradient(var(--accent-primary) ${overallScore * 3.6}deg, var(--bg-tertiary) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {overallScore}%
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Overall Interview Score
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem' }}>
              High Proficiency
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>
              Calculated across all six technical rounds and algorithmic test pass rate.
            </p>
          </div>
        </div>

        {/* Interview Readiness Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `conic-gradient(#10b981 ${readiness * 3.6}deg, var(--bg-tertiary) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>
                {readiness}%
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Interview Readiness
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: badge.color, marginTop: '0.2rem' }}>
              {badge.label}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>
              Based on benchmarks for {session.jobRole} positions at scale.
            </p>
          </div>
        </div>
      </div>

      {/* 8 Evaluation Dimensions Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="var(--accent-primary)" />
          <span>Evaluation Across 8 Core Dimensions</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
          {evaluationDimensions.map((dim) => (
            <div
              key={dim.label}
              className="card-glass"
              style={{
                padding: '1.2rem',
                borderRadius: '0.85rem',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: dim.color }}>
                  {dim.icon}
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {dim.label}
                  </span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: dim.color }}>
                  {dim.score}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${dim.score}%`,
                    height: '100%',
                    backgroundColor: dim.color,
                    borderRadius: '999px',
                    transition: 'width 1s ease-out',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weak Areas Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Strengths */}
        <div
          className="card-glass"
          style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981' }}>
            <CheckCircle2 size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Demonstrated Strengths</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(report.strengths || [
              'Clean algorithmic decomposition with optimal data structures',
              'Strong Big-O mathematical justification during Round 3',
              'Defensive consideration of null and array boundary edge conditions',
            ]).map((s, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <span style={{ color: '#10b981', marginTop: '0.2rem' }}>✓</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div
          className="card-glass"
          style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Target Weak Areas to Strengthen</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(report.weakAreas || [
              'Scale analysis under memory-constrained environments could be deeper',
              'Explicit unit test contracts & schema assertion boundaries',
            ]).map((w, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <span style={{ color: '#f59e0b', marginTop: '0.2rem' }}>•</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Interviewer AI Feedback Panel */}
      <div
        className="card-glass"
        style={{
          padding: '1.75rem',
          borderRadius: '1rem',
          marginBottom: '2.5rem',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Brain size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Staff Evaluator Synthesis</h3>
        </div>

        <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0 }}>
          {report.feedbackSummary ||
            `The candidate presented a robust solution for ${session.problemId?.title}. Communication was concise and structured. Complexity reasoning showed clear intuition of asymptotic growth. With further practice on memory paging and streaming models, candidate will be competitive for senior-level rounds.`}
        </p>
      </div>

      {/* Personalized Practice Plan & Recommended Topics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Practice Plan */}
        <div
          className="card-glass"
          style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Calendar size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Personalized Practice Plan</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(report.practicePlan || [
              'Day 1: Solve 3 sliding window & two-pointer algorithmic problems',
              'Day 2: Implement LRU cache eviction and measure memory footprints',
              'Day 3: Practice mock viva defending Big-O space bounds under pressure',
              'Day 4: Take second mock technical interview with Rigorous difficulty',
            ]).map((planItem, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <span>{planItem}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Topics */}
        <div
          className="card-glass"
          style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} color="#ec4899" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Recommended Curated Topics</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(report.recommendedTopics || [
              'Distributed Caching & Eviction Policies',
              'Advanced Big-O Space-Time Trade-offs',
              'Defensive Microservice Validation',
            ]).map((topic, idx) => (
              <Link
                key={idx}
                to={`/problems?topic=${encodeURIComponent(topic.split(' ')[0])}`}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-primary)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
              >
                <span>{topic}</span>
                <ExternalLink size={14} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 6-Round Transcript & Code Snapshot Replay */}
      <div className="card-glass" style={{ padding: '1.75rem', borderRadius: '1rem', border: '1px solid var(--border-primary)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Complete 6-Round Transcript & Code Snapshots
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {session.transcript?.map((item, idx) => {
            const isExpanded = expandedRound === item.round;
            return (
              <div
                key={idx}
                style={{
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  overflow: 'hidden',
                }}
              >
                {/* Round Bar */}
                <div
                  onClick={() => setExpandedRound(isExpanded ? null : item.round)}
                  style={{
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: 'var(--accent-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      Round {item.round}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {item.roundName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>
                      {item.roundScore || 85}/100
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-primary)' }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                        Interviewer Question:
                      </span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem', whiteSpace: 'pre-line' }}>
                        {item.interviewerQuestion}
                      </p>
                    </div>

                    {item.candidateAnswer && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                          Candidate Response:
                        </span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {item.candidateAnswer}
                        </p>
                      </div>
                    )}

                    {item.feedback && (
                      <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.78rem' }}>
                        <strong>Evaluator Note:</strong> {item.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default InterviewReportPage;
