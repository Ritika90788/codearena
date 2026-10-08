import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileCode2,
  History,
  Bot,
  ArrowRight,
  Sparkles,
  BarChart3,
  Download,
} from 'lucide-react';

export const AssessmentResultPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Result metrics
  const results = {
    totalScore: 88,
    maxScore: 100,
    problemsPassed: 3,
    problemsFailed: 1,
    correctness: 92,
    efficiency: 87,
    codeQuality: 91,
    problemSolving: 86,
    aiFeedback:
      'Candidate demonstrated exemplary command of associative hash structures and logarithmic search partitions. Memory allocation remained strictly within optimal thresholds. Recommended for Advanced Algorithms Cohort.',
  };

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    const loadAssessment = async () => {
      try {
        const data = await api.get(`/assessments/${id}`);
        if (data.success && data.assessment) {
          setAssessment(data.assessment);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [id]);

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      {/* Celebration Header */}
      <div
        className="card-glass animate-fade-in"
        style={{
          padding: '3rem 2rem',
          borderRadius: '1rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid var(--border-secondary)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)',
            marginBottom: '1rem',
          }}
        >
          <Award size={32} />
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Assessment Complete!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          {assessment?.title || 'Data Structures & Algorithms Evaluation'}
        </p>

        {/* Score Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '3.75rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
            {results.totalScore}
          </span>
          <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            / {results.maxScore}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={16} /> {results.problemsPassed} Passed
          </span>
          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <XCircle size={16} /> {results.problemsFailed} Failed
          </span>
        </div>
      </div>

      {/* 4 Pillars Dimensions Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {[
          { label: 'Correctness', value: results.correctness, color: '#10b981' },
          { label: 'Efficiency', value: results.efficiency, color: '#3b82f6' },
          { label: 'Code Quality', value: results.codeQuality, color: '#06b6d4' },
          { label: 'Problem Solving', value: results.problemSolving, color: '#a855f7' },
        ].map((item) => (
          <div key={item.label} className="card-glass" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
              {item.label.toUpperCase()}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: item.color, marginBottom: '0.5rem' }}>
              {item.value}%
            </div>
            <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
              <div style={{ width: `${item.value}%`, height: '100%', backgroundColor: item.color, borderRadius: '999px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* AI Qualitative Feedback Card */}
      <div
        className="card-glass"
        style={{
          padding: '1.75rem',
          borderRadius: '0.75rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Bot size={20} color="#a855f7" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Gemini AI Evaluator Observations</h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {results.aiFeedback}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/candidate/replay" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          <History size={16} />
          <span>View Code Replay</span>
        </Link>
        <Link to="/candidate/submissions" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          <FileCode2 size={16} />
          <span>View All Submissions</span>
        </Link>
        <Link to="/assessments" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <span>Explore Next Assessment</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
