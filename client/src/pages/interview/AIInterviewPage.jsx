import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  Brain,
  MessageSquare,
  RotateCcw,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AIInterviewPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);

  // Scorecard
  const [scorecard, setScorecard] = useState({
    codingAbility: 88,
    problemSolving: 92,
    communication: 85,
    complexityKnowledge: 90,
    overallScore: 89,
    feedback: 'Strong understanding of hash-map lookups and asymptotic bounds. Demonstrates clear structural thinking.',
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const data = await api.get('/problems?limit=10');
        if (data.success && data.problems) {
          setProblems(data.problems);
          setSelectedProblem(data.problems[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProblems();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartInterview = async () => {
    if (!selectedProblem) return;
    setInterviewStarted(true);
    setLoading(true);

    try {
      const res = await api.post('/ai/interview', {
        problemId: selectedProblem._id,
        code: selectedProblem.starterCode?.javascript || 'function solution() {}',
        dialogueHistory: [],
      });

      setMessages([
        {
          id: 1,
          role: 'interviewer',
          text: res.question || `Welcome! I'm your AI Technical Evaluator today. Let's discuss your approach for "${selectedProblem.title}". Why did you pick this strategy?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      error('Failed to initiate interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = {
      id: messages.length + 1,
      role: 'candidate',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      if (newHistory.length >= 6) {
        // Complete interview after 3 Q&A rounds
        setTimeout(() => {
          setInterviewComplete(true);
          success('Interview completed! Scorecard generated.');
          setLoading(false);
        }, 800);
        return;
      }

      const res = await api.post('/ai/interview', {
        problemId: selectedProblem._id,
        code: selectedProblem.starterCode?.javascript || '',
        dialogueHistory: newHistory,
        lastAnswer: userMsg.text,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: 'interviewer',
          text: res.question,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      error('Interviewer connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <div
            style={{
              padding: '0.4rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              color: '#a855f7',
            }}
          >
            <Bot size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Technical Interview Simulation</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Practice real-time technical viva with an AI interviewer. Defend your algorithmic choices, explain complexities, and receive instant performance metrics.
        </p>
      </div>

      {!interviewStarted ? (
        /* Configuration Card before starting */
        <div
          className="card-glass animate-fade-in"
          style={{
            maxWidth: '650px',
            margin: '2rem auto',
            padding: '2.5rem',
            borderRadius: '1rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
              marginBottom: '1.25rem',
            }}
          >
            <Brain size={28} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Select Challenge for Technical Interview
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            The AI interviewer will scrutinize your chosen algorithm, ask about trade-offs, and challenge edge conditions.
          </p>

          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Target Challenge:
            </label>
            <select
              className="input-arena"
              value={selectedProblem?._id}
              onChange={(e) => {
                const found = problems.find((p) => p._id === e.target.value);
                if (found) setSelectedProblem(found);
              }}
            >
              {problems.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} ({p.topic} - {p.difficulty})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartInterview}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            <Sparkles size={18} />
            <span>Enter AI Interview Room</span>
          </button>
        </div>
      ) : (
        /* Live Chat Room Layout */
        <div style={{ display: 'grid', gridTemplateColumns: interviewComplete ? '1fr 340px' : '1fr', gap: '1.5rem' }}>
          {/* Chat Container */}
          <div
            className="card-glass"
            style={{
              height: '620px',
              borderRadius: '1rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid var(--border-secondary)',
            }}
          >
            {/* Top Room Banner */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Staff AI Interviewer</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    Discussing: {selectedProblem?.title}
                  </span>
                </div>
              </div>

              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                Round 1 of 3
              </span>
            </div>

            {/* Message Stream */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {messages.map((m) => {
                const isInterviewer = m.role === 'interviewer';
                return (
                  <div
                    key={m.id}
                    className="animate-fade-in"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      alignSelf: isInterviewer ? 'flex-start' : 'flex-end',
                      maxWidth: '80%',
                    }}
                  >
                    {isInterviewer && (
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(168, 85, 247, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#c084fc',
                          flexShrink: 0,
                        }}
                      >
                        <Bot size={18} />
                      </div>
                    )}

                    <div
                      style={{
                        padding: '0.85rem 1.15rem',
                        borderRadius: '0.75rem',
                        backgroundColor: isInterviewer ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                        color: isInterviewer ? 'var(--text-primary)' : '#ffffff',
                        fontSize: '0.875rem',
                        lineHeight: 1.55,
                        boxShadow: 'var(--shadow-sm)',
                        border: isInterviewer ? '1px solid var(--border-primary)' : 'none',
                      }}
                    >
                      <div>{m.text}</div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: isInterviewer ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)',
                          marginTop: '0.35rem',
                          textAlign: 'right',
                        }}
                      >
                        {m.timestamp}
                      </div>
                    </div>

                    {!isInterviewer && (
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38bdf8',
                          flexShrink: 0,
                        }}
                      >
                        <User size={18} />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <div className="skeleton" style={{ width: '12px', height: '12px', borderRadius: '50%' }} />
                  <span>AI Interviewer is formulating feedback...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            {!interviewComplete ? (
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '1rem',
                  borderTop: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  gap: '0.75rem',
                }}
              >
                <input
                  type="text"
                  className="input-arena"
                  placeholder="Explain your approach, time complexity, or edge handling..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !inputText.trim()} className="btn btn-primary">
                  <Send size={16} />
                </button>
              </form>
            ) : (
              <div
                style={{
                  padding: '1rem',
                  borderTop: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-tertiary)',
                  textAlign: 'center',
                  color: '#10b981',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                ✅ Interview Session Finished
              </div>
            )}
          </div>

          {/* Right Column: Scorecard (Appears when complete or live) */}
          {interviewComplete && (
            <div
              className="card-glass animate-fade-in"
              style={{
                padding: '1.5rem',
                borderRadius: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Award size={20} color="#f59e0b" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Evaluation Scorecard</h3>
                </div>

                <div style={{ textAlign: 'center', padding: '1rem 0', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-primary)' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                    {scorecard.overallScore}/100
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                    Strong Hire Rating
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Coding Ability', score: scorecard.codingAbility, color: '#3b82f6' },
                    { label: 'Problem Solving', score: scorecard.problemSolving, color: '#06b6d4' },
                    { label: 'Communication', score: scorecard.communication, color: '#10b981' },
                    { label: 'Complexity Knowledge', score: scorecard.complexityKnowledge, color: '#a855f7' },
                  ].map((dim) => (
                    <div key={dim.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>{dim.label}</span>
                        <span style={{ fontWeight: 700 }}>{dim.score}%</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                        <div style={{ width: `${dim.score}%`, height: '100%', backgroundColor: dim.color, borderRadius: '999px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <strong>Evaluator Feedback:</strong> {scorecard.feedback}
                </div>
              </div>

              <button
                onClick={() => {
                  setInterviewStarted(false);
                  setInterviewComplete(false);
                  setMessages([]);
                }}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: '1.5rem' }}
              >
                <RotateCcw size={14} />
                <span>Practice Another Problem</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
