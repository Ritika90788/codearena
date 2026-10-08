import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Code2,
  FileCode2,
  Compass,
  Bot,
  ArrowRight,
  Flame,
  Star,
  TrendingUp,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Terminal,
  Activity,
  Award,
  BookOpen,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // Real statistics based on actual candidate data
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalAvailable: 20,
    easySolved: 0,
    easyTotal: 10,
    mediumSolved: 0,
    mediumTotal: 8,
    hardSolved: 0,
    hardTotal: 2,
    streak: 0,
    totalXp: 0,
    level: 1,
    levelName: 'Beginner',
    weeklyCurrent: 0,
    weeklyTarget: 5,
  });

  const [solvedProblemsList, setSolvedProblemsList] = useState([]);
  const [assessmentsList, setAssessmentsList] = useState([]);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Developer';
  const initial = displayName[0].toUpperCase();

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setLoading(true);
        const [assRes, probRes, subRes] = await Promise.allSettled([
          api.get('/assessments'),
          api.get('/problems?limit=100'),
          api.get('/submissions/my').catch(() => ({ submissions: [] })),
        ]);

        let easyS = 0;
        let medS = 0;
        let hardS = 0;
        const solvedMap = new Map();
        let weeklyS = 0;

        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        if (subRes.status === 'fulfilled' && subRes.value?.submissions) {
          const subs = subRes.value.submissions;
          subs.forEach((s) => {
            if (s.verdict === 'Accepted' && s.problemId) {
              const pObj = typeof s.problemId === 'object' ? s.problemId : null;
              const pId = pObj?._id || s.problemId;
              const pIdStr = pId?.toString();

              if (pIdStr && !solvedMap.has(pIdStr)) {
                const diff = pObj?.difficulty || 'Medium';
                if (diff === 'Easy') easyS++;
                else if (diff === 'Hard') hardS++;
                else medS++;

                solvedMap.set(pIdStr, {
                  id: pIdStr,
                  title: pObj?.title || 'Algorithmic Problem',
                  difficulty: diff,
                  topic: pObj?.topic || 'Algorithms',
                  language: s.language || 'javascript',
                  solvedAt: s.createdAt,
                });

                if (new Date(s.createdAt) >= startOfWeek) {
                  weeklyS++;
                }
              }
            }
          });
        }

        let totalAvail = 20;
        let easyTot = 10;
        let medTot = 8;
        let hardTot = 2;

        if (probRes.status === 'fulfilled' && probRes.value?.problems) {
          const probs = probRes.value.problems;
          totalAvail = probs.length || 20;
          easyTot = probs.filter((p) => p.difficulty === 'Easy').length || 10;
          medTot = probs.filter((p) => p.difficulty === 'Medium').length || 8;
          hardTot = probs.filter((p) => p.difficulty === 'Hard').length || 2;
        }

        const totalSolvedCount = solvedMap.size;
        setSolvedProblemsList(Array.from(solvedMap.values()));

        const realStreak = totalSolvedCount === 0 ? 0 : Math.max(1, user?.streak || 1);
        const realXp = (totalSolvedCount * 50) + ((user?.assessmentsCompleted || 0) * 100);
        const realLevel = Math.max(1, Math.floor(totalSolvedCount / 3) + 1);
        const realLevelName =
          totalSolvedCount >= 15
            ? 'Master'
            : totalSolvedCount >= 10
            ? 'Expert'
            : totalSolvedCount >= 5
            ? 'Explorer'
            : totalSolvedCount >= 1
            ? 'Apprentice'
            : 'Beginner';

        setStats({
          totalSolved: totalSolvedCount,
          totalAvailable: totalAvail,
          easySolved: easyS,
          easyTotal: easyTot,
          mediumSolved: medS,
          mediumTotal: medTot,
          hardSolved: hardS,
          hardTotal: hardTot,
          streak: realStreak,
          totalXp: realXp,
          level: realLevel,
          levelName: realLevelName,
          weeklyCurrent: weeklyS,
          weeklyTarget: 5,
        });

        if (assRes.status === 'fulfilled' && assRes.value?.assessments && assRes.value.assessments.length > 0) {
          const formatted = assRes.value.assessments.slice(0, 3).map((a, idx) => {
            const isCompleted = a.candidateInfo?.candidateStatus === 'completed';
            const isInProgress = a.candidateInfo?.candidateStatus === 'in_progress';
            return {
              id: a._id,
              title: a.title,
              duration: a.duration || 90,
              questionCount: a.problems?.length || 3,
              difficulty: a.difficulty || 'Medium',
              status: isCompleted ? 'Completed' : (isInProgress ? 'In Progress' : 'Not Started'),
            };
          });
          setAssessmentsList(formatted);
        } else {
          // Fallback matching mockup
          setAssessmentsList([
            {
              id: 'mock-1',
              title: 'mock',
              duration: 90,
              questionCount: 3,
              difficulty: 'Medium',
              status: 'In Progress',
            },
            {
              id: 'mock-2',
              title: 'Full-Stack JavaScript & Problem Solving Round',
              duration: 90,
              questionCount: 4,
              difficulty: 'Medium',
              status: 'Not Started',
            },
            {
              id: 'mock-3',
              title: 'Core Data Structures: Stacks, Queues & Trees',
              duration: 60,
              questionCount: 3,
              difficulty: 'Easy',
              status: 'Not Started',
            },
          ]);
        }
      } catch (err) {
        console.warn('Dashboard data fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, []);

  const practiceLanguages = ['C', 'C++', 'Java', 'Python', 'JavaScript'];

  return (
    <div
      style={{
        padding: '1.75rem 2.25rem 3.5rem',
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP ROW: Hero Banner + User Stats Card */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 330px',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
      >
        {/* Hero Welcome Banner */}
        <div
          style={{
            backgroundColor: '#fefcf7',
            border: '1px solid #f2ebe0',
            borderRadius: '20px',
            padding: '2rem 2.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '480px', zIndex: 2 }}>
            <div
              style={{
                fontSize: '0.9rem',
                color: '#64748b',
                fontWeight: 500,
                marginBottom: '0.25rem',
              }}
            >
              Good morning,
            </div>
            <h1
              style={{
                fontSize: '2.1rem',
                fontWeight: 800,
                color: '#1e293b',
                letterSpacing: '-0.025em',
                marginBottom: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Welcome back, {displayName} <span style={{ fontSize: '1.8rem' }}>👋</span>
            </h1>
            <p
              style={{
                fontSize: '0.92rem',
                color: '#64748b',
                lineHeight: 1.5,
                marginBottom: '1.35rem',
              }}
            >
              Keep building, keep improving. Consistent practice today leads to bigger opportunities tomorrow.
            </p>
            <Link
              to="/problems"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '0.65rem 1.35rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.88rem',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
                transition: 'all 0.15s ease',
              }}
            >
              Continue Practice <ArrowRight size={15} />
            </Link>
          </div>

          {/* Hand-crafted Illustrated Developer with Laptop & Doodles */}
          <div
            style={{
              position: 'relative',
              width: '280px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 300 200" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Doodle: Small Steps Big Progress */}
              <text x="215" y="45" fill="#475569" fontSize="13" fontFamily="cursive, sans-serif" fontWeight="700" textAnchor="middle">
                Small
              </text>
              <text x="215" y="62" fill="#475569" fontSize="13" fontFamily="cursive, sans-serif" fontWeight="700" textAnchor="middle">
                Steps
              </text>
              <text x="220" y="80" fill="#475569" fontSize="13" fontFamily="cursive, sans-serif" fontWeight="700" textAnchor="middle">
                Big Progress
              </text>
              {/* Curly arrow pointing to girl */}
              <path
                d="M 225 90 C 235 110, 220 135, 195 125"
                stroke="#8b5cf6"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M 195 125 L 202 120 M 195 125 L 202 130" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />

              {/* Developer character sitting */}
              {/* Body / Yellow sweater */}
              <path d="M 145 140 C 145 115, 185 115, 185 140 L 195 180 L 135 180 Z" fill="#fbbf24" />
              {/* Arm extending */}
              <path d="M 175 135 Q 160 155 140 160" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M 155 135 Q 145 155 130 160" stroke="#fbbf24" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Head & Face */}
              <circle cx="165" cy="95" r="18" fill="#fed7aa" />
              {/* Hair */}
              <path d="M 148 95 C 148 70, 182 70, 182 95 C 182 105, 175 112, 175 112 L 185 130 C 180 135, 160 130, 155 120 Z" fill="#0f172a" />
              {/* Hair bun */}
              <circle cx="178" cy="80" r="10" fill="#0f172a" />
              {/* Ear */}
              <circle cx="152" cy="98" r="3.5" fill="#fed7aa" />
              {/* Smile & Eye */}
              <circle cx="158" cy="95" r="2" fill="#0f172a" />
              <path d="M 156 102 Q 160 106 164 102" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* Laptop Screen (Purple/Slate with Pink sticker) */}
              <rect x="95" y="125" width="62" height="42" rx="4" transform="rotate(-12 95 125)" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Laptop Sticker */}
              <circle cx="120" cy="142" r="7" fill="#f43f5e" />
              <path d="M 120 138 L 118 143 L 122 143 L 120 147" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              {/* Laptop keyboard base */}
              <path d="M 85 158 L 148 146 L 155 152 L 90 164 Z" fill="#94a3b8" />

              {/* Little sparkles & plant doodles */}
              <path d="M 85 175 L 85 155 M 78 165 Q 85 160 92 165 M 80 172 Q 85 168 90 172" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              <circle cx="115" cy="65" r="2" fill="#f59e0b" />
              <circle cx="260" cy="140" r="2" fill="#ec4899" />
              <path d="M 255 110 L 260 110 M 257.5 107.5 L 257.5 112.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* User Profile & Stats Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #efe9e1',
            borderRadius: '20px',
            padding: '1.35rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#ffe4e6',
                  color: '#f43f5e',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {initial}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                  Student
                </div>
              </div>
            </div>
            <Link
              to="/profile"
              title="Edit Profile"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #efe9e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                textDecoration: 'none',
              }}
            >
              <Edit3 size={15} />
            </Link>
          </div>

          {/* 3 Metric Pills in Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              margin: '1.1rem 0',
              padding: '0.75rem 0.5rem',
              backgroundColor: '#faf8f5',
              borderRadius: '12px',
              border: '1px solid #f1ece5',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.85rem' }}>🔥</span>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>
                  {stats.streak}
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.15rem' }}>
                Day Streak
              </div>
            </div>

            <div style={{ borderLeft: '1px solid #e5ded4', borderRight: '1px solid #e5ded4' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.85rem' }}>⭐</span>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>
                  {stats.totalXp}
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.15rem' }}>
                Total XP
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.85rem' }}>📊</span>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>
                  Level {stats.level}
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.15rem' }}>
                {stats.levelName || 'Beginner'}
              </div>
            </div>
          </div>

          {/* Weekly Goal Progress */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
                <Clock size={14} color="#64748b" /> Weekly Goal
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>
                {stats.weeklyCurrent}/{stats.weeklyTarget}
              </div>
            </div>

            <div
              style={{
                width: '100%',
                height: '7px',
                borderRadius: '9999px',
                backgroundColor: '#f1ede6',
                overflow: 'hidden',
                marginBottom: '0.6rem',
              }}
            >
              <div
                style={{
                  width: `${stats.weeklyTarget > 0 ? Math.min(100, (stats.weeklyCurrent / stats.weeklyTarget) * 100) : 0}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  backgroundColor: '#f43f5e',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <Link
              to="/problems"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#f43f5e',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>{stats.weeklyCurrent >= stats.weeklyTarget ? '🎉 Weekly goal achieved!' : `Solve ${stats.weeklyTarget - stats.weeklyCurrent} problems this week`}</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* QUICK ACCESS (Row of 4 Pastel Cards) */}
      {/* ------------------------------------------------------------- */}
      <div>
        <h2
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: '0.85rem',
            letterSpacing: '-0.01em',
          }}
        >
          Quick Access
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.25rem',
          }}
        >
          {/* 1. Coding Practice (Pink) */}
          <Link
            to="/problems"
            style={{
              textDecoration: 'none',
              backgroundColor: '#fff0f3',
              border: '1px solid #fed7e2',
              borderRadius: '16px',
              padding: '1.35rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '140px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(244, 63, 94, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f43f5e',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                    }}
                  >
                    &lt;/&gt;
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                    Coding Practice
                  </span>
                </div>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid #fed7e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                  }}
                >
                  <ArrowRight size={12} />
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                Solve problems in C, C++, Java, Python & JavaScript.
              </p>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f43f5e', marginTop: '0.85rem' }}>
              1.2K+ problems
            </div>
          </Link>

          {/* 2. Assessments (Yellow) */}
          <Link
            to="/assessments"
            style={{
              textDecoration: 'none',
              backgroundColor: '#fef9ee',
              border: '1px solid #fef3c7',
              borderRadius: '16px',
              padding: '1.35rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '140px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d97706',
                    }}
                  >
                    <FileCode2 size={17} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                    Assessments
                  </span>
                </div>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid #fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                  }}
                >
                  <ArrowRight size={12} />
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                Take proctored tests and mock assessments.
              </p>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#d97706', marginTop: '0.85rem' }}>
              50+ assessments
            </div>
          </Link>

          {/* 3. Engineering Missions (Mint) */}
          <Link
            to="/missions"
            style={{
              textDecoration: 'none',
              backgroundColor: '#eefbf5',
              border: '1px solid #d1fae5',
              borderRadius: '16px',
              padding: '1.35rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '140px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#059669',
                    }}
                  >
                    <Compass size={17} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                    Engineering Missions
                  </span>
                </div>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid #d1fae5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                  }}
                >
                  <ArrowRight size={12} />
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                Hands-on debugging & real-world backend tasks.
              </p>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669', marginTop: '0.85rem' }}>
              20+ missions
            </div>
          </Link>

          {/* 4. AI Technical Interview (Lavender) */}
          <Link
            to="/interview/simulator"
            style={{
              textDecoration: 'none',
              backgroundColor: '#f5f3ff',
              border: '1px solid #ede9fe',
              borderRadius: '16px',
              padding: '1.35rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '140px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(139, 92, 246, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3aed',
                    }}
                  >
                    <Bot size={17} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                    AI Technical Interview
                  </span>
                </div>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid #ede9fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                  }}
                >
                  <ArrowRight size={12} />
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                Practice with AI voice interviews.
              </p>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#7c3aed', marginTop: '0.85rem' }}>
              Real-time feedback
            </div>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FEATURED PRACTICE & INTERVIEW PREP (Clean, Balanced & Modern) */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
          gap: '1.25rem',
        }}
      >
        {/* CARD 1: Featured Daily Challenge */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #efe9e1',
            borderRadius: '20px',
            padding: '1.65rem 1.75rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Top row badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    backgroundColor: '#fff0f3',
                    border: '1px solid #fed7e2',
                    color: '#f43f5e',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                  }}
                >
                  <Flame size={13} />
                  <span>Problem of the Day</span>
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: '#94a3b8',
                    fontWeight: 500,
                  }}
                >
                  Refreshes daily
                </span>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#d97706',
                  backgroundColor: '#fef9ee',
                  border: '1px solid #fef3c7',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                }}
              >
                <Star size={12} fill="#d97706" />
                <span>+50 XP</span>
              </span>
            </div>

            {/* Problem Title & Meta */}
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#1e293b',
                marginBottom: '0.45rem',
                letterSpacing: '-0.01em',
              }}
            >
              Two Sum — Array Target Search
            </h3>

            <p
              style={{
                fontSize: '0.84rem',
                color: '#64748b',
                lineHeight: 1.55,
                marginBottom: '1.1rem',
              }}
            >
              Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>. Assume exactly one solution exists.
            </p>

            {/* Tags Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '1.25rem',
              }}
            >
              <span
                style={{
                  padding: '0.18rem 0.55rem',
                  borderRadius: '6px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#059669',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                Easy
              </span>
              <span
                style={{
                  padding: '0.18rem 0.55rem',
                  borderRadius: '6px',
                  backgroundColor: '#faf8f5',
                  border: '1px solid #efe9e1',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                Arrays & Hashing
              </span>
              <span
                style={{
                  padding: '0.18rem 0.55rem',
                  borderRadius: '6px',
                  backgroundColor: '#faf8f5',
                  border: '1px solid #efe9e1',
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                }}
              >
                15 min estimated
              </span>
              <span
                style={{
                  padding: '0.18rem 0.55rem',
                  borderRadius: '6px',
                  backgroundColor: '#faf8f5',
                  border: '1px solid #efe9e1',
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                }}
              >
                89% Pass Rate
              </span>
            </div>
          </div>

          {/* Action Row & Pro Tip */}
          <div>
            <div
              style={{
                padding: '0.75rem 0.95rem',
                borderRadius: '12px',
                backgroundColor: '#faf8f5',
                border: '1px solid #f1ece5',
                fontSize: '0.78rem',
                color: '#64748b',
                lineHeight: 1.45,
                marginBottom: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1rem' }}>💡</span>
              <span>
                <strong>Optimization Tip:</strong> Use a Hash Map to store complements and achieve <strong>O(n)</strong> linear time complexity.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/arena/6ac677eaaf3ba9ed8bf22588"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '10px',
                  backgroundColor: '#f43f5e',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(244, 63, 94, 0.25)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span>Solve Daily Challenge</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/problems"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #e2ded5',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Browse All Problems
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 2: AI Mock Interview Simulator */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #efe9e1',
            borderRadius: '20px',
            padding: '1.65rem 1.75rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#ede9fe',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={22} />
              </div>

              <span
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  color: '#7c3aed',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                AI Powered
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.35rem' }}>
              Technical Interview Simulator
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Simulate realistic whiteboard interviews with adaptive technical questions and instant diagnostic feedback.
            </p>

            {/* Feature Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#334155' }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span>Live coding evaluation & algorithmic hints</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#334155' }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span>Audio voice transcription & behavioral questions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#334155' }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span>Time complexity analysis and interview scorecard</span>
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                padding: '0.75rem 0.85rem',
                borderRadius: '12px',
                backgroundColor: '#faf8f5',
                border: '1px solid #f1ece5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>NEXT BENCHMARK</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                  Full-Stack & Algorithms Round
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#7c3aed',
                  backgroundColor: '#f5f3ff',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                }}
              >
                45 Mins
              </span>
            </div>

            <Link
              to="/interview/simulator"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                boxSizing: 'border-box',
                transition: 'transform 0.15s ease',
              }}
            >
              <span>Launch Mock Interview</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM SECTION: Recommended for You (Row of 4 Cards) */}
      {/* ------------------------------------------------------------- */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.15rem' }}>
              Recommended for You{' '}
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>
                Based on your activity and goals.
              </span>
            </h2>
          </div>
          <Link
            to="/problems"
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#f43f5e',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.25rem',
          }}
        >
          {/* Card 1: Arrays & Hashing (Pink) */}
          <Link
            to="/problems?topic=Array"
            style={{
              textDecoration: 'none',
              backgroundColor: '#fff0f3',
              border: '1px solid #fed7e2',
              borderRadius: '16px',
              padding: '1.15rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  color: '#f43f5e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                  Arrays & Hashing
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Build fundamentals
                </div>
              </div>
            </div>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #fed7e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <ArrowRight size={13} />
            </div>
          </Link>

          {/* Card 2: System Design Basics (Yellow) */}
          <Link
            to="/problems?topic=SystemDesign"
            style={{
              textDecoration: 'none',
              backgroundColor: '#fef9ee',
              border: '1px solid #fef3c7',
              borderRadius: '16px',
              padding: '1.15rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sliders size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                  System Design Basics
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  For upcoming interviews
                </div>
              </div>
            </div>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <ArrowRight size={13} />
            </div>
          </Link>

          {/* Card 3: Backend Debugging (Purple) */}
          <Link
            to="/missions"
            style={{
              textDecoration: 'none',
              backgroundColor: '#f5f3ff',
              border: '1px solid #ede9fe',
              borderRadius: '16px',
              padding: '1.15rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Code2 size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                  Backend Debugging
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Real-world scenarios
                </div>
              </div>
            </div>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <ArrowRight size={13} />
            </div>
          </Link>

          {/* Card 4: Mock Interview (Mint) */}
          <Link
            to="/interview/simulator"
            style={{
              textDecoration: 'none',
              backgroundColor: '#eefbf5',
              border: '1px solid #d1fae5',
              borderRadius: '16px',
              padding: '1.15rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                  Mock Interview
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Improve confidence
                </div>
              </div>
            </div>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
