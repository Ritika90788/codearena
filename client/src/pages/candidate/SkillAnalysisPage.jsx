import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Brain,
  TrendingUp,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Target,
  BarChart2,
  Layers,
} from 'lucide-react';

export const SkillAnalysisPage = () => {
  const { user } = useAuth();

  const skillsData = [
    { category: 'Arrays & Two Pointers', mastery: 92, solved: 14, total: 15, strength: 'High', color: '#3b82f6' },
    { category: 'Strings & Parsing', mastery: 85, solved: 11, total: 13, strength: 'High', color: '#06b6d4' },
    { category: 'Sorting & Searching', mastery: 88, solved: 12, total: 14, strength: 'High', color: '#10b981' },
    { category: 'JavaScript Internals', mastery: 94, solved: 16, total: 17, strength: 'Mastered', color: '#eab308' },
    { category: 'Linked Lists', mastery: 78, solved: 8, total: 10, strength: 'Moderate', color: '#8b5cf6' },
    { category: 'Trees & Binary Search', mastery: 64, solved: 7, total: 11, strength: 'Moderate', color: '#ec4899' },
    { category: 'Hashing & Caching', mastery: 72, solved: 6, total: 9, strength: 'Moderate', color: '#14b8a6' },
    { category: 'Graphs & Traversal', mastery: 50, solved: 5, total: 10, strength: 'Needs Focus', color: '#ef4444' },
    { category: 'Dynamic Programming', mastery: 42, solved: 4, total: 12, strength: 'Needs Focus', color: '#f59e0b' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <div
            style={{
              padding: '0.4rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--accent-primary)',
            }}
          >
            <Brain size={22} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Algorithmic Skill Profile</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time mastery index generated from your assessment submissions, time complexities, and error rates.
        </p>
      </div>

      {/* Top Summary Banner */}
      <div
        className="card-glass animate-fade-in"
        style={{
          padding: '2rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          border: '1px solid var(--border-secondary)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>OVERALL PROFICIENCY</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', margin: '0.25rem 0' }}>
            78.4%
          </div>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Top 12% in Algorithms</span>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>STRONGEST TOPIC</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            JavaScript & Arrays
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>94% Accuracy rate</span>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>RECOMMENDED FOCUS</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.5rem' }}>
            Dynamic Programming
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memoization & subproblem states</span>
        </div>
      </div>

      {/* Skills Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {skillsData.map((skill) => (
          <div
            key={skill.category}
            className="card-glass"
            style={{
              padding: '1.5rem',
              borderRadius: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {skill.category}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor:
                      skill.strength === 'Mastered' || skill.strength === 'High'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : skill.strength === 'Moderate'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                    color:
                      skill.strength === 'Mastered' || skill.strength === 'High'
                        ? '#34d399'
                        : skill.strength === 'Moderate'
                        ? '#60a5fa'
                        : '#f87171',
                  }}
                >
                  {skill.strength}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>Solved: {skill.solved} / {skill.total}</span>
                <span style={{ fontWeight: 700, color: skill.color }}>{skill.mastery}%</span>
              </div>

              <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: `${skill.mastery}%`,
                    height: '100%',
                    backgroundColor: skill.color,
                    borderRadius: '999px',
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Link
                to="/missions"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--accent-primary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>Practice in Missions</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
