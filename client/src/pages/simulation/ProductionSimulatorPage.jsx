import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  Terminal,
  Play,
  CheckCircle,
  AlertTriangle,
  Server,
  Activity,
  Layers,
  Clock,
  Send,
  Database,
  Search,
  Flame,
  FileCode,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Bell,
  ArrowRight,
  HelpCircle,
  Check,
  ChevronRight,
  ListTodo,
  FileText,
  Workflow,
  Sparkles,
  BarChart3,
  Bot,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  FolderTree,
  Code2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Circle,
} from 'lucide-react';

export const ProductionSimulatorPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { success, error, info } = useToast();
  const { id } = useParams();

  // Active Left Sidebar Tab: 'tasks' | 'requirements' | 'files' | 'notifications'
  const [activeLeftTab, setActiveLeftTab] = useState('tasks');

  // Active Right Panel Tab: 'health' | 'metrics' | 'db' | 'logs' | 'ai'
  const [activeRightTab, setActiveRightTab] = useState('health');

  // Active Center Bottom Drawer Tab: 'terminal' | 'explain'
  const [activeBottomTab, setActiveBottomTab] = useState('terminal');
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(true);

  // Active File Path in Virtual Project
  const [activeFilePath, setActiveFilePath] = useState('controllers/orderController.js');

  // Virtual Project Files Map
  const [virtualFiles, setVirtualFiles] = useState({});

  // Simulation State
  const [simulation, setSimulation] = useState({
    _id: id || 'current',
    companyName: 'NovaCart',
    role: 'Junior Full Stack Developer',
    sprintName: 'Order Management System',
    progress: 68,
    systemHealth: {
      status: 'CRITICAL',
      uptime: 99.4,
      errorRate: 17.2,
      avgLatencyMs: 8420,
      dbLoad: 91.4,
    },
    tasks: [],
    incidents: [],
    requirementChanges: [],
    files: [],
  });

  const [activeTask, setActiveTask] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(900); // 15 mins pressure mode countdown
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

  // Code editor value
  const [currentCode, setCurrentCode] = useState('');

  // Terminal Diagnostics
  const [terminalOutput, setTerminalOutput] = useState([
    '[SYSTEM] Connected to NovaCart Production Replica Set: mongo-prod-primary.novacart.internal',
    '[TELEMETRY] Current Latency: 8,420ms | SLA Breach detected | Error Rate: 17.2%',
    '[LOGS] Query plan: COLLSCAN (examined: 412,890 docs, returned: 12 docs)',
    '[LOGS] Warning: 42 sequential queries in loop for merchant resolution',
    '[ALERT] 🚨 CRITICAL PRODUCTION INCIDENT ACTIVE: Order API response time is 8.4s (SLA: 200ms)',
  ]);

  // Root Cause Investigation Modal
  const [investigating, setInvestigating] = useState(false);
  const [selectedRootCause, setSelectedRootCause] = useState('Missing database index and N+1 query');
  const [explanationText, setExplanationText] = useState(
    'The 8.4s response time is caused by a missing compound index on { customerId: 1, createdAt: -1 } causing a full collection scan (COLLSCAN) across 412,890 documents, combined with an N+1 query loop querying the Merchant collection sequentially per order.'
  );

  // Technical Explanation Modal (Explain Your Approach)
  const [explaining, setExplaining] = useState(false);
  const [candidateExplanationInput, setCandidateExplanationInput] = useState('');
  const [explanationEvaluationResult, setExplanationEvaluationResult] = useState(null);
  const [evaluatingExplanation, setEvaluatingExplanation] = useState(false);

  // AI Assistant Chat Messages
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your Senior Staff Engineer simulation assistant. I notice our Order API has breached its 200ms latency SLA, running at 8.4s during peak traffic. Check the database execution plan in the Database tab and look closely at `orderController.js`.',
    },
  ]);
  const [aiChatInput, setAiChatInput] = useState('');

  // Fetch simulation data from backend
  useEffect(() => {
    const fetchSimulation = async () => {
      try {
        const res = await api.get('/simulations/current');
        if (res && res.simulation) {
          const sim = res.simulation;
          setSimulation(sim);

          // Build files dictionary
          const fileMap = {};
          if (sim.files && sim.files.length > 0) {
            sim.files.forEach((f) => {
              fileMap[f.path] = f.content;
            });
          }

          setVirtualFiles(fileMap);

          // Set default active task (task-3 if in progress)
          const inProg = sim.tasks?.find((t) => t.status === 'in_progress') || sim.tasks?.[0];
          setActiveTask(inProg);

          // Set editor content
          if (fileMap['controllers/orderController.js']) {
            setCurrentCode(fileMap['controllers/orderController.js']);
          }
        }
      } catch (err) {
        console.warn('Simulation fetch fallback to defaults:', err);
      }
    };

    fetchSimulation();
  }, []);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Switch virtual file
  const handleSelectFile = (path) => {
    // Save current file in memory
    setVirtualFiles((prev) => ({ ...prev, [activeFilePath]: currentCode }));
    setActiveFilePath(path);
    setCurrentCode(virtualFiles[path] || '');
  };

  // Handle Code Change
  const handleCodeChange = (newVal) => {
    const updated = newVal || '';
    setCurrentCode(updated);
    setVirtualFiles((prev) => ({ ...prev, [activeFilePath]: updated }));
  };

  // Save current file to backend
  const handleSaveFile = async () => {
    try {
      await api.post(`/simulations/${simulation._id}/save-file`, {
        path: activeFilePath,
        content: currentCode,
      });
      success(`Saved ${activeFilePath}`);
    } catch (err) {
      error('Failed to save file to virtual workspace');
    }
  };

  // Run benchmark against candidate's code
  const handleRunBenchmark = async () => {
    try {
      setIsRunningBenchmark(true);
      setActiveBottomTab('terminal');
      setBottomDrawerOpen(true);

      const codeToCheck = virtualFiles['controllers/orderController.js'] || currentCode;
      const res = await api.post(`/simulations/${simulation._id}/benchmark`, {
        code: codeToCheck,
      });

      if (res && res.success) {
        setTerminalOutput((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Running automated load benchmark...`,
          ...(res.logs || []),
          res.passed
            ? `✅ SUCCESS: ${res.message}`
            : `❌ FAILED: ${res.message}`,
        ]);

        if (res.passed) {
          success(`Benchmark Passed! Latency dropped to ${res.latency}ms (SLA: 200ms)`);
          setSimulation((prev) => ({
            ...prev,
            systemHealth: {
              ...prev.systemHealth,
              status: 'HEALTHY',
              avgLatencyMs: res.latency,
              errorRate: 0.1,
              dbLoad: 24,
            },
          }));
        } else {
          error(`Benchmark Failed: ${res.latency}ms exceeds 200ms threshold.`);
        }
      }
    } catch (err) {
      error('Failed to execute load benchmark: ' + err.message);
    } finally {
      setIsRunningBenchmark(false);
    }
  };

  // Confirm Incident Resolution
  const handleConfirmResolution = async () => {
    try {
      const res = await api.post(`/simulations/${simulation._id}/incident/inc-01/resolve`, {
        selectedRootCause,
        explanation: explanationText,
        codeFix: currentCode,
      });

      setInvestigating(false);

      if (res && res.success) {
        setSimulation(res.simulation || simulation);
        setActiveBottomTab('terminal');
        setBottomDrawerOpen(true);

        setTerminalOutput((prev) => [
          ...prev,
          '==============================================================',
          '🎉 [INCIDENT TRIAGE SUCCESS] Mitigation Deployed to Production!',
          `   Root Cause: ${selectedRootCause}`,
          `   Response Time: ${res.isCorrectRootCause ? '145ms' : '4,200ms'}`,
          `   Database Load: ${res.isCorrectRootCause ? '24%' : '62%'}`,
          `   System Status: ${res.systemHealth?.status || 'HEALTHY'}`,
          '==============================================================',
        ]);

        if (res.isCorrectRootCause) {
          success('Incident Successfully Mitigated! Latency: 145ms.');
        } else {
          info('Incident partially mitigated, but sub-optimal parameters remain.');
        }
      }
    } catch (err) {
      error('Failed to submit incident mitigation: ' + err.message);
    }
  };

  // Advance Requirement Change Stage
  const handleAdvanceRequirement = async () => {
    try {
      const res = await api.post(`/simulations/${simulation._id}/requirement/next`, {});
      if (res && res.success) {
        setSimulation((prev) => ({
          ...prev,
          requirementChanges: res.requirementChanges,
        }));

        const activeReq = res.activeRequirement;
        success(`New Requirement Activated: ${activeReq?.title}`);

        // Switch to cartService.js for guest checkout requirement
        if (activeReq?.title?.toLowerCase().includes('guest')) {
          handleSelectFile('services/cartService.js');
          info('Switched editor to services/cartService.js to implement Guest Checkout.');
        }

        setTerminalOutput((prev) => [
          ...prev,
          `[REQUIREMENT CHANGED] Product Manager updated sprint backlog: "${activeReq?.title}"`,
          `  Details: ${activeReq?.description}`,
        ]);
      }
    } catch (err) {
      error('Failed to advance requirement stage');
    }
  };

  // Evaluate Technical Explanation (Explain Your Code)
  const handleEvaluateExplanation = async () => {
    if (!candidateExplanationInput.trim()) {
      error('Please write your technical explanation.');
      return;
    }

    try {
      setEvaluatingExplanation(true);
      const res = await api.post(`/simulations/${simulation._id}/explain`, {
        explanation: candidateExplanationInput,
        implementationCode: currentCode,
      });

      if (res && res.success) {
        setExplanationEvaluationResult(res);
        success('Technical explanation evaluated!');
      }
    } catch (err) {
      error('Evaluation failed: ' + err.message);
    } finally {
      setEvaluatingExplanation(false);
    }
  };

  // Send message to AI Assistant
  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userText = aiChatInput.trim();
    setAiChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setAiChatInput('');

    // Generate responsive non-spoiling engineering advice
    setTimeout(() => {
      let reply = '';
      const textLower = userText.toLowerCase();
      if (textLower.includes('index') || textLower.includes('database')) {
        reply =
          'Regarding the database: In MongoDB, sorting on `createdAt: -1` after filtering on `customerId` requires a compound index `{ customerId: 1, createdAt: -1 }`. Without this, the query engine performs an in-memory sort or COLLSCAN.';
      } else if (textLower.includes('n+1') || textLower.includes('slow') || textLower.includes('loop')) {
        reply =
          'Notice how `Merchant.findById` is being awaited inside a `for (const order of orders)` loop. If 50 orders are returned, that causes 50 sequential network round trips. Using MongoDB `$lookup` in an aggregation pipeline resolves this in a single query.';
      } else if (textLower.includes('guest') || textLower.includes('cart')) {
        reply =
          'For the guest checkout requirement change, inspect `services/cartService.js`. You should verify that if `userId` is missing, the service falls back to `guestSessionId` without throwing an unauthorized error.';
      } else {
        reply =
          'Good question. Use the Database and Logs panels on the right to examine the slow query logs and execution plan. You can test your changes anytime using the "Run Benchmark" button.';
      }

      setAiChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    }, 600);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#070b13',
        color: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* 1. TOP BAR */}
      <header
        style={{
          height: '52px',
          backgroundColor: '#0c121e',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          flexShrink: 0,
        }}
      >
        {/* Brand & Simulation Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link
            to="/candidate/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#38bdf8',
              textDecoration: 'none',
              fontWeight: 900,
              fontSize: '1.05rem',
            }}
          >
            <Terminal size={19} />
            <span>CodeArena</span>
          </Link>
          <span style={{ color: '#334155' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc' }}>
              {simulation.companyName}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              • {simulation.sprintName}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                fontWeight: 700,
              }}
            >
              {simulation.role}
            </span>
          </div>
        </div>

        {/* Center: Pressure Timer & System Health Alert */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '4px',
              backgroundColor: timerSeconds < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${timerSeconds < 300 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)'}`,
              color: timerSeconds < 300 ? '#ef4444' : '#f59e0b',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Clock size={14} />
            <span>Sprint Timer: {formatTime(timerSeconds)}</span>
          </div>

          {/* System Health */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '4px',
              backgroundColor:
                simulation.systemHealth.status === 'CRITICAL'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${
                simulation.systemHealth.status === 'CRITICAL'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'rgba(16, 185, 129, 0.3)'
              }`,
              color: simulation.systemHealth.status === 'CRITICAL' ? '#f87171' : '#34d399',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Activity size={14} />
            <span>
              Status: {simulation.systemHealth.status} ({simulation.systemHealth.avgLatencyMs}ms)
            </span>
          </div>

          {/* Sprint Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#94a3b8' }}>
            <span>Sprint:</span>
            <strong style={{ color: '#f8fafc' }}>{simulation.progress}%</strong>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => setExplaining(true)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
          >
            <FileText size={13} />
            <span>Explain Decisions</span>
          </button>
          <Link
            to="/candidate/dashboard"
            className="btn btn-outline btn-sm"
            style={{ textDecoration: 'none', padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
          >
            Exit to Dashboard
          </Link>
        </div>
      </header>

      {/* 2. MAIN 3-PANEL LAYOUT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDEBAR: Tasks, Requirements Timeline, Project File Tree, Feed */}
        <aside
          style={{
            width: '290px',
            backgroundColor: '#0a0f1c',
            borderRight: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Left Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-primary)',
              backgroundColor: '#080d17',
            }}
          >
            {[
              { id: 'tasks', label: 'Tasks' },
              { id: 'requirements', label: 'Requirements' },
              { id: 'files', label: 'Files' },
              { id: 'notifications', label: 'Feed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLeftTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '0.65rem 0',
                  fontSize: '0.72rem',
                  fontWeight: activeLeftTab === tab.id ? 800 : 500,
                  color: activeLeftTab === tab.id ? '#38bdf8' : '#94a3b8',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeLeftTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Left Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem' }}>
            {/* TASKS TAB */}
            {activeLeftTab === 'tasks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                    SPRINT TASKS ({simulation.progress}%)
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>
                    {simulation.tasks.filter((t) => t.status === 'completed').length} / {simulation.tasks.length} Done
                  </span>
                </div>

                {simulation.tasks.map((task) => {
                  const isCurrent = activeTask?.id === task.id;
                  return (
                    <div
                      key={task.id}
                      onClick={() => setActiveTask(task)}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: isCurrent ? '1px solid rgba(59, 130, 246, 0.45)' : '1px solid var(--border-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                            backgroundColor: task.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                            color: task.priority === 'CRITICAL' ? '#f87171' : '#60a5fa',
                          }}
                        >
                          {task.priority}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{task.deadline}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                        {task.status === 'completed' ? (
                          <CheckCircle size={15} color="#10b981" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                        ) : task.status === 'in_progress' ? (
                          <Flame size={15} color="#ef4444" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                        ) : (
                          <Circle size={15} color="#64748b" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                        )}
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: task.status === 'in_progress' ? 700 : 500,
                            color: task.status === 'in_progress' ? '#fca5a5' : task.status === 'completed' ? '#cbd5e1' : '#94a3b8',
                            lineHeight: 1.35,
                          }}
                        >
                          {task.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* REQUIREMENTS TAB (Changing Requirements Timeline) */}
            {activeLeftTab === 'requirements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                    REQUIREMENTS TIMELINE
                  </span>
                  <button
                    onClick={handleAdvanceRequirement}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}
                  >
                    <span>Trigger Next</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

                {simulation.requirementChanges.map((req, idx) => (
                  <div key={req.step} style={{ position: 'relative' }}>
                    <div
                      style={{
                        padding: '0.75rem',
                        borderRadius: '6px',
                        backgroundColor: req.status === 'active' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-tertiary)',
                        border: req.status === 'active' ? '1px solid #3b82f6' : '1px solid var(--border-primary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: req.status === 'active' ? '#60a5fa' : '#94a3b8' }}>
                          Step {req.step}: {req.title}
                        </span>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                            backgroundColor: req.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : req.status === 'active' ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                            color: req.status === 'completed' ? '#10b981' : req.status === 'active' ? '#ffffff' : '#64748b',
                          }}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                        {req.description}
                      </p>
                    </div>

                    {idx < simulation.requirementChanges.length - 1 && (
                      <div
                        style={{
                          width: '2px',
                          height: '14px',
                          backgroundColor: req.status === 'completed' ? '#10b981' : '#334155',
                          margin: '0 auto',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* FILES TAB (Virtual Project Explorer) */}
            {activeLeftTab === 'files' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.4rem' }}>
                  NovaCart Project Tree
                </div>
                {simulation.files.map((file) => {
                  const isSelected = activeFilePath === file.path;
                  return (
                    <div
                      key={file.path}
                      onClick={() => handleSelectFile(file.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        color: isSelected ? '#38bdf8' : '#cbd5e1',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <FileCode size={14} color={isSelected ? '#38bdf8' : '#64748b'} />
                      <span>{file.path}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeLeftTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.75rem' }}>
                <div style={{ padding: '0.65rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ fontWeight: 800, color: '#f87171', marginBottom: '0.2rem' }}>P99 SLA Breach Alert</div>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>Response time hit 8,420ms on GET /api/v1/orders. Flash sale customers dropping off.</div>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 800, color: '#60a5fa', marginBottom: '0.2rem' }}>Database Cluster Alert</div>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>Replica set node 1 CPU pegged at 91.4% due to continuous table scans.</div>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 800, color: '#10b981', marginBottom: '0.2rem' }}>Sprint Standup</div>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>Sprint priority updated: Order API stability must be resolved before guest cart launch.</div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER COLUMN: Code Editor, Active Task Banner, and Expandable Terminal */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#050811',
            overflow: 'hidden',
          }}
        >
          {/* Active Task Banner */}
          <div
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: '#0a0f1d',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8' }}>
                  ACTIVE TASK:
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                  {activeTask?.title}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
                {activeTask?.instructions}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleSaveFile}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              >
                <span>Save File</span>
              </button>
              <button
                onClick={handleRunBenchmark}
                disabled={isRunningBenchmark}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
              >
                <Play size={12} color="#10b981" />
                <span>{isRunningBenchmark ? 'Running...' : 'Run Benchmark'}</span>
              </button>
              <button
                onClick={() => setInvestigating(true)}
                className="btn btn-danger btn-sm"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
              >
                <AlertTriangle size={12} />
                <span>Investigate Incident</span>
              </button>
            </div>
          </div>

          {/* Active File Tab Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#090e1a',
              borderBottom: '1px solid var(--border-primary)',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1rem',
                  backgroundColor: '#050811',
                  borderRight: '1px solid var(--border-primary)',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <FileCode size={13} />
                <span>{activeFilePath}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingRight: '0.75rem', gap: '0.5rem', color: '#64748b', fontSize: '0.72rem' }}>
              <span>JavaScript (ES Modules)</span>
              <span>•</span>
              <span>Monaco Editor</span>
            </div>
          </div>

          {/* Monaco Code Editor */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={activeFilePath.endsWith('.json') ? 'json' : 'javascript'}
              value={currentCode}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                tabSize: 2,
                renderLineHighlight: 'all',
              }}
            />
          </div>

          {/* Bottom Expandable Diagnostics Drawer */}
          <div
            style={{
              borderTop: '1px solid var(--border-primary)',
              backgroundColor: '#080c18',
              display: 'flex',
              flexDirection: 'column',
              height: bottomDrawerOpen ? '200px' : '36px',
              transition: 'height 0.2s ease',
              flexShrink: 0,
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 0.85rem',
                height: '35px',
                borderBottom: bottomDrawerOpen ? '1px solid var(--border-primary)' : 'none',
                backgroundColor: '#060a14',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setActiveBottomTab('terminal');
                    setBottomDrawerOpen(true);
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: activeBottomTab === 'terminal' ? '#38bdf8' : '#94a3b8',
                    fontWeight: activeBottomTab === 'terminal' ? 800 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Terminal size={13} />
                  <span>Terminal & Diagnostics ({terminalOutput.length})</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setBottomDrawerOpen(!bottomDrawerOpen)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.2rem',
                  }}
                >
                  {bottomDrawerOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            {bottomDrawerOpen && (
              <div
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  overflowY: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  lineHeight: 1.6,
                  color: '#cbd5e1',
                  backgroundColor: '#040710',
                }}
              >
                {terminalOutput.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      color:
                        line.includes('CRITICAL') || line.includes('FAILED') || line.includes('SLA BREACH')
                          ? '#ef4444'
                          : line.includes('Warning') || line.includes('WARN')
                          ? '#f59e0b'
                          : line.includes('SUCCESS') || line.includes('PASSED') || line.includes('PASSED')
                          ? '#10b981'
                          : '#94a3b8',
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* RIGHT PANEL: Health, Metrics, Database, Logs, AI Assistant */}
        <aside
          style={{
            width: '320px',
            backgroundColor: '#0a0f1c',
            borderLeft: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Right Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-primary)',
              backgroundColor: '#080d17',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'health', label: 'Health' },
              { id: 'metrics', label: 'Metrics' },
              { id: 'db', label: 'Database' },
              { id: 'logs', label: 'Logs' },
              { id: 'ai', label: 'AI Coach' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id)}
                style={{
                  padding: '0.65rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: activeRightTab === tab.id ? 800 : 500,
                  color: activeRightTab === tab.id ? '#38bdf8' : '#94a3b8',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeRightTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Content Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', fontSize: '0.8rem' }}>
            {/* HEALTH TAB */}
            {activeRightTab === 'health' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    padding: '0.85rem',
                    backgroundColor: simulation.systemHealth.status === 'CRITICAL' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '6px',
                    border: `1px solid ${simulation.systemHealth.status === 'CRITICAL' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: simulation.systemHealth.status === 'CRITICAL' ? '#f87171' : '#34d399', marginBottom: '0.2rem' }}>
                    PRODUCTION SYSTEM STATUS
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                    {simulation.systemHealth.status}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    Response: {simulation.systemHealth.avgLatencyMs}ms (SLA: 200ms)
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#94a3b8' }}>Database Load</span>
                    <strong style={{ color: simulation.systemHealth.dbLoad > 80 ? '#ef4444' : '#10b981' }}>{simulation.systemHealth.dbLoad}%</strong>
                  </div>
                  <div style={{ height: '5px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${simulation.systemHealth.dbLoad}%`, height: '100%', backgroundColor: simulation.systemHealth.dbLoad > 80 ? '#ef4444' : '#10b981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#94a3b8' }}>Error Rate</span>
                    <strong style={{ color: simulation.systemHealth.errorRate > 5 ? '#ef4444' : '#10b981' }}>{simulation.systemHealth.errorRate}%</strong>
                  </div>
                  <div style={{ height: '5px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, simulation.systemHealth.errorRate * 4)}%`, height: '100%', backgroundColor: simulation.systemHealth.errorRate > 5 ? '#ef4444' : '#10b981' }} />
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Affected Customers</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>40,281</div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Uptime SLA Compliance</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981' }}>99.4%</div>
                </div>
              </div>
            )}

            {/* METRICS TAB */}
            {activeRightTab === 'metrics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Throughput</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>1,420 requests / sec</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>p50 Latency</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>240ms</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>p95 Latency</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>8.4 seconds</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>p99 Latency</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>11.2 seconds</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>HTTP 504 Timeout Rate</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>17.2% of traffic</div>
                </div>
              </div>
            )}

            {/* DATABASE TAB */}
            {activeRightTab === 'db' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  MongoDB Query Execution Plan
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#050811', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', border: '1px solid var(--border-primary)' }}>
                  <div>Collection: <strong>"orders"</strong></div>
                  <div>Docs in collection: <strong>412,890</strong></div>
                  <div style={{ color: '#ef4444', marginTop: '0.35rem' }}>
                    Winning Plan: <strong>COLLSCAN</strong>
                  </div>
                  <div style={{ color: '#ef4444' }}>
                    docsExamined: <strong>412,890</strong>
                  </div>
                  <div>docsReturned: <strong>12</strong></div>
                  <div style={{ color: '#ef4444' }}>executionTimeMillis: <strong>8,420ms</strong></div>
                </div>

                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Index Analysis
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.75rem', lineHeight: 1.45 }}>
                  Current Index: <code>&#123; customerId: 1 &#125;</code> (Single-field index forces in-memory sort on createdAt).<br /><br />
                  <strong style={{ color: '#38bdf8' }}>Required Fix:</strong> Compound index <code>&#123; customerId: 1, createdAt: -1 &#125;</code> allows indexed pipeline scan without memory sort.
                </div>
              </div>
            )}

            {/* LOGS TAB */}
            {activeRightTab === 'logs' && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', color: '#94a3b8' }}>
                <div style={{ color: '#f59e0b' }}>[10:14:02.102] WARN Mongo query time &gt; 7500ms on 'orders'</div>
                <div style={{ color: '#60a5fa' }}>[10:14:02.215] INFO Query plan: COLLSCAN (412,890 examined)</div>
                <div style={{ color: '#ef4444' }}>[10:14:03.011] ERROR 504 Upstream timeout /api/v1/orders</div>
                <div style={{ color: '#f59e0b' }}>[10:14:04.112] WARN 42 sequential queries in loop for merchant resolution</div>
                <div style={{ color: '#ef4444' }}>[10:14:05.002] CRIT Healthcheck breach: 8.42s vs 0.20s SLA threshold</div>
              </div>
            )}

            {/* AI ASSISTANT TAB */}
            {activeRightTab === 'ai' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', marginBottom: '0.75rem' }}>
                  {aiChatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: msg.role === 'assistant' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
                        border: msg.role === 'assistant' ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid var(--border-primary)',
                        fontSize: '0.75rem',
                        lineHeight: 1.45,
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.68rem', color: msg.role === 'assistant' ? '#60a5fa' : '#94a3b8', marginBottom: '0.2rem' }}>
                        {msg.role === 'assistant' ? 'AI Staff Engineer Coach' : 'You'}
                      </div>
                      <div style={{ color: '#cbd5e1' }}>{msg.text}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendAiMessage} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    placeholder="Ask engineering question..."
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.65rem',
                      borderRadius: '4px',
                      backgroundColor: '#050811',
                      border: '1px solid var(--border-primary)',
                      color: '#f8fafc',
                      fontSize: '0.75rem',
                    }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.5rem' }}>
                    <Send size={12} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 3. INVESTIGATION & ROOT CAUSE MODAL */}
      {investigating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            className="card-glass animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '2rem',
              borderRadius: '0.85rem',
              backgroundColor: '#0c1322',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <AlertTriangle size={22} color="#f59e0b" />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>
                Production Incident Root Cause Triage
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              The Order API is responding in <strong>8.4 seconds</strong> affecting 40,281 users.
              Based on logs, telemetry metrics, and the code, identify the deterministic root cause:
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem' }}>
                PRIMARY ROOT CAUSE:
              </label>
              <select
                value={selectedRootCause}
                onChange={(e) => setSelectedRootCause(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '6px',
                  backgroundColor: '#050811',
                  border: '1px solid var(--border-secondary)',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                }}
              >
                <option value="Missing database index and N+1 query">
                  Missing compound database index & N+1 query loop
                </option>
                <option value="Memory leak in Node.js worker heap">
                  Memory leak in Node.js worker process
                </option>
                <option value="Bad API logic & redundant serialization">
                  Bad API logic & redundant JSON serialization
                </option>
                <option value="Infinite loop in state machine">
                  Infinite loop in state machine
                </option>
                <option value="Inefficient algorithm">
                  Inefficient algorithm (O(N^2) sorting)
                </option>
                <option value="Incorrect caching invalidation">
                  Incorrect caching invalidation
                </option>
                <option value="Connection issue">
                  Connection issue / Pool exhaustion
                </option>
                <option value="Race condition in inventory">
                  Race condition in inventory reservation
                </option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem' }}>
                TECHNICAL PROPOSAL & EXPLANATION:
              </label>
              <textarea
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '6px',
                  backgroundColor: '#050811',
                  border: '1px solid var(--border-secondary)',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-sans)',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setInvestigating(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                className="btn btn-primary btn-sm"
              >
                Deploy Mitigation to Production
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TECHNICAL EXPLANATION / EXPLAIN YOUR CODE MODAL */}
      {explaining && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            className="card-glass animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '2rem',
              borderRadius: '0.85rem',
              backgroundColor: '#0c1322',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <FileText size={22} color="#38bdf8" />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>
                Explain Your Approach & Architecture Decisions
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Why did your fix resolve the 8.4s response time? Explain how your code prevents regressions under high traffic:
            </p>

            <textarea
              value={candidateExplanationInput}
              onChange={(e) => setCandidateExplanationInput(e.target.value)}
              placeholder="e.g. I added a compound index { customerId: 1, createdAt: -1 } so MongoDB could fulfill the query via IXSCAN without in-memory sorting. Additionally, I converted the per-order merchant loop into a single-pass $lookup aggregation pipeline to eliminate N+1 roundtrips."
              rows={5}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: '#050811',
                border: '1px solid var(--border-secondary)',
                color: '#f8fafc',
                fontSize: '0.825rem',
                lineHeight: 1.5,
                fontFamily: 'var(--font-sans)',
                resize: 'none',
                marginBottom: '1rem',
              }}
            />

            {/* AI Consistency Evaluation Result */}
            {explanationEvaluationResult && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.825rem', color: '#34d399' }}>
                    AI Evaluation Verdict: {explanationEvaluationResult.consistencySignal}
                  </span>
                  <span style={{ fontWeight: 900, color: '#10b981', fontSize: '1rem' }}>
                    {explanationEvaluationResult.understandingScore}% Understanding
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
                  {explanationEvaluationResult.feedback}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setExplaining(false);
                  setExplanationEvaluationResult(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
              <button
                onClick={handleEvaluateExplanation}
                disabled={evaluatingExplanation}
                className="btn btn-primary btn-sm"
              >
                {evaluatingExplanation ? 'Evaluating with AI...' : 'Submit Explanation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionSimulatorPage;
