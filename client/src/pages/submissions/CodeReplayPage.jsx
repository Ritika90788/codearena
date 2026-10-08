import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';
import {
  History,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  FileCode,
  Tag,
} from 'lucide-react';

export const CodeReplayPage = () => {
  const { theme } = useTheme();

  // Milestone timeline data
  const milestones = [
    {
      step: 1,
      title: 'Problem Opened & Starter Loaded',
      timestamp: '10:02:15 AM',
      verdict: 'Draft',
      status: 'info',
      summary: 'Candidate read problem constraints and initialized function skeleton.',
      code: `function twoSum(nums, target) {\n  // Let's try brute force first\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n  return [];\n}`,
    },
    {
      step: 2,
      title: 'First Test Run (Brute Force O(N²))',
      timestamp: '10:05:40 AM',
      verdict: 'Accepted (Public Tests)',
      status: 'warning',
      summary: 'Public test cases passed, but candidate realized large inputs might cause Time Limit Exceeded.',
      code: `function twoSum(nums, target) {\n  // Quadratic scan O(N^2)\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n  return [];\n}`,
    },
    {
      step: 3,
      title: 'Initial Full Submission',
      timestamp: '10:08:12 AM',
      verdict: 'Time Limit Exceeded',
      status: 'danger',
      summary: 'Failed on hidden stress test case (10,000 items). Exceeded 2000ms limit.',
      code: `function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n  return [];\n}`,
    },
    {
      step: 4,
      title: 'Algorithmic Refactor to Hash Map',
      timestamp: '10:12:05 AM',
      verdict: 'Draft Refactor',
      status: 'info',
      summary: 'Candidate transitioned from nested loops to a single-pass Map lookup.',
      code: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    },
    {
      step: 5,
      title: 'Final Submission: All 4 Tests Passed',
      timestamp: '10:13:30 AM',
      verdict: 'Accepted (100%)',
      status: 'success',
      summary: 'Executed in 0.05ms. O(N) time and O(N) space. All hidden tests passed.',
      code: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const activeMilestone = milestones[currentIndex];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link
        to="/candidate/submissions"
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
        <span>Back to Submissions</span>
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <History size={22} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Code Replay & Keystroke Trajectory</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Submission #892 • Two Sum • Candidate: Devon Vance • Recorded over 11 minutes
          </p>
        </div>
      </div>

      {/* Step scrubber bar */}
      <div
        className="card-glass"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="btn btn-secondary btn-sm"
          >
            <SkipBack size={14} />
            <span>Prev Step</span>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(milestones.length - 1, prev + 1))}
            disabled={currentIndex === milestones.length - 1}
            className="btn btn-primary btn-sm"
          >
            <span>Next Step</span>
            <SkipForward size={14} />
          </button>
        </div>

        {/* Milestone Steps Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {milestones.map((m, idx) => (
            <button
              key={m.step}
              onClick={() => setCurrentIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: `1px solid ${currentIndex === idx ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                backgroundColor: currentIndex === idx ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-tertiary)',
                color: currentIndex === idx ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <span>#{m.step}</span>
              <span>{m.timestamp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Left Milestone Info, Right Monaco Read-Only Snapshot */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>
        {/* Milestone Card */}
        <div className="card-glass" style={{ padding: '1.75rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className={`badge ${activeMilestone.status === 'success' ? 'badge-easy' : activeMilestone.status === 'danger' ? 'badge-hard' : 'badge-medium'}`}>
                {activeMilestone.verdict}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeMilestone.timestamp}</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              {activeMilestone.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {activeMilestone.summary}
            </p>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <strong>Integrity Metric:</strong> Keystroke cadence was natural. No sudden bulk external pasting detected.
          </div>
        </div>

        {/* Monaco Editor Snapshot */}
        <div
          className="card-glass"
          style={{
            height: '480px',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Snapshot at {activeMilestone.timestamp} • Milestone {currentIndex + 1} of {milestones.length}
          </div>
          <Editor
            height="calc(100% - 35px)"
            language="javascript"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={activeMilestone.code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'Fira Code, monospace',
            }}
          />
        </div>
      </div>
    </div>
  );
};
