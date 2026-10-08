import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  ArrowRight,
  ExternalLink,
  Code2,
  Search,
  Filter,
  Sparkles,
  Layers,
  Copy,
  Check,
  X,
  Terminal,
  BookOpen,
} from 'lucide-react';

export const SubmissionsHistoryPage = () => {
  const { user, isInstructor } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [activeTab, setActiveTab] = useState('solved'); // 'solved' or 'all'
  const [selectedCodeSub, setSelectedCodeSub] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const endpoint = isInstructor ? '/submissions' : '/submissions/my';
        const data = await api.get(endpoint);
        if (data.success && data.submissions) {
          setSubmissions(data.submissions);
        }
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [isInstructor]);

  // Distinct solved problems (Accepted only, latest per problem)
  const distinctSolved = useMemo(() => {
    const map = new Map();
    submissions.forEach((s) => {
      if (s.verdict === 'Accepted' && s.problemId) {
        const pObj = typeof s.problemId === 'object' ? s.problemId : null;
        const pId = pObj?._id || s.problemId;
        const pIdStr = pId?.toString();
        if (pIdStr && !map.has(pIdStr)) {
          map.set(pIdStr, {
            ...s,
            problemObj: pObj,
            problemIdStr: pIdStr,
          });
        }
      }
    });
    return Array.from(map.values());
  }, [submissions]);

  // Statistics
  const stats = useMemo(() => {
    let easy = 0;
    let medium = 0;
    let hard = 0;

    distinctSolved.forEach((s) => {
      const diff = s.problemObj?.difficulty || 'Medium';
      if (diff === 'Easy') easy++;
      else if (diff === 'Hard') hard++;
      else medium++;
    });

    return {
      totalSolved: distinctSolved.length,
      easy,
      medium,
      hard,
      totalSubmissions: submissions.length,
    };
  }, [distinctSolved, submissions]);

  // Filtered dataset based on active tab and filters
  const displayedItems = useMemo(() => {
    const sourceList = activeTab === 'solved' ? distinctSolved : submissions;

    return sourceList.filter((item) => {
      const pObj = typeof item.problemId === 'object' ? item.problemId : item.problemObj || {};
      const title = pObj?.title || 'Algorithmic Challenge';
      const topic = pObj?.topic || '';
      const diff = pObj?.difficulty || 'Medium';
      const lang = item.language || '';

      // Search match
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.toLowerCase().includes(searchQuery.toLowerCase());

      // Difficulty match
      const matchesDiff =
        selectedDifficulty === 'All' || diff.toLowerCase() === selectedDifficulty.toLowerCase();

      // Language match
      const matchesLang =
        selectedLanguage === 'All' || lang.toLowerCase() === selectedLanguage.toLowerCase();

      return matchesSearch && matchesDiff && matchesLang;
    });
  }, [activeTab, distinctSolved, submissions, searchQuery, selectedDifficulty, selectedLanguage]);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem 3.5rem',
        color: '#1e293b',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
                {isInstructor ? 'Candidate Submissions' : 'Solved Problems'}
              </h1>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            {isInstructor
              ? 'Review candidate code submissions, test case coverage, and algorithmic accuracy.'
              : 'Review your solved coding problems, accepted implementations, and runtime performance benchmarks.'}
          </p>
        </div>

        <Link
          to="/problems"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: '#f43f5e',
            color: '#ffffff',
            fontSize: '0.86rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 3px 10px rgba(244, 63, 94, 0.25)',
            transition: 'transform 0.15s ease',
          }}
        >
          <span>Solve More Problems</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STATS OVERVIEW CARDS (Only for candidates or when viewing summary) */}
      {/* ------------------------------------------------------------- */}
      {!isInstructor && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* 1. Total Solved */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #efe9e1',
              borderRadius: '16px',
              padding: '1.25rem 1.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Solved
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
                {stats.totalSolved}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                Distinct challenges passed
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#faf8f5',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #efe9e1',
              }}
            >
              <Code2 size={20} />
            </div>
          </div>

          {/* 2. Easy Solved */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #efe9e1',
              borderRadius: '16px',
              padding: '1.25rem 1.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Easy
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                {stats.easy}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                Fundamentals & basics
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
          </div>

          {/* 3. Medium Solved */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #efe9e1',
              borderRadius: '16px',
              padding: '1.25rem 1.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Medium
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                {stats.medium}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                Algorithms & structures
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={20} />
            </div>
          </div>

          {/* 4. Hard Solved */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #efe9e1',
              borderRadius: '16px',
              padding: '1.25rem 1.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Hard
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>
                {stats.hard}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                Advanced complexity
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FILTER & TOOLBAR CARD */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #efe9e1',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Top line: Tabs and Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* View Mode Toggle Tabs */}
          {!isInstructor ? (
            <div
              style={{
                display: 'flex',
                backgroundColor: '#faf8f5',
                padding: '0.25rem',
                borderRadius: '10px',
                border: '1px solid #f1ece5',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('solved')}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'solved' ? '#ffffff' : 'transparent',
                  color: activeTab === 'solved' ? '#1e293b' : '#64748b',
                  fontWeight: activeTab === 'solved' ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'solved' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <CheckCircle2 size={14} color="#059669" />
                <span>Solved Problems ({distinctSolved.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'all' ? '#ffffff' : 'transparent',
                  color: activeTab === 'all' ? '#1e293b' : '#64748b',
                  fontWeight: activeTab === 'all' ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Clock size={14} color="#64748b" />
                <span>All Submission History ({submissions.length})</span>
              </button>
            </div>
          ) : (
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
              All Candidate Submissions ({submissions.length})
            </div>
          )}

          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '340px',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search by problem title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.85rem 0.5rem 2.35rem',
                borderRadius: '8px',
                border: '1px solid #e2ded5',
                backgroundColor: '#faf8f5',
                fontSize: '0.84rem',
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Bottom line: Difficulty Pills & Language Filter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #f8f6f0',
          }}
        >
          {/* Difficulty Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginRight: '0.2rem' }}>
              Difficulty:
            </span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
              const isSelected = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #f43f5e' : '1px solid #e5ded4',
                    backgroundColor: isSelected ? '#fff0f3' : '#faf8f5',
                    color: isSelected ? '#f43f5e' : '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {diff}
                </button>
              );
            })}
          </div>

          {/* Language Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #e5ded4',
                backgroundColor: '#faf8f5',
                color: '#1e293b',
                fontSize: '0.76rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN DATA TABLE OR EMPTY STATE */}
      {/* ------------------------------------------------------------- */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                height: '70px',
                borderRadius: '14px',
                backgroundColor: '#f8f6f0',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      ) : displayedItems.length === 0 ? (
        /* Empty State */
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #efe9e1',
            borderRadius: '20px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ffe4e6',
              color: '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Code2 size={30} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.45rem' }}>
            {searchQuery || selectedDifficulty !== 'All' || selectedLanguage !== 'All'
              ? 'No Matching Problems Found'
              : 'No Solved Problems Yet'}
          </h3>

          <p
            style={{
              fontSize: '0.86rem',
              color: '#64748b',
              maxWidth: '520px',
              margin: '0 auto 1.75rem',
              lineHeight: 1.55,
            }}
          >
            {searchQuery || selectedDifficulty !== 'All' || selectedLanguage !== 'All'
              ? 'Try adjusting your search filters or difficulty parameters to find what you are looking for.'
              : 'Begin solving challenges in the coding arena. Your passed submissions, execution speeds, and memory benchmarks will automatically be logged here.'}
          </p>

          {/* Starter Problems Quick Pick when completely fresh */}
          {!searchQuery && selectedDifficulty === 'All' && selectedLanguage === 'All' && (
            <div style={{ maxWidth: '720px', margin: '0 auto 2rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#94a3b8',
                  marginBottom: '1rem',
                }}
              >
                Recommended Starter Problems:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  textAlign: 'left',
                }}
              >
                {[
                  { id: '6ac677eaaf3ba9ed8bf22588', title: 'Two Sum', diff: 'Easy', topic: 'Arrays' },
                  { id: '6ac677eaaf3ba9ed8bf22591', title: 'Valid Palindrome', diff: 'Easy', topic: 'Strings' },
                  { id: '6ac677eaaf3ba9ed8bf2259a', title: 'Reverse Linked List', diff: 'Easy', topic: 'Linked Lists' },
                ].map((prob) => (
                  <Link
                    key={prob.id}
                    to={`/arena/${prob.id}`}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: '#faf8f5',
                      border: '1px solid #efe9e1',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.35rem' }}>
                        {prob.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.12rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                          }}
                        >
                          {prob.diff}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {prob.topic}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: '0.85rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#f43f5e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      Solve Now <ArrowRight size={12} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link
            to="/problems"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              backgroundColor: '#f43f5e',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 3px 10px rgba(244, 63, 94, 0.25)',
            }}
          >
            <span>Explore All Coding Challenges</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        /* Solved Problems / Submissions Table */
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #efe9e1',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#faf8f5',
                    borderBottom: '1px solid #efe9e1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '0.9rem 1.25rem' }}>Problem Title</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Difficulty</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Verdict</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Language</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Runtime / Memory</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((sub, idx) => {
                  const pObj = typeof sub.problemId === 'object' ? sub.problemId : sub.problemObj || {};
                  const probTitle = pObj?.title || 'Algorithmic Challenge';
                  const probDiff = pObj?.difficulty || 'Medium';
                  const probTopic = pObj?.topic || 'Algorithms';
                  const probId = pObj?._id || sub.problemId;

                  const isEasy = probDiff === 'Easy';
                  const isHard = probDiff === 'Hard';
                  const diffBg = isEasy ? '#ecfdf5' : isHard ? '#fef2f2' : '#fef3c7';
                  const diffColor = isEasy ? '#059669' : isHard ? '#dc2626' : '#d97706';

                  const isAccepted = sub.verdict === 'Accepted';
                  const isPending = sub.verdict === 'Pending';
                  const verdictBg = isAccepted ? '#ecfdf5' : isPending ? '#f1f5f9' : '#fef2f2';
                  const verdictColor = isAccepted ? '#059669' : isPending ? '#64748b' : '#dc2626';

                  const dateStr = sub.createdAt
                    ? new Date(sub.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recently';

                  return (
                    <tr
                      key={sub._id || idx}
                      style={{
                        borderBottom: idx !== displayedItems.length - 1 ? '1px solid #f1ece5' : 'none',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Problem Title & Topic */}
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div>
                          <Link
                            to={`/arena/${probId}`}
                            style={{
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              color: '#1e293b',
                              textDecoration: 'none',
                              display: 'inline-block',
                              marginBottom: '0.15rem',
                            }}
                          >
                            {probTitle}
                          </Link>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            {isInstructor && sub.candidateId && (
                              <span style={{ color: '#f43f5e', fontWeight: 600, marginRight: '0.4rem' }}>
                                Candidate: {sub.candidateId.name || sub.candidateId.email} •
                              </span>
                            )}
                            {probTopic}
                          </div>
                        </div>
                      </td>

                      {/* Difficulty Badge */}
                      <td style={{ padding: '1.1rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            backgroundColor: diffBg,
                            color: diffColor,
                          }}
                        >
                          {probDiff}
                        </span>
                      </td>

                      {/* Verdict Badge */}
                      <td style={{ padding: '1.1rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '0.22rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: verdictBg,
                            color: verdictColor,
                          }}
                        >
                          {isAccepted && <CheckCircle2 size={13} />}
                          {!isAccepted && !isPending && <XCircle size={13} />}
                          <span>{sub.verdict}</span>
                        </span>
                      </td>

                      {/* Language Badge */}
                      <td style={{ padding: '1.1rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.18rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 600,
                          }}
                        >
                          {sub.language?.toUpperCase() || 'JAVASCRIPT'}
                        </span>
                      </td>

                      {/* Runtime / Memory */}
                      <td style={{ padding: '1.1rem 1rem', fontSize: '0.78rem', color: '#64748b' }}>
                        <div>{sub.executionTime !== undefined ? `${sub.executionTime} ms` : '—'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {sub.memoryUsage ? `${sub.memoryUsage} MB` : ''}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '1.1rem 1rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                          {sub.code && (
                            <button
                              type="button"
                              onClick={() => setSelectedCodeSub(sub)}
                              style={{
                                padding: '0.35rem 0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #e2ded5',
                                backgroundColor: '#faf8f5',
                                color: '#475569',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              View Code
                            </button>
                          )}

                          {probId && (
                            <Link
                              to={`/arena/${probId}`}
                              style={{
                                padding: '0.35rem 0.85rem',
                                borderRadius: '8px',
                                backgroundColor: '#f43f5e',
                                color: '#ffffff',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                boxShadow: '0 1px 4px rgba(244, 63, 94, 0.2)',
                              }}
                            >
                              <span>{isAccepted ? 'Review' : 'Try Again'}</span>
                              <ArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CODE PREVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedCodeSub && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setSelectedCodeSub(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #efe9e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    {selectedCodeSub.problemId?.title || 'Submission Solution'}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: selectedCodeSub.verdict === 'Accepted' ? '#ecfdf5' : '#fef2f2',
                      color: selectedCodeSub.verdict === 'Accepted' ? '#059669' : '#dc2626',
                    }}
                  >
                    {selectedCodeSub.verdict}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Language: <strong>{selectedCodeSub.language}</strong> • Runtime: {selectedCodeSub.executionTime || 0} ms • Memory: {selectedCodeSub.memoryUsage || 0} MB
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleCopyCode(selectedCodeSub.code)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e2ded5',
                    backgroundColor: '#faf8f5',
                    color: '#475569',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedCode ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCodeSub(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid #efe9e1',
                    backgroundColor: '#faf8f5',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#0f172a',
                padding: '1.25rem 1.5rem',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {selectedCodeSub.code || '// No code stored with this submission'}
              </pre>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #efe9e1',
                backgroundColor: '#faf8f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Passed {selectedCodeSub.testsPassed || 0}/{selectedCodeSub.totalTests || 0} Test Cases
              </div>

              {selectedCodeSub.problemId?._id && (
                <Link
                  to={`/arena/${selectedCodeSub.problemId._id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#f43f5e',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(244, 63, 94, 0.25)',
                  }}
                >
                  <span>Open in Coding Arena</span>
                  <ExternalLink size={13} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsHistoryPage;
