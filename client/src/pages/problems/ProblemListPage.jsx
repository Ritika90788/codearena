import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Terminal,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Cpu,
  ArrowRight,
  TrendingUp,
  Tag,
} from 'lucide-react';

export const ProblemListPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const topics = [
    'All',
    'Arrays',
    'Strings',
    'Linked Lists',
    'Stack',
    'Queue',
    'Trees',
    'Graphs',
    'DP',
    'Sorting',
    'Searching',
    'JavaScript',
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (selectedTopic !== 'All') queryParams.append('topic', selectedTopic);
        if (selectedDifficulty !== 'All') queryParams.append('difficulty', selectedDifficulty);

        const data = await api.get(`/problems?${queryParams.toString()}`);
        if (data.success && data.problems) {
          setProblems(data.problems);
        }
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProblems, 200);
    return () => clearTimeout(timer);
  }, [search, selectedTopic, selectedDifficulty]);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
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
            <Terminal size={22} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Curated Problem Repository
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Master core data structures, algorithms, and JavaScript patterns with sandboxed test execution.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card-glass"
        style={{
          padding: '1.25rem',
          borderRadius: '0.75rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '260px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input-arena"
            placeholder="Search problems by title, keywords or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Difficulty Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Difficulty:</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`btn btn-sm ${selectedDifficulty === diff ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Horizontal Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: `1px solid ${selectedTopic === t ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
              backgroundColor: selectedTopic === t ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary)',
              color: selectedTopic === t ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Problem Listing Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="skeleton" style={{ height: '70px', width: '100%', borderRadius: '0.5rem' }} />
          ))}
        </div>
      ) : problems.length === 0 ? (
        <div
          className="card-glass"
          style={{
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <Terminal size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No problems found
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            Try adjusting your search terms or clearing selected topic and difficulty filters.
          </p>
        </div>
      ) : (
        <div
          className="card-glass"
          style={{
            overflow: 'hidden',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              padding: '0.85rem 1.25rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}
          >
            <div>Problem Title</div>
            <div>Topic</div>
            <div>Difficulty</div>
            <div>Constraints</div>
            <div style={{ textAlign: 'right' }}>Action</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {problems.map((problem, idx) => (
              <div
                key={problem._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: idx !== problems.length - 1 ? '1px solid var(--border-primary)' : 'none',
                  backgroundColor: 'var(--bg-secondary)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
              >
                <div>
                  <Link
                    to={`/arena/${problem._id}`}
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>{problem.title}</span>
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Acceptance: {problem.acceptanceRate}% • {problem.submissionsCount} Submissions
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    {problem.topic}
                  </span>
                </div>

                <div>
                  <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> {problem.timeLimit} ms
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Cpu size={12} /> {problem.memoryLimit} MB
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <Link
                    to={`/arena/${problem._id}`}
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>Solve</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
