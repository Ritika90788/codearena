import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  ArrowLeft,
  Bug,
  Play,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Terminal,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export const DebugWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { success, error, info } = useToast();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  // Left panel tabs
  const [activeLeftTab, setActiveLeftTab] = useState('incident'); // 'incident' | 'explain' | 'hints' | 'postmortem'

  // Root Cause Explanation states
  const [rootCauseExplanation, setRootCauseExplanation] = useState('');
  const [fixExplanation, setFixExplanation] = useState('');
  const [isEvaluatingExplanation, setIsEvaluatingExplanation] = useState(false);
  const [explanationEvaluation, setExplanationEvaluation] = useState(null);

  // Hint states
  const [hintsList, setHintsList] = useState([]);
  const [requestingHint, setRequestingHint] = useState(false);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outputTab, setOutputTab] = useState('testcases'); // 'testcases' | 'output'
  const [runResults, setRunResults] = useState(null);
  const [bugExplanation, setBugExplanation] = useState('');

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const handleExplainFix = async () => {
    if (!challenge?._id) return;
    if (!rootCauseExplanation.trim() && !fixExplanation.trim()) {
      error('Please provide your root cause and fix explanation.');
      return;
    }
    setIsEvaluatingExplanation(true);
    try {
      const res = await api.post(`/debug/${challenge._id}/explain-fix`, {
        rootCauseExplanation,
        fixExplanation,
        codeFix: code,
      });
      if (res.success) {
        setExplanationEvaluation(res);
        if (res.isRootCauseAccurate) {
          success(`Root Cause Verified! Understanding Score: ${res.understandingScore}%`);
        } else {
          info(`Explanation analyzed: Understanding Score: ${res.understandingScore}%`);
        }
      }
    } catch (err) {
      error(err.message || 'Error evaluating explanation');
    } finally {
      setIsEvaluatingExplanation(false);
    }
  };

  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/debug/${id}`);
        if (res.success && res.challenge) {
          setChallenge(res.challenge);
          setCode(res.challenge.brokenCode?.javascript || '');
        } else {
          error('Debug challenge not found');
        }
      } catch (err) {
        error(err.message || 'Error loading debug challenge');
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Request Tiered AI Hint
  const handleRequestHint = async () => {
    if (!challenge?._id) return;
    setRequestingHint(true);
    setActiveLeftTab('hints');

    try {
      const nextIndex = hintsList.length;
      const res = await api.post(`/debug/${challenge._id}/hint`, {
        hintIndex: nextIndex,
        currentCode: code,
      });

      if (res.success && res.hint) {
        setHintsList((prev) => [...prev, res.hint]);
        info(`Unlocked Hint #${nextIndex + 1}`);
      }
    } catch (err) {
      error(err.message || 'Error retrieving hint');
    } finally {
      setRequestingHint(false);
    }
  };

  // Run Test Patch against public test cases
  const handleRunPatch = async () => {
    if (!challenge?._id) return;
    setIsRunning(true);
    setOutputTab('output');

    try {
      const res = await api.post(`/debug/${challenge._id}/run`, {
        code,
        language,
      });

      setRunResults(res);
      if (res.verdict === 'Accepted') {
        success('Public test cases passed! Ready to deploy bugfix.');
      } else {
        info(`Patch test: ${res.verdict}`);
      }
    } catch (err) {
      error(err.message || 'Error testing patch');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Bugfix against all test cases
  const handleSubmitBugfix = async () => {
    if (!isAuthenticated) {
      info('Running in Sandbox Mode. Sign in to permanently record this to your Thinking Profile.');
    }

    setIsSubmitting(true);
    setOutputTab('output');

    try {
      const res = await api.post(`/debug/${challenge._id}/submit`, {
        code,
        language,
      });

      setRunResults(res);
      if (res.allPassed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setBugExplanation(res.bugExplanation);
        setActiveLeftTab('postmortem');
        success('Bug Resolved! Incident marked as resolved. Post-mortem unlocked.');
      } else {
        error(`Failed ${res.totalCount - res.passedCount} test cases. Review stack output.`);
      }
    } catch (err) {
      error(err.message || 'Bugfix submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <Sparkles size={36} className="animate-spin" color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2>Opening Isolated Debugging Chamber...</h2>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Incident Not Found</h2>
        <Link to="/debug-arena" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Debug Arena
        </Link>
      </div>
    );
  }

  const isCritical = challenge.incidentSeverity === 'Critical';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 65px)',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: '0.65rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          zIndex: 20,
        }}
      >
        {/* Left: Nav & Incident Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link
            to="/debug-arena"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              padding: '0.3rem',
              borderRadius: '6px',
            }}
            title="Back to Debug Arena"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isCritical ? '#ef4444' : '#f59e0b',
                }}
              >
                {challenge.incidentSeverity} Incident
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{challenge.title}</span>
              <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                {challenge.category}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            <Clock size={14} color="#ef4444" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          {/* Request Hint */}
          <button
            onClick={handleRequestHint}
            disabled={requestingHint}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <Lightbulb size={13} color="#f59e0b" />
            <span>{requestingHint ? 'Consulting AI...' : 'Request Hint'}</span>
          </button>

          {/* Test Patch */}
          <button
            onClick={handleRunPatch}
            disabled={isRunning || isSubmitting}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunning ? 'Testing...' : 'Test Patch'}</span>
          </button>

          {/* Submit Bugfix */}
          <button
            onClick={handleSubmitBugfix}
            disabled={isSubmitting || isRunning}
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              backgroundColor: '#10b981',
              borderColor: '#10b981',
            }}
          >
            <ShieldCheck size={14} />
            <span>{isSubmitting ? 'Validating...' : 'Deploy Bugfix'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left (Incident & Hints), Right (Monaco Editor & Test Results) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 46%) 1fr',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* ==============================================
            LEFT PANE: INCIDENT REPORT & HINTS
           ============================================== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary)',
            borderRight: '1px solid var(--border-primary)',
            overflow: 'hidden',
          }}
        >
          {/* 4-Stage Debugging Pipeline Indicator */}
          <div
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.4rem',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            {(() => {
              const isModified = code && challenge?.brokenCode?.javascript && code.trim() !== challenge.brokenCode.javascript.trim();
              const hasRootCause = explanationEvaluation?.isRootCauseAccurate || rootCauseExplanation.trim().length > 15;
              const hasFix = isModified;
              const hasPassed = !!runResults?.allPassed;

              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: isModified ? '#10b981' : 'var(--text-muted)' }}>
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isModified ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)', color: isModified ? '#10b981' : 'var(--text-muted)', fontSize: '0.65rem' }}>✓</span>
                    <span>1. Bug Found</span>
                  </div>
                  <span style={{ color: 'var(--border-secondary)' }}>→</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: hasRootCause ? '#10b981' : 'var(--text-muted)' }}>
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: hasRootCause ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)', color: hasRootCause ? '#10b981' : 'var(--text-muted)', fontSize: '0.65rem' }}>✓</span>
                    <span>2. Root Cause</span>
                  </div>
                  <span style={{ color: 'var(--border-secondary)' }}>→</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: hasFix ? '#10b981' : 'var(--text-muted)' }}>
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: hasFix ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)', color: hasFix ? '#10b981' : 'var(--text-muted)', fontSize: '0.65rem' }}>✓</span>
                    <span>3. Fix</span>
                  </div>
                  <span style={{ color: 'var(--border-secondary)' }}>→</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: hasPassed ? '#10b981' : 'var(--text-muted)' }}>
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: hasPassed ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)', color: hasPassed ? '#10b981' : 'var(--text-muted)', fontSize: '0.65rem' }}>✓</span>
                    <span>4. Tests Passed</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              padding: '0 0.5rem',
              overflowX: 'auto',
            }}
          >
            <button
              onClick={() => setActiveLeftTab('incident')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'incident' ? '#ef4444' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'incident' ? '2px solid #ef4444' : 'none',
              }}
            >
              🚨 Incident
            </button>

            <button
              onClick={() => setActiveLeftTab('explain')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'explain' ? '#38bdf8' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'explain' ? '2px solid #38bdf8' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={13} />
              <span>Root Cause & Fix</span>
              {explanationEvaluation && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />}
            </button>

            <button
              onClick={() => setActiveLeftTab('hints')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'hints' ? '#f59e0b' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'hints' ? '2px solid #f59e0b' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Lightbulb size={13} />
              <span>Hints ({hintsList.length})</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('postmortem')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'postmortem' ? '#10b981' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'postmortem' ? '2px solid #10b981' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <BookOpen size={13} />
              <span>Post-Mortem</span>
              {bugExplanation && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />}
            </button>
          </div>

          {/* Left Content Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* TAB 1: INCIDENT REPORT */}
            {activeLeftTab === 'incident' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Symptom Report */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.5rem' }}>
                    <AlertTriangle size={18} />
                    <span>Observed Production Symptom</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, fontFamily: 'monospace' }}>
                    {challenge.symptomReport}
                  </p>
                </div>

                {/* Reproduction Steps */}
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    Reproduction Steps
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {challenge.reproductionSteps?.map((step, idx) => (
                      <li key={idx} style={{ marginBottom: '0.4rem' }}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* Failing Test Case Preview */}
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f59e0b' }}>
                    Failing Benchmark Input
                  </h4>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Input:</div>
                    <div style={{ color: '#38bdf8', whiteSpace: 'pre-wrap' }}>{challenge.testCases?.[0]?.input}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Expected Output:</div>
                    <div style={{ color: '#10b981' }}>{challenge.testCases?.[0]?.expectedOutput}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EXPLAIN ROOT CAUSE & FIX */}
            {activeLeftTab === 'explain' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.5rem' }}>
                    <Sparkles size={18} />
                    <span>Defend Your Technical Diagnosis</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Senior engineers don't just patch code—they clearly explain the root cause defect and why their patch prevents regression.
                  </p>
                </div>

                {/* Form fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      1. What was the exact root cause of this bug?
                    </label>
                    <textarea
                      value={rootCauseExplanation}
                      onChange={(e) => setRootCauseExplanation(e.target.value)}
                      placeholder="e.g. The loop termination condition used '<' instead of '<=', causing single-element bounds or rightmost index to be skipped..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      2. Why does your fix resolve it safely without side effects?
                    </label>
                    <textarea
                      value={fixExplanation}
                      onChange={(e) => setFixExplanation(e.target.value)}
                      placeholder="e.g. Updating to left <= right ensures mid reaches both endpoints. Invariant is preserved while avoiding index out of range..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    onClick={handleExplainFix}
                    disabled={isEvaluatingExplanation || (!rootCauseExplanation.trim() && !fixExplanation.trim())}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      backgroundColor: '#3b82f6',
                      borderColor: '#3b82f6',
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{isEvaluatingExplanation ? 'Analyzing Diagnosis...' : 'Submit Diagnosis for AI Evaluation'}</span>
                  </button>
                </div>

                {/* AI Evaluation Result Card */}
                {explanationEvaluation && (
                  <div
                    className="card-glass animate-fade-in"
                    style={{
                      padding: '1.25rem',
                      borderRadius: '0.75rem',
                      border: `1px solid ${explanationEvaluation.isRootCauseAccurate ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      backgroundColor: explanationEvaluation.isRootCauseAccurate ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        AI Diagnosis Verdict
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: explanationEvaluation.isRootCauseAccurate ? '#10b981' : '#f59e0b',
                          color: '#ffffff',
                          fontWeight: 800,
                        }}
                      >
                        {explanationEvaluation.isRootCauseAccurate ? 'Root Cause Verified' : 'Partially Accurate'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Understanding Score: </span>
                        <strong style={{ color: '#38bdf8' }}>{explanationEvaluation.understandingScore}%</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Technical Accuracy: </span>
                        <strong style={{ color: '#10b981' }}>{explanationEvaluation.accuracyScore}%</strong>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {explanationEvaluation.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AI HINT CHAMBER */}
            {activeLeftTab === 'hints' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Tiered Debugging Hints ({hintsList.length} of {challenge.hints?.length || 3} unlocked)
                  </span>
                  <button
                    onClick={handleRequestHint}
                    disabled={requestingHint}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Unlock Next Hint
                  </button>
                </div>

                {hintsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <Lightbulb size={36} color="#f59e0b" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h4>Stuck on a tricky boundary?</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                      Click "Request Hint" to get an architectural clue without revealing the exact fix.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {hintsList.map((h, i) => (
                      <div
                        key={i}
                        className="card-glass animate-fade-in"
                        style={{
                          padding: '1rem',
                          borderRadius: '0.65rem',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          backgroundColor: 'var(--bg-secondary)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                          <Lightbulb size={13} />
                          <span>HINT #{i + 1}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                          {h}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: POST-MORTEM (UNLOCKED ON FIX) */}
            {activeLeftTab === 'postmortem' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {bugExplanation ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      borderRadius: '0.85rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 800, marginBottom: '0.75rem' }}>
                      <CheckCircle2 size={20} />
                      <span style={{ fontSize: '1rem' }}>Root-Cause Post-Mortem & Fix Analysis</span>
                    </div>

                    <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text-primary)', margin: 0 }}>
                      {bugExplanation}
                    </p>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <Link to="/debug-arena" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                        Browse More Debugging Challenges
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h4>Post-Mortem Locked</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                      Pass all test cases and click "Deploy Bugfix" to unlock the architectural post-mortem explanation.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==============================================
            RIGHT PANE: LIVE MONACO CODE & TEST DRAWER
           ============================================== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary)',
            overflow: 'hidden',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={16} color="#ef4444" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Broken Source File</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(Edit inline to patch the bug)</span>
            </div>

            <button
              onClick={() => setCode(challenge.brokenCode?.javascript || '')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
              }}
              title="Reset code to original broken state"
            >
              <RotateCcw size={13} />
              <span>Reset Code</span>
            </button>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, minHeight: '320px', position: 'relative' }}>
            <Editor
              height="100%"
              language="javascript"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Bottom Execution Drawer */}
          <div
            style={{
              height: '230px',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drawer Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 1rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border-primary)',
              }}
            >
              <button
                onClick={() => setOutputTab('testcases')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: outputTab === 'testcases' ? '#ef4444' : 'var(--text-muted)',
                  borderBottom: outputTab === 'testcases' ? '2px solid #ef4444' : 'none',
                }}
              >
                Benchmark Test Cases ({challenge.testCases?.length || 0})
              </button>

              <button
                onClick={() => setOutputTab('output')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: outputTab === 'output' ? '#ef4444' : 'var(--text-muted)',
                  borderBottom: outputTab === 'output' ? '2px solid #ef4444' : 'none',
                }}
              >
                Patch Test Output {runResults && `(${runResults.verdict})`}
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
              {outputTab === 'testcases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {challenge.testCases?.map((tc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.4rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-primary)',
                        fontSize: '0.78rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      <div style={{ color: '#ef4444', marginBottom: '0.2rem', fontWeight: 700 }}>
                        Case #{idx + 1}: {tc.explanation}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>Input:</div>
                      <div style={{ color: '#38bdf8', whiteSpace: 'pre-wrap' }}>{tc.input}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>Expected:</div>
                      <div style={{ color: '#10b981' }}>{tc.expectedOutput}</div>
                    </div>
                  ))}
                </div>
              )}

              {outputTab === 'output' && (
                <div>
                  {runResults ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <span
                          className={`badge ${
                            runResults.verdict === 'Accepted' ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {runResults.verdict}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Passed {runResults.passedCount ?? runResults.results?.filter((r) => r.passed).length} / {runResults.totalCount ?? runResults.results?.length} cases
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ⚡ {runResults.totalExecutionTime || 0}ms
                        </span>
                      </div>

                      {runResults.compileError && (
                        <div
                          style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {runResults.compileError}
                        </div>
                      )}

                      {runResults.results?.map((res, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-primary)',
                            marginBottom: '0.35rem',
                            fontSize: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{res.isHidden ? '🔒 Hidden Regression Test' : `Test #${i + 1}`}</span>
                          <span style={{ color: res.passed ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {res.passed ? 'PASSED' : 'FAILED'} {res.executionTime ? `(${res.executionTime}ms)` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                      Click "Test Patch" to run your bugfix against failing test cases.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DebugWorkspacePage;
