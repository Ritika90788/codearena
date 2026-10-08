import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  FileCode2,
  Download,
  Filter,
} from 'lucide-react';

export const AnalyticsPage = () => {
  const difficultyStats = [
    { difficulty: 'Easy', count: 6, avgSolveRate: '88%', avgTime: '12 mins' },
    { difficulty: 'Medium', count: 7, avgSolveRate: '72%', avgTime: '28 mins' },
    { difficulty: 'Hard', count: 3, avgSolveRate: '41%', avgTime: '45 mins' },
  ];

  const rankings = [
    { rank: 1, name: 'Devon Vance', email: 'candidate@codearena.demo', rating: 1560, completed: 5, avgScore: '94%' },
    { rank: 2, name: 'Jordan Lee', email: 'jordan@codearena.demo', rating: 1520, completed: 4, avgScore: '92%' },
    { rank: 3, name: 'Marcus Chen', email: 'marcus@codearena.demo', rating: 1480, completed: 4, avgScore: '89%' },
    { rank: 4, name: 'Elena Rostova', email: 'elena@codearena.demo', rating: 1440, completed: 3, avgScore: '85%' },
    { rank: 5, name: 'Aiden Taylor', email: 'aiden@codearena.demo', rating: 1390, completed: 3, avgScore: '81%' },
  ];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <BarChart3 size={22} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Cohort Performance & Analytics</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Aggregated institutional metrics, score distribution graphs, and student rankings across evaluations.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm">
          <Download size={14} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card-glass" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
            TOTAL TEST SUBMISSIONS
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>1,420</div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>+18% vs last cohort</span>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
            MEDIAN ASSESSMENT SCORE
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>78.4%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 75% Benchmark</span>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
            OVERALL PASS RATE
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>74.2%</div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Above industry standard</span>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
            COMPLETION RETENTION
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7' }}>96.1%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Under 4% dropout rate</span>
        </div>
      </div>

      {/* Difficulty Breakdown & Score Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Difficulty Metrics */}
        <div className="card-glass" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Question Difficulty Statistics
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {difficultyStats.map((d) => (
              <div
                key={d.difficulty}
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge badge-${d.difficulty.toLowerCase()}`}>{d.difficulty}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({d.count} Questions)</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                  <div><strong>Solve Rate:</strong> {d.avgSolveRate}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Avg Time: {d.avgTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution Visualizer */}
        <div className="card-glass" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Score Distribution (Bell Curve)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { bracket: '90 - 100% (High Honors)', pct: 28, color: '#10b981' },
              { bracket: '75 - 89% (Proficient)', pct: 46, color: '#3b82f6' },
              { bracket: '60 - 74% (Developing)', pct: 18, color: '#f59e0b' },
              { bracket: '< 60% (Needs Improvement)', pct: 8, color: '#ef4444' },
            ].map((b) => (
              <div key={b.bracket}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span>{b.bracket}</span>
                  <span style={{ fontWeight: 700 }}>{b.pct}%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                  <div style={{ width: `${b.pct}%`, height: '100%', backgroundColor: b.color, borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Rankings Leaderboard Table */}
      <div className="card-glass" style={{ padding: '1.75rem', borderRadius: '0.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Top Performing Candidates
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Rank</th>
                <th style={{ padding: '0.75rem' }}>Candidate</th>
                <th style={{ padding: '0.75rem' }}>Rating</th>
                <th style={{ padding: '0.75rem' }}>Completed Tests</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Average Score</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((c) => (
                <tr key={c.rank} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: c.rank === 1 ? '#f59e0b' : 'var(--text-primary)' }}>
                    #{c.rank}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)' }}>
                    {c.rating}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    {c.completed} Assessments
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                    {c.avgScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
