import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FileCode2,
  PlusCircle,
  Trash2,
  Clock,
  Award,
  Sparkles,
  CheckCircle,
  X,
  Calendar,
  Users,
  Play,
  Eye,
  Link2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

export const InstructorAssessmentsPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [assessments, setAssessments] = useState([]);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(() => searchParams.get('create') === 'true' || location.pathname.endsWith('/new'));
  const [newAssessmentCreated, setNewAssessmentCreated] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: 'Read problems carefully. Solutions will be checked against hidden edge cases.',
    duration: 90,
    difficulty: 'Medium',
    passingScore: 70,
    totalPoints: 100,
    isAdaptive: false,
    selectedProblemIds: [],
  });

  const { success, error } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assessmentsRes, problemsRes] = await Promise.all([
        api.get('/assessments'),
        api.get('/problems?limit=50'),
      ]);

      if (assessmentsRes.success && assessmentsRes.assessments) {
        setAssessments(assessmentsRes.assessments);
      }
      if (problemsRes.success && problemsRes.problems) {
        setAvailableProblems(problemsRes.problems);
      }
    } catch (err) {
      error('Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleProblem = (id) => {
    setFormData((prev) => {
      const exists = prev.selectedProblemIds.includes(id);
      if (exists) {
        return {
          ...prev,
          selectedProblemIds: prev.selectedProblemIds.filter((pId) => pId !== id),
        };
      } else {
        return {
          ...prev,
          selectedProblemIds: [...prev.selectedProblemIds, id],
        };
      }
    });
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (formData.selectedProblemIds.length === 0) {
      error('Please select at least one problem for this assessment');
      return;
    }

    try {
      const pointsPerProblem = Math.floor(formData.totalPoints / formData.selectedProblemIds.length);
      const problemsPayload = formData.selectedProblemIds.map((pId, idx) => ({
        problemId: pId,
        points: pointsPerProblem,
        order: idx + 1,
      }));

      const payload = {
        ...formData,
        problems: problemsPayload,
      };

      const res = await api.post('/assessments', payload);
      if (res.success && res.assessment) {
        const shareLink = `${window.location.origin}/assessments/${res.assessment._id}`;
        setNewAssessmentCreated({
          id: res.assessment._id,
          title: res.assessment.title,
          link: shareLink,
        });
        success(`Assessment "${res.assessment.title}" scheduled! Share link generated.`);
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      error(err.message || 'Failed to create assessment');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete assessment "${title}"?`)) return;
    try {
      await api.delete(`/assessments/${id}`);
      success('Assessment removed.');
      setAssessments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      error('Could not delete assessment');
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <FileCode2 size={22} color="#06b6d4" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Assessment Scheduling & Management</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create timed evaluation rounds, assign challenges, and configure adaptive difficulty engines.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Create Assessment</span>
        </button>
      </div>

      {/* Assessments Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton" style={{ height: '200px', borderRadius: '0.75rem' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {assessments.map((a) => (
            <div
              key={a._id}
              className="card-glass"
              style={{
                padding: '1.75rem',
                borderRadius: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span className={`badge badge-${a.difficulty.toLowerCase()}`}>
                      {a.difficulty}
                    </span>
                    {a.isAdaptive && (
                      <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Sparkles size={11} /> Adaptive
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(a._id, a.title)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    title="Delete Assessment"
                  >
                    <Trash2 size={15} color="#ef4444" />
                  </button>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {a.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  {a.description}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-primary)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} color="var(--accent-primary)" />
                    {a.duration} mins
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FileCode2 size={13} color="#06b6d4" />
                    {a.problems?.length || 0} Questions
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Award size={13} color="#f59e0b" />
                    Passing: {a.passingScore}%
                  </span>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/assessments/${a._id}`;
                      navigator.clipboard.writeText(link);
                      success(`Invite link for "${a.title}" copied to clipboard!`);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.4)' }}
                    title="Copy shareable invite link for candidates"
                  >
                    <Link2 size={13} />
                    <span>Copy Link</span>
                  </button>
                  <Link
                    to={`/assessments/${a._id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Eye size={13} />
                    <span>View / Test</span>
                  </Link>
                  <Link
                    to={`/assessments/${a._id}/arena`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Play size={13} />
                    <span>Launch Arena</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assessment Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card-glass animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Schedule New Assessment</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Assessment Title *
                </label>
                <input
                  type="text"
                  required
                  className="input-arena"
                  placeholder="e.g. Campus Recruitment 2026 Coding Round"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  className="input-arena"
                  placeholder="Summary for candidates..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    className="input-arena"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Difficulty
                  </label>
                  <select
                    className="input-arena"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    className="input-arena"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {/* Adaptive Toggle */}
              <div style={{ padding: '0.85rem 1rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isAdaptive}
                    onChange={(e) => setFormData({ ...formData, isAdaptive: e.target.checked })}
                  />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Enable Adaptive Assessment Mode</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Questions dynamically scale in difficulty based on candidate's real-time accuracy.
                    </p>
                  </div>
                </label>
              </div>

              {/* Problem Selection Checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Select Problems ({formData.selectedProblemIds.length} Selected) *
                </label>
                <div
                  style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    backgroundColor: 'var(--bg-input)',
                  }}
                >
                  {availableProblems.map((p) => {
                    const isSelected = formData.selectedProblemIds.includes(p._id);
                    return (
                      <div
                        key={p._id}
                        onClick={() => handleToggleProblem(p._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.375rem',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.825rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                          />
                          <span style={{ fontWeight: 600 }}>{p.title}</span>
                          <span style={{ color: 'var(--text-muted)' }}>({p.topic})</span>
                        </div>
                        <span className={`badge badge-${p.difficulty.toLowerCase()}`}>
                          {p.difficulty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Link Modal upon creation */}
      {newAssessmentCreated && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card-glass animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '2rem',
              borderRadius: '0.85rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Assessment Link Ready!</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{newAssessmentCreated.title}</p>
                </div>
              </div>
              <button
                onClick={() => setNewAssessmentCreated(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Your assessment has been scheduled. Copy this link and send it to candidates so they can enter the test arena:
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                readOnly
                value={newAssessmentCreated.link}
                className="input-arena"
                style={{ flex: 1, fontSize: '0.82rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newAssessmentCreated.link);
                  success('Assessment link copied to clipboard!');
                }}
                className="btn btn-pink"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
              >
                <Copy size={15} />
                <span>Copy Link</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setNewAssessmentCreated(null)}
                className="btn btn-secondary"
              >
                Done
              </button>
              <Link
                to={`/assessments/${newAssessmentCreated.id}`}
                className="btn btn-primary"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Preview Assessment</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
