import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Briefcase,
  Search,
  Filter,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  DollarSign,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

const DOMAIN_CONFIG = {
  All: { label: 'All Industries', icon: '🌐', color: '#60a5fa' },
  FinTech: { label: 'FinTech', icon: '💳', color: '#10b981' },
  'E-commerce': { label: 'E-commerce', icon: '🛍️', color: '#f59e0b' },
  'Food Delivery': { label: 'Food Delivery', icon: '🍔', color: '#ef4444' },
  'Social Media': { label: 'Social Media', icon: '📱', color: '#a855f7' },
  Logistics: { label: 'Logistics', icon: '🚚', color: '#38bdf8' },
  EdTech: { label: 'EdTech', icon: '🎓', color: '#14b8a6' },
};

export const MissionsListPage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMissions = async () => {
      setLoading(true);
      try {
        let query = `/missions?`;
        if (selectedDomain !== 'All') query += `domain=${encodeURIComponent(selectedDomain)}&`;
        if (selectedDifficulty !== 'All') query += `difficulty=${encodeURIComponent(selectedDifficulty)}&`;
        if (searchTerm) query += `search=${encodeURIComponent(searchTerm)}&`;

        const res = await api.get(query);
        if (res.success && res.missions) {
          setMissions(res.missions);
        }
      } catch (err) {
        console.error('Error fetching missions:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchMissions, 200);
    return () => clearTimeout(debounce);
  }, [selectedDomain, selectedDifficulty, searchTerm]);

  return (
    <div style={{ maxWidth: '1240px', margin: '2rem auto', padding: '0 1.5rem', paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              padding: '0.4rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--accent-primary)',
            }}
          >
            <Briefcase size={22} />
          </div>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--accent-primary)',
            }}
          >
            Real-World Mission Mode
          </span>
        </div>

        <h1 style={{ fontSize: '2.3rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          Solve Real Company Engineering Challenges
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '780px', lineHeight: 1.6 }}>
          No abstract toy puzzles. Tackle authentic architectural dilemmas from high-growth FinTech, E-commerce, Food Delivery, and Logistics systems. Understand <strong>WHY</strong> you write code, not just <strong>WHAT</strong> code to write.
        </p>
      </div>

      {/* Domain Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        {Object.entries(DOMAIN_CONFIG).map(([key, cfg]) => {
          const isActive = selectedDomain === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedDomain(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '9999px',
                backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div
        className="card-glass"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '0.85rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="input-arena"
            placeholder="Search company scenarios, systems, or technical requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Difficulty Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Difficulty:</span>
          <select
            className="input-arena"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="All">All Difficulties</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Staff Engineer">Staff Engineer</option>
          </select>
        </div>
      </div>

      {/* Missions Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Sparkles size={32} className="animate-spin" color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading company engineering missions...</p>
        </div>
      ) : missions.length === 0 ? (
        <div
          className="card-glass"
          style={{
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '1rem',
            color: 'var(--text-muted)',
          }}
        >
          <Building2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Missions Found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Try adjusting your search terms or clearing selected industry filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {missions.map((mission) => {
            const domainCfg = DOMAIN_CONFIG[mission.domain] || DOMAIN_CONFIG.All;
            return (
              <div
                key={mission._id}
                className="card-glass animate-fade-in"
                style={{
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  {/* Top Bar: Company Badge & Difficulty */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{domainCfg.icon}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: domainCfg.color }}>
                        {mission.companyName}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {mission.domain}</span>
                    </div>

                    <span
                      className={`badge ${
                        mission.difficulty === 'Hard'
                          ? 'badge-danger'
                          : mission.difficulty === 'Medium'
                          ? 'badge-warning'
                          : 'badge-info'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {mission.difficulty}
                    </span>
                  </div>

                  {/* Mission Title */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.6rem', lineHeight: 1.4 }}>
                    {mission.title}
                  </h3>

                  {/* Business Problem Snippet */}
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.5rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '1rem',
                    }}
                  >
                    <strong style={{ color: '#ef4444' }}>Business Impact:</strong> {mission.businessProblem}
                  </div>

                  {/* Technical Requirements Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                    {mission.technicalRequirements?.slice(0, 3).map((req, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)',
                        }}
                      >
                        {req.length > 45 ? req.substring(0, 45) + '...' : req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Meta & Launch Button */}
                <div>
                  <div
                    style={{
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      <span>~{mission.estimatedMinutes} mins</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShieldCheck size={13} color="#10b981" />
                      <span>{mission.completionsCount || 0} production clears</span>
                    </div>
                  </div>

                  <Link
                    to={`/missions/${mission._id}`}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Launch Mission Workspace</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default MissionsListPage;
