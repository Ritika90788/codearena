import React from 'react';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Medal,
  Award,
  Sparkles,
} from 'lucide-react';

export const LeaderboardPage = () => {
  const leaders = [
    { rank: 1, name: 'Jordan Lee', handle: '@jordan_code', rating: 1980, solved: 142, streak: 34, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' },
    { rank: 2, name: 'Devon Vance', handle: '@devon_v', rating: 1940, solved: 138, streak: 28, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { rank: 3, name: 'Elena Rostova', handle: '@elena_dev', rating: 1895, solved: 125, streak: 21, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { rank: 4, name: 'Marcus Chen', handle: '@marcus_c', rating: 1840, solved: 119, streak: 19, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { rank: 5, name: 'Sarah Jenkins', handle: '@sarah_j', rating: 1790, solved: 112, streak: 14, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
    { rank: 6, name: 'Liam O’Connor', handle: '@liam_algo', rating: 1750, solved: 104, streak: 11, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b',
            marginBottom: '1rem',
          }}
        >
          <Trophy size={26} />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Global CodeArena Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Top algorithmic problem solvers evaluated on accuracy, time complexity, and consistency.
        </p>
      </div>

      {/* Podium Top 3 Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Rank 2 */}
        <div
          className="card-glass"
          style={{
            padding: '1.75rem',
            textAlign: 'center',
            borderRadius: '0.75rem',
            border: '1px solid rgba(148, 163, 184, 0.3)',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.5rem' }}>🥈 2nd Place</div>
          <img src={leaders[1].avatar} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{leaders[1].name}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{leaders[1].handle}</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{leaders[1].rating}</div>
        </div>

        {/* Rank 1 (Tallest) */}
        <div
          className="card-glass"
          style={{
            padding: '2.25rem 1.75rem',
            textAlign: 'center',
            borderRadius: '0.75rem',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.15)',
          }}
        >
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f59e0b', marginBottom: '0.5rem' }}>👑 Champion</div>
          <img src={leaders[0].avatar} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 0.75rem', border: '2px solid #f59e0b' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{leaders[0].name}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{leaders[0].handle}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b' }}>{leaders[0].rating}</div>
        </div>

        {/* Rank 3 */}
        <div
          className="card-glass"
          style={{
            padding: '1.75rem',
            textAlign: 'center',
            borderRadius: '0.75rem',
            border: '1px solid rgba(180, 83, 9, 0.3)',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginBottom: '0.5rem' }}>🥉 3rd Place</div>
          <img src={leaders[2].avatar} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{leaders[2].name}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{leaders[2].handle}</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{leaders[2].rating}</div>
        </div>
      </div>

      {/* Global Table */}
      <div className="card-glass" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Rank</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Candidate</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Rating</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Solved</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Active Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((c) => (
              <tr key={c.rank} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: c.rank <= 3 ? '#f59e0b' : 'var(--text-primary)' }}>
                  #{c.rank}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={c.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.handle}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {c.rating}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  {c.solved} Problems
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Flame size={14} /> {c.streak} Days
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
