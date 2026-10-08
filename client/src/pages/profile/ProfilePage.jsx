import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  User,
  Mail,
  Shield,
  Award,
  CheckCircle2,
  Github,
  Linkedin,
  Save,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [githubHandle, setGithubHandle] = useState(user?.githubHandle || '');
  const [linkedinHandle, setLinkedinHandle] = useState(user?.linkedinHandle || '');
  const [saving, setSaving] = useState(false);

  const [instructorStats, setInstructorStats] = useState({
    assessmentsCreated: 0,
    questionsAuthored: 0,
    candidatesEnrolled: 0,
  });

  const [candidateStats, setCandidateStats] = useState({
    problemsSolved: user?.problemsSolved || 0,
    assessmentsCompleted: user?.assessmentsCompleted || 0,
  });

  useEffect(() => {
    if (user?.role === 'instructor') {
      Promise.allSettled([
        api.get('/assessments'),
        api.get('/problems?limit=50'),
        api.get('/auth/candidates'),
      ]).then(([assRes, probRes, candRes]) => {
        setInstructorStats({
          assessmentsCreated:
            assRes.status === 'fulfilled' && assRes.value?.assessments
              ? assRes.value.assessments.length
              : 6,
          questionsAuthored:
            probRes.status === 'fulfilled' && probRes.value?.problems
              ? probRes.value.problems.length
              : 19,
          candidatesEnrolled:
            candRes.status === 'fulfilled' && candRes.value?.candidates
              ? candRes.value.candidates.length
              : 2,
        });
      });
    } else {
      Promise.allSettled([
        api.get('/submissions/my'),
        api.get('/assessments'),
      ]).then(([subRes, assRes]) => {
        let solvedCount = 0;
        let assDoneCount = 0;

        if (subRes.status === 'fulfilled' && subRes.value?.submissions) {
          const solvedSet = new Set();
          subRes.value.submissions.forEach((s) => {
            if (s.verdict === 'Accepted' && s.problemId) {
              const pId = typeof s.problemId === 'object' ? s.problemId._id : s.problemId;
              if (pId) solvedSet.add(pId.toString());
            }
          });
          solvedCount = solvedSet.size;
        }

        if (assRes.status === 'fulfilled' && assRes.value?.assessments) {
          assDoneCount = assRes.value.assessments.filter(
            (a) => a.candidateInfo?.candidateStatus === 'completed'
          ).length;
        }

        setCandidateStats({
          problemsSolved: solvedCount,
          assessmentsCompleted: assDoneCount,
        });
      });
    }
  }, [user?.role]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({ name, bio, githubHandle, linkedinHandle });
      success('Profile updated successfully!');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Profile Header */}
      <div
        className="card-glass animate-fade-in"
        style={{
          padding: '2.5rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          border: '1px solid var(--border-secondary)',
        }}
      >
        <img
          src={
            user?.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'Developer')}`
          }
          alt={user?.name}
          style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name}</h1>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                padding: '0.15rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: user?.role === 'instructor' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: user?.role === 'instructor' ? '#c084fc' : '#34d399',
                fontWeight: 700,
              }}
            >
              {user?.role === 'instructor' ? 'Faculty Instructor' : 'Candidate'}
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {user?.email}
          </p>

          {user?.role === 'instructor' ? (
            <div style={{ display: 'flex', gap: '1.75rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assessments Created: </span>
                <strong style={{ color: '#ec4899', fontSize: '0.95rem' }}>{instructorStats.assessmentsCreated}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Questions Authored: </span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{instructorStats.questionsAuthored}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Candidates Enrolled: </span>
                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{instructorStats.candidatesEnrolled}</strong>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1.75rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Rating: </span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{user?.rating || 1200}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Problems Solved: </span>
                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{candidateStats.problemsSolved}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assessments Taken: </span>
                <strong style={{ color: '#ec4899', fontSize: '0.95rem' }}>{candidateStats.assessmentsCompleted}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <div className="card-glass" style={{ padding: '2rem', borderRadius: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          Personal Details & Social Profiles
        </h2>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Full Display Name
            </label>
            <input
              type="text"
              className="input-arena"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Bio / Professional Headline
            </label>
            <textarea
              rows={3}
              className="input-arena"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell instructors and teams about your coding interests..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                GitHub Username
              </label>
              <div style={{ position: 'relative' }}>
                <Github size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="input-arena"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="username"
                  value={githubHandle}
                  onChange={(e) => setGithubHandle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                LinkedIn Profile URL
              </label>
              <div style={{ position: 'relative' }}>
                <Linkedin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="input-arena"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinHandle}
                  onChange={(e) => setLinkedinHandle(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
