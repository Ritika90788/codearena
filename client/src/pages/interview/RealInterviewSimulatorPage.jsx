import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { PROBLEM_TEMPLATES } from '../../config/problemTemplates';
import {
  Bot,
  User,
  Play,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Brain,
  MessageSquare,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Code2,
  AlertCircle,
  FileText,
  Sliders,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';

const ROUNDS_META = [
  { round: 1, name: 'Coding Problem', desc: 'Problem Understanding & Initial Strategy' },
  { round: 2, name: 'Explain Approach', desc: 'Architecture & Pattern Justification' },
  { round: 3, name: 'Complexity & Big-O', desc: 'Time & Space Algorithmic Proofs' },
  { round: 4, name: 'Debugging Challenge', desc: 'Defensive Hardening & Edge Cases' },
  { round: 5, name: 'Optimization & Scale', desc: 'Memory Boundaries & Scale Bottlenecks' },
  { round: 6, name: 'Final Discussion', desc: 'Testing, Observability & Production Readiness' },
];

export const RealInterviewSimulatorPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Setup state
  const [step, setStep] = useState('setup'); // 'setup' | 'interview'
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [jobRole, setJobRole] = useState('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Junior (0-2 yrs)');
  const [preferredTech, setPreferredTech] = useState('JavaScript, React, Node.js');
  const [difficulty, setDifficulty] = useState('Standard');

  // Active interview session state
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittingStep, setSubmittingStep] = useState(false);

  // Execution runner state
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [activeTab, setActiveTab] = useState('testcases'); // 'testcases' | 'output'

  // Voice Speech & Audio Synthesizer state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Load available problems for setup
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/problems?limit=20');
        if (res.success && res.problems.length > 0) {
          setProblems(res.problems);
          const initialProbId = searchParams.get('problemId') || res.problems[0]._id;
          setSelectedProblemId(initialProbId);
        }
      } catch (err) {
        console.error('Error loading problems:', err);
      }
    };
    fetchProblems();
  }, [searchParams]);

  // Interview timer
  useEffect(() => {
    let interval = null;
    if (step === 'interview') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.transcript]);

  // Audio Speech Synthesis for interviewer question
  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`_]/g, ''));
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) => v.lang.includes('en') && v.name.includes('Natural')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  // Setup Web Speech Recognition for voice input
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      error('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        info('Microphone active. Speak your technical explanation...');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Language starter code selector
  const getLanguageStarter = (lang, currentProb) => {
    const title = currentProb?.title || '';

    // 1. Check master clean PROBLEM_TEMPLATES dictionary first
    if (PROBLEM_TEMPLATES[title] && PROBLEM_TEMPLATES[title][lang]) {
      return PROBLEM_TEMPLATES[title][lang];
    }

    // 2. Check problem starterCode from DB
    if (currentProb && currentProb.starterCode) {
      if (typeof currentProb.starterCode === 'object' && currentProb.starterCode[lang]) {
        return currentProb.starterCode[lang];
      }
      if (lang === 'javascript' && typeof currentProb.starterCode === 'string') {
        return currentProb.starterCode;
      }
      if (lang === 'javascript' && currentProb.starterCode?.javascript) {
        return currentProb.starterCode.javascript;
      }
    }

    const defaultTemplates = {
      javascript: `// Solution in JavaScript (Node.js)\nfunction solution(nums) {\n  // Write your code here\n  return 0;\n}`,
      python: `# Solution in Python 3\nclass Solution:\n    def solve(self, input):\n        # Write your code here\n        return input`,
      cpp: `// Solution in C++ 17\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solution(const vector<int>& nums) {\n    // Write your code here\n    return 0;\n}`,
      java: `// Solution in Java\nimport java.util.*;\n\npublic class Solution {\n    public static int solution(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
      c: `// Solution in C\n#include <stdio.h>\n\nint solution(int* nums, int n) {\n    // Write your code here\n    return 0;\n}`,
    };
    return defaultTemplates[lang] || '// Write your technical solution here';
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const starter = getLanguageStarter(newLang, session?.problemId);
    setCode(starter);
    info(`Switched language to ${newLang === 'cpp' ? 'C++ 17' : newLang.toUpperCase()}`);
  };

  const handleResetCode = () => {
    const starter = getLanguageStarter(language, session?.problemId);
    setCode(starter);
    info('Editor reset to clean starter template.');
  };

  // Start interview session
  const handleStartInterview = async () => {
    if (!isAuthenticated) {
      error('Please sign in to start a real mock technical interview');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/interviews/start', {
        jobRole,
        experienceLevel,
        preferredTech,
        difficulty,
        problemId: selectedProblemId,
      });

      if (res.success && res.session) {
        setSession(res.session);
        setCode(getLanguageStarter(language, res.session.problemId));
        setStep('interview');
        success(`Interview started: Round 1 (${ROUNDS_META[0].name})`);

        const round1Q = res.session.transcript?.[0]?.interviewerQuestion;
        if (round1Q) {
          setTimeout(() => speakText(round1Q), 600);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to start interview session');
    } finally {
      setLoading(false);
    }
  };

  // Run candidate code against public test cases in the sandbox
  const handleRunCode = async () => {
    if (!session?.problemId?._id) return;
    setIsRunning(true);
    setActiveTab('output');

    try {
      const res = await api.post('/submissions/run', {
        problemId: session.problemId._id,
        code,
        language,
      });

      setRunResults(res);
      if (res.verdict === 'Accepted') {
        success('All test cases passed! Ready to explain your approach.');
      } else {
        info(`Execution: ${res.verdict} (${res.testsPassed || 0}/${res.totalTests || 0} passed)`);
      }
    } catch (err) {
      error(err.message || 'Error executing code');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit candidate answer & step to next round
  const handleNextRound = async (e) => {
    e?.preventDefault();
    if (!candidateAnswer.trim() && !code.trim()) {
      error('Please provide your explanation or code before proceeding');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setSubmittingStep(true);
    try {
      const res = await api.post(`/interviews/${session._id}/step`, {
        answer: candidateAnswer.trim(),
        currentCode: code,
        codingVerdict: runResults?.verdict || 'Code Provided',
        testsPassed: runResults?.testsPassed || 0,
        totalTests: runResults?.totalTests || 0,
      });

      if (res.success) {
        if (res.completed) {
          success('Congratulations! Technical interview completed. Generating your comprehensive evaluation report...');
          navigate(`/interview/report/${session._id}`);
          return;
        }

        setSession(res.session);
        setCandidateAnswer('');
        success(`Advanced to Round ${res.currentRound}: ${res.roundName}`);

        const latestMsg = res.session.transcript?.[res.session.transcript.length - 1];
        if (latestMsg?.interviewerQuestion) {
          setTimeout(() => speakText(latestMsg.interviewerQuestion), 600);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to advance interview round');
    } finally {
      setSubmittingStep(false);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ==========================================
  // RENDER: SETUP VIEW
  // ==========================================
  if (step === 'setup') {
    return (
      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            <Brain size={18} />
            <span>AI Real Technical Interview Simulator</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Practice the Real 6-Round Technical Interview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            Not just algorithm memorization. An adaptive Staff Engineer AI will evaluate your architectural trade-offs, Big-O proofs, debugging instincts, and production readiness across six realistic interview rounds.
          </p>
        </div>

        {/* Setup Configuration Form */}
        <div
          className="card-glass animate-fade-in"
          style={{
            padding: '2.5rem',
            borderRadius: '1.25rem',
            border: '1px solid var(--border-secondary)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
            {/* Job Role */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Target Job Role
              </label>
              <select
                className="input-arena"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="JavaScript Developer">JavaScript Developer</option>
                <option value="React Developer">React Developer</option>
                <option value="Node.js Developer">Node.js Developer</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Interviewer adapts follow-ups specifically for this role's tech stack.
              </span>
            </div>

            {/* Experience Level */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Experience Level
              </label>
              <select
                className="input-arena"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Junior (0-2 yrs)">Junior (0-2 yrs)</option>
                <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
                <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Calibrates depth of optimization & architecture questions.
              </span>
            </div>

            {/* Preferred Tech Stack */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Preferred Technology Stack
              </label>
              <select
                className="input-arena"
                value={preferredTech}
                onChange={(e) => setPreferredTech(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="JavaScript, React, Node.js">Full Stack MERN (JS, React, Node)</option>
                <option value="TypeScript, React, Next.js">Modern Frontend (TS, React, Next.js)</option>
                <option value="Node.js, Express, MongoDB, Redis">High-Concurrency Backend (Node, Redis)</option>
                <option value="Python, FastAPI, Postgres">Python Modern Systems</option>
                <option value="Java, Spring Boot, Microservices">Java Enterprise Systems</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Relevant libraries, concurrency & memory models to touch upon.
              </span>
            </div>

            {/* Interview Difficulty */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Interview Rigor & Difficulty
              </label>
              <select
                className="input-arena"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Standard">Standard (Growth Startup / Tech SaaS)</option>
                <option value="Rigorous">Rigorous (Unicorn Tier / Scale)</option>
                <option value="FAANG-level">FAANG-level (Hyper-scale Staff Panel)</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Determines how aggressively edge cases and memory bounds are stressed.
              </span>
            </div>
          </div>

          {/* Target Problem */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Select Coding Problem
            </label>
            <select
              className="input-arena"
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              style={{ width: '100%' }}
            >
              {problems.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} — {p.topic} ({p.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* 6-Round Preview Badges */}
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
              6-Round Technical Flow
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {ROUNDS_META.map((r) => (
                <div
                  key={r.round}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.6rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800 }}>
                    ROUND {r.round}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    {r.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartInterview}
            disabled={loading || !selectedProblemId}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
          >
            {loading ? (
              <span>Connecting with Staff Interviewer AI...</span>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Enter 6-Round AI Interview Room</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: LIVE 6-ROUND INTERVIEW ROOM
  // ==========================================
  const currentRoundNum = session?.currentRound || 1;
  const currentRoundDef = ROUNDS_META.find((r) => r.round === currentRoundNum) || ROUNDS_META[0];
  const lastTranscriptItem = session?.transcript?.[session.transcript.length - 1];

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
      {/* Top Bar: Progress and Meta */}
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
        {/* Left: Role and Problem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            {session?.jobRole}
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {session?.problemId?.title}
          </span>
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
            {session?.difficulty}
          </span>
        </div>

        {/* Center: 6-Round Visual Pipeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {ROUNDS_META.map((r) => {
            const isCompleted = r.round < currentRoundNum;
            const isCurrent = r.round === currentRoundNum;
            return (
              <div
                key={r.round}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: isCurrent
                    ? 'var(--accent-primary)'
                    : isCompleted
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'var(--bg-tertiary)',
                  color: isCurrent
                    ? '#ffffff'
                    : isCompleted
                    ? '#10b981'
                    : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                  border: isCurrent ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--border-primary)',
                }}
                title={r.desc}
              >
                {isCompleted ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <span>R{r.round}</span>
                )}
                <span className="hidden lg:inline">{r.name}</span>
              </div>
            );
          })}
        </div>

        {/* Right: Controls & Live Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Audio TTS toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: voiceEnabled ? '#10b981' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
            }}
            title={voiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
          >
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Live Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            <Clock size={14} color="var(--accent-primary)" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left (Chat & Interview Dialogue), Right (Code Editor & Execution) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 48%) 1fr',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* ==============================================
            LEFT PANE: INTERVIEW CONVERSATION & RESPONSE
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
          {/* Round Header Card */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                  Staff Technical Evaluator (AI)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Round {currentRoundNum} of 6: {currentRoundDef.name}
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontWeight: 600,
              }}
            >
              Live Viva Session
            </span>
          </div>

          {/* Scrollable Dialogue History */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Problem Overview Accordion / Card */}
            <div
              className="card-glass"
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.4rem' }}>
                <FileText size={15} />
                <span>Problem Statement: {session?.problemId?.title}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {session?.problemId?.description}
              </p>
            </div>

            {/* Transcript Messages */}
            {session?.transcript?.map((item, idx) => {
              const isLatest = idx === session.transcript.length - 1;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Interviewer Question Box */}
                  <div
                    className="animate-fade-in"
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(168, 85, 247, 0.2)',
                        color: '#c084fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bot size={17} />
                    </div>

                    <div
                      style={{
                        flex: 1,
                        padding: '1rem 1.15rem',
                        borderRadius: '0.85rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-secondary)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                          Round {item.round}: {item.roundName}
                        </span>
                        <button
                          onClick={() => speakText(item.interviewerQuestion)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.2rem',
                          }}
                          title="Replay Audio"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>

                      <div
                        style={{
                          fontSize: '0.88rem',
                          lineHeight: 1.6,
                          color: 'var(--text-primary)',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {item.interviewerQuestion}
                      </div>

                      {/* If this round has an evaluation feedback */}
                      {item.feedback && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            fontSize: '0.75rem',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span><strong>Feedback:</strong> {item.feedback}</span>
                          <span style={{ fontWeight: 800 }}>{item.roundScore}/100</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Candidate Answer Box (if answered in this round) */}
                  {item.candidateAnswer && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '85%',
                          padding: '0.85rem 1.15rem',
                          borderRadius: '0.85rem',
                          backgroundColor: 'var(--accent-primary)',
                          color: '#ffffff',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: '0.875rem',
                          lineHeight: 1.55,
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', opacity: 0.8, marginBottom: '0.25rem', textAlign: 'right' }}>
                          Candidate Response
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{item.candidateAnswer}</div>
                      </div>

                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          color: '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <User size={17} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {submittingStep && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <Sparkles size={16} className="animate-spin" color="var(--accent-primary)" />
                <span>Interviewer is evaluating your response and preparing next round...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Candidate Response Composer */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Your Answer to Round {currentRoundNum}:
              </span>

              {/* Voice Input Mic Toggle */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: isListening ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-tertiary)',
                  border: isListening ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-primary)',
                  color: isListening ? '#ef4444' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {isListening ? <Mic size={14} className="animate-pulse" /> : <MicOff size={14} />}
                <span>{isListening ? 'Listening...' : 'Dictate (Voice)'}</span>
              </button>
            </div>

            <textarea
              className="input-arena"
              rows={3}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="State your technical reasoning, Big-O trade-offs, edge cases, or architecture details..."
              style={{
                width: '100%',
                resize: 'none',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                marginBottom: '0.75rem',
              }}
              disabled={submittingStep}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                💡 Your current code from the right panel is automatically attached to this round.
              </div>

              <button
                onClick={handleNextRound}
                disabled={submittingStep || (!candidateAnswer.trim() && !code.trim())}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.25rem',
                  fontWeight: 700,
                }}
              >
                {submittingStep ? (
                  <span>Evaluating...</span>
                ) : (
                  <>
                    <span>Submit & Proceed to Round {currentRoundNum < 6 ? currentRoundNum + 1 : 'Report'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ==============================================
            RIGHT PANE: LIVE MONACO CODE WORKSPACE & SANDBOX
           ============================================== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary)',
            overflow: 'hidden',
          }}
        >
          {/* Editor Header Bar */}
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
              <Code2 size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Live Coding Workspace</span>

              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginLeft: '0.5rem',
                }}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ 17</option>
                <option value="java">Java 17</option>
                <option value="c">C (GCC)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleResetCode}
                className="btn btn-secondary btn-sm"
                title="Reset editor to clean starter template"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                }}
              >
                <Play size={13} fill="currentColor" />
                <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Pane */}
          <div style={{ flex: 1, minHeight: '320px', position: 'relative' }}>
            <Editor
              height="100%"
              language={language}
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

          {/* Bottom Test Execution Drawer */}
          <div
            style={{
              height: '220px',
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
                onClick={() => setActiveTab('testcases')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: activeTab === 'testcases' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'testcases' ? '2px solid var(--accent-primary)' : 'none',
                }}
              >
                Sample Test Cases
              </button>

              <button
                onClick={() => setActiveTab('output')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: activeTab === 'output' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'output' ? '2px solid var(--accent-primary)' : 'none',
                }}
              >
                Sandbox Output {runResults && `(${runResults.verdict})`}
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
              {activeTab === 'testcases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {session?.problemId?.testCases?.filter((t) => !t.isHidden)?.slice(0, 3)?.map((tc, idx) => (
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
                      <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Case {idx + 1}:</div>
                      <div>Input: <span style={{ color: '#38bdf8' }}>{tc.input}</span></div>
                      <div>Expected: <span style={{ color: '#10b981' }}>{tc.expectedOutput}</span></div>
                    </div>
                  ))}
                  {(!session?.problemId?.testCases || session.problemId.testCases.length === 0) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Test cases will execute against public benchmarks.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'output' && (
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
                          Passed {runResults.testsPassed} / {runResults.totalTests} tests
                        </span>
                        {runResults.executionTime && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ⚡ {runResults.executionTime}ms
                          </span>
                        )}
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
                          }}
                        >
                          {runResults.compileError}
                        </div>
                      )}

                      {(runResults.results || runResults.testResults)?.map((tr, i) => (
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
                          <span>Test Case #{i + 1}</span>
                          <span style={{ color: tr.passed ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {tr.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                      Click "Run Tests" to execute your code against sandboxed test cases.
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
export default RealInterviewSimulatorPage;
