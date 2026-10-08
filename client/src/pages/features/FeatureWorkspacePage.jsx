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
  Box,
  Play,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Server,
  FileCode,
  ShieldCheck,
  RotateCcw,
  Check,
  Sliders,
} from 'lucide-react';

export const FeatureWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { success, error, info } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  // Left panel tabs
  const [activeLeftTab, setActiveLeftTab] = useState('endpoints'); // 'endpoints' | 'requirements' | 'review'

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outputTab, setOutputTab] = useState('testcases'); // 'testcases' | 'output'
  const [runResults, setRunResults] = useState(null);
  const [aiReview, setAiReview] = useState(null);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/features/${id}`);
        if (res.success && res.project) {
          setProject(res.project);
          setCode(res.project.starterCode?.javascript || '');
        } else {
          error('Feature project not found');
        }
      } catch (err) {
        error(err.message || 'Error loading feature project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
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

  // Run Test Suite against public test cases
  const handleRunTests = async () => {
    if (!project?._id) return;
    setIsRunning(true);
    setOutputTab('output');

    try {
      const res = await api.post(`/features/${project._id}/run`, {
        code,
        language,
      });

      setRunResults(res);
      if (res.verdict === 'Accepted') {
        success('Public test cases passed! Ready to submit feature for code review.');
      } else {
        info(`Feature test: ${res.verdict}`);
      }
    } catch (err) {
      error(err.message || 'Error running test suite');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Feature against full test suite & generate AI Code Review
  const handleSubmitFeature = async () => {
    if (!isAuthenticated) {
      info('Running in Sandbox Mode. Sign in to permanently record this to your Thinking Profile.');
    }

    setIsSubmitting(true);
    setOutputTab('output');

    try {
      const res = await api.post(`/features/${project._id}/submit`, {
        code,
        language,
      });

      setRunResults(res);
      if (res.review) {
        setAiReview(res.review);
        setActiveLeftTab('review');
      }

      if (res.allPassed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        success('Feature Shipped! AI Code Review and Architecture feedback generated.');
      } else {
        error(`Failed ${res.totalCount - res.passedCount} test cases. Review response outputs.`);
      }
    } catch (err) {
      error(err.message || 'Feature submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <Sparkles size={36} className="animate-spin" color="#10b981" style={{ margin: '0 auto 1rem' }} />
        <h2>Initializing Feature Engineering Studio...</h2>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Feature Project Not Found</h2>
        <Link to="/features" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Features
        </Link>
      </div>
    );
  }

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
        {/* Left: Nav & Project Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link
            to="/features"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              padding: '0.3rem',
              borderRadius: '6px',
            }}
            title="Back to Features Catalog"
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
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                }}
              >
                Feature Mode
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{project.title}</span>
              <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                {project.category}
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
            <Clock size={14} color="#10b981" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          {/* Run Tests */}
          <button
            onClick={handleRunTests}
            disabled={isRunning || isSubmitting}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunning ? 'Testing...' : 'Run Test Suite'}</span>
          </button>

          {/* Deploy Feature & Code Review */}
          <button
            onClick={handleSubmitFeature}
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
            <Sparkles size={14} />
            <span>{isSubmitting ? 'Evaluating...' : 'Deploy Feature & Review'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left (Endpoints & Specs), Right (Monaco Editor & Test Drawer) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 46%) 1fr',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* ==============================================
            LEFT PANE: ENDPOINTS & SPECS
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
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              padding: '0 1rem',
            }}
          >
            <button
              onClick={() => setActiveLeftTab('endpoints')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'endpoints' ? '#10b981' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'endpoints' ? '2px solid #10b981' : 'none',
              }}
            >
              🔌 API Endpoints
            </button>

            <button
              onClick={() => setActiveLeftTab('requirements')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'requirements' ? '#10b981' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'requirements' ? '2px solid #10b981' : 'none',
              }}
            >
              📋 Requirements & Rubric
            </button>

            <button
              onClick={() => setActiveLeftTab('review')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'review' ? '#a855f7' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'review' ? '2px solid #a855f7' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={14} />
              <span>AI Code Review</span>
              {aiReview && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />}
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
            {/* TAB 1: API ENDPOINTS */}
            {activeLeftTab === 'endpoints' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.5rem', color: '#10b981' }}>
                    Feature Scenario
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                    {project.featureScenario}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Endpoint Specifications
                  </h4>

                  {project.endpoints?.map((ep, idx) => (
                    <div
                      key={idx}
                      className="card-glass"
                      style={{
                        padding: '1.2rem',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: ep.method === 'POST' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: ep.method === 'POST' ? '#38bdf8' : '#10b981',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                            }}
                          >
                            {ep.method}
                          </span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>
                            {ep.path}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          {ep.statusCodes?.map((code) => (
                            <span key={code} className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {ep.description}
                      </p>

                      {ep.requestBody && ep.requestBody !== 'None' && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                            Request Payload:
                          </div>
                          <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', margin: '0.2rem 0' }}>
                            {ep.requestBody}
                          </pre>
                        </div>
                      )}

                      {ep.responseFormat && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                            Expected Response:
                          </div>
                          <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', margin: '0.2rem 0' }}>
                            {ep.responseFormat}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: REQUIREMENTS & RUBRIC */}
            {activeLeftTab === 'requirements' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.75rem', color: '#10b981' }}>
                    Functional Requirements
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {project.functionalRequirements?.map((r, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f59e0b' }}>
                    Non-Functional & Performance Criteria
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {project.nonFunctionalRequirements?.map((r, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    Evaluation Rubric Weights
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {project.evaluationRubric?.map((rub, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span>{rub.criterion}</span>
                        <span className="badge badge-info">{rub.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AI CODE REVIEW */}
            {activeLeftTab === 'review' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {aiReview ? (
                  <>
                    <div
                      style={{
                        padding: '1.5rem',
                        borderRadius: '0.85rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-secondary)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                        Feature Quality Rating
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', margin: '0.25rem 0' }}>
                        {aiReview.featureQualityScore}/100
                      </div>
                      <span className="badge badge-success">{aiReview.verdictRating}</span>
                    </div>

                    <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        API Semantics & Status Codes
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {aiReview.apiSemanticsFeedback}
                      </p>
                    </div>

                    <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: '#06b6d4' }}>
                        Error Handling & Boundary Resiliency
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {aiReview.errorHandlingFeedback}
                      </p>
                    </div>

                    <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f59e0b' }}>
                        Recommended Next Improvements
                      </h4>
                      <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {aiReview.keyImprovements?.map((imp, i) => (
                          <li key={i} style={{ marginBottom: '0.35rem' }}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <Sparkles size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h4>No Review Generated Yet</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                      Deploy your feature code to receive a comprehensive Principal Engineer code review.
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
              <FileCode size={16} color="#10b981" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Feature Implementation</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(Node.js 18 Runtime)</span>
            </div>

            <button
              onClick={() => setCode(project.starterCode?.javascript || '')}
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
              title="Reset code to starter template"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
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
                  color: outputTab === 'testcases' ? '#10b981' : 'var(--text-muted)',
                  borderBottom: outputTab === 'testcases' ? '2px solid #10b981' : 'none',
                }}
              >
                Unit Test Scenarios ({project.testCases?.length || 0})
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
                  color: outputTab === 'output' ? '#10b981' : 'var(--text-muted)',
                  borderBottom: outputTab === 'output' ? '2px solid #10b981' : 'none',
                }}
              >
                Sandbox Output {runResults && `(${runResults.verdict})`}
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
              {outputTab === 'testcases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {project.testCases?.map((tc, idx) => (
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
                      <div style={{ color: '#10b981', marginBottom: '0.2rem', fontWeight: 700 }}>
                        Scenario #{idx + 1}: {tc.explanation}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>Input Operations:</div>
                      <div style={{ color: '#38bdf8', whiteSpace: 'pre-wrap' }}>{tc.input}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>Expected Output:</div>
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
                          <span>{res.isHidden ? '🔒 Hidden Stress Test' : `Scenario #${i + 1}`}</span>
                          <span style={{ color: res.passed ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {res.passed ? 'PASSED' : 'FAILED'} {res.executionTime ? `(${res.executionTime}ms)` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                      Click "Run Test Suite" to verify your feature implementation against unit scenarios.
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
export default FeatureWorkspacePage;
