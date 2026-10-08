import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  FileCode2,
  Compass,
  Bot,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  Award,
  Users,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section
        style={{
          padding: '5rem 1.5rem 4rem',
          textAlign: 'center',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.1rem',
            borderRadius: '9999px',
            backgroundColor: '#fff0f3',
            border: '1px solid #fed7e2',
            color: '#f43f5e',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '1.75rem',
          }}
        >
          <Sparkles size={15} />
          <span>MODERN DEVELOPER ASSESSMENT & INTERVIEW PLATFORM</span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
            fontWeight: 900,
            letterSpacing: '-0.035em',
            lineHeight: 1.12,
            color: 'var(--text-primary)',
            marginBottom: '1.25rem',
          }}
        >
          Where Engineers Prove <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitFillColor: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Real-World Coding Skills
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 2.25rem',
            lineHeight: 1.6,
          }}
        >
          Solve algorithm problems across 5 programming languages, conquer production engineering missions, take proctored candidate assessments, and practice AI vocal mock interviews.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '3.5rem',
          }}
        >
          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.85rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)',
              transition: 'transform 0.15s ease',
            }}
          >
            Get Started Free <ArrowRight size={17} />
          </Link>
          <Link
            to="/problems"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.85rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Explore Coding Arena
          </Link>
        </div>

        {/* Showcase Platform Card */}
        <div
          style={{
            borderRadius: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            textAlign: 'left',
          }}
        >
          {/* Mock Browser Header */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: '#faf8f5',
              borderBottom: '1px solid #efe9e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f43f5e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                codearena.app/dashboard
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 600 }}>
              Live Platform
            </div>
          </div>

          {/* Quick Preview inside Showcase */}
          <div style={{ padding: '2rem 2.25rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ backgroundColor: '#fff0f3', border: '1px solid #fed7e2', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>Coding Practice</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>C, C++, Java, Python, JS</div>
              </div>
              <div style={{ backgroundColor: '#fef9ee', border: '1px solid #fef3c7', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>Assessments</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Proctored timed tests</div>
              </div>
              <div style={{ backgroundColor: '#eefbf5', border: '1px solid #d1fae5', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>Missions</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Production backend bugs</div>
              </div>
              <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>AI Interview</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Real-time voice feedback</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', backgroundColor: '#faf8f5', borderRadius: '12px', border: '1px solid #efe9e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ffe4e6', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                  R
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Welcome back, Ritika 👋</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>12 Day Streak • 320 XP • Level 4 Explorer</div>
                </div>
              </div>
              <Link to="/register" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f43f5e', textDecoration: 'none' }}>
                Try It Live &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4 CORE FEATURES (Pastel Cards Matching Reference) */}
      {/* ------------------------------------------------------------- */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Everything You Need to Succeed
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            A complete suite for both candidates preparing for jobs and instructors assessing talent.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {/* 1 */}
          <div
            style={{
              backgroundColor: '#fff0f3',
              border: '1px solid #fed7e2',
              borderRadius: '20px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  color: '#f43f5e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Code2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                Algorithmic Coding Arena
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Practice problems in C, C++, Java, Python, and JavaScript with instantaneous compilation and full test suites.
              </p>
            </div>
            <Link to="/problems" style={{ marginTop: '1.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#f43f5e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Practice Problems <ArrowRight size={13} />
            </Link>
          </div>

          {/* 2 */}
          <div
            style={{
              backgroundColor: '#fef9ee',
              border: '1px solid #fef3c7',
              borderRadius: '20px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <FileCode2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                Proctored Assessments
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Simulate real company hiring rounds with timed questions, anti-cheat detection, and comprehensive scorecards.
              </p>
            </div>
            <Link to="/assessments" style={{ marginTop: '1.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#d97706', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Browse Assessments <ArrowRight size={13} />
            </Link>
          </div>

          {/* 3 */}
          <div
            style={{
              backgroundColor: '#eefbf5',
              border: '1px solid #d1fae5',
              borderRadius: '20px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Compass size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                Engineering Missions
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Tackle production bugs, system bottlenecks, and backend incidents inside real interactive environments.
              </p>
            </div>
            <Link to="/missions" style={{ marginTop: '1.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#059669', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Explore Missions <ArrowRight size={13} />
            </Link>
          </div>

          {/* 4 */}
          <div
            style={{
              backgroundColor: '#f5f3ff',
              border: '1px solid #ede9fe',
              borderRadius: '20px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Bot size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                AI Voice Interview Simulator
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Speak directly with an AI technical interviewer that asks adaptive follow-ups and rates communication clarity.
              </p>
            </div>
            <Link to="/interview/simulator" style={{ marginTop: '1.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#7c3aed', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Start Interview <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CALL TO ACTION */}
      {/* ------------------------------------------------------------- */}
      <section style={{ padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '3rem 2rem',
            borderRadius: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
            Ready to Accelerate Your Career?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Join thousands of developers practicing real-world code assessments today.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)',
              }}
            >
              Create Free Account &rarr;
            </Link>
            <Link
              to="/login"
              style={{
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
