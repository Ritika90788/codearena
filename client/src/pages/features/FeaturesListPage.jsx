import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Layers,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Sparkles,
  Zap,
  Box,
  Server,
  ShoppingCart,
  Database,
} from 'lucide-react';

const CATEGORY_META = {
  All: { label: 'All Features', icon: '📦', color: '#60a5fa' },
  'Microservices & APIs': { label: 'Microservices & APIs', icon: '🔌', color: '#10b981' },
  'System Infrastructure': { label: 'System Infrastructure', icon: '⚙️', color: '#f59e0b' },
  'E-commerce & Payments': { label: 'E-commerce & Payments', icon: '🛒', color: '#ec4899' },
  'Data & Caching': { label: 'Data & Caching', icon: '💾', color: '#a855f7' },
};

export const FeaturesListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        let query = `/features?`;
        if (selectedCategory !== 'All') query += `category=${encodeURIComponent(selectedCategory)}&`;
        if (selectedDifficulty !== 'All') query += `difficulty=${encodeURIComponent(selectedDifficulty)}&`;
        if (searchTerm) query += `search=${encodeURIComponent(searchTerm)}&`;

        const res = await api.get(query);
        if (res.success && res.projects) {
          setProjects(res.projects);
        }
      } catch (err) {
        console.error('Error fetching feature projects:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProjects, 200);
    return () => clearTimeout(debounce);
  }, [selectedCategory, selectedDifficulty, searchTerm]);

  return (
    <div style={{ maxWidth: '1240px', margin: '2rem auto', padding: '0 1.5rem', paddingBottom: '5rem' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              padding: '0.4rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
            }}
          >
            <Box size={22} />
          </div>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#10b981',
            }}
          >
            Build a Feature Mode
          </span>
        </div>

        <h1 style={{ fontSize: '2.3rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          Build Practical Engineering Features
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '780px', lineHeight: 1.6 }}>
          Move beyond single-algorithm puzzles. Design, implement, and harden real-world microservice features — from URL Shorteners and Sliding Window Rate Limiters to E-commerce Cart Engines. Evaluated across API semantics, error boundaries, and code quality.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        {Object.entries(CATEGORY_META).map(([key, cfg]) => {
          const isActive = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '9999px',
                backgroundColor: isActive ? '#10b981' : 'var(--bg-secondary)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid #10b981' : '1px solid var(--border-primary)',
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

      {/* Search Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="input-arena"
            placeholder="Search feature projects, endpoints, or architectures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

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

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Sparkles size={32} className="animate-spin" color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading feature engineering briefs...</p>
        </div>
      ) : projects.length === 0 ? (
        <div
          className="card-glass"
          style={{
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '1rem',
            color: 'var(--text-muted)',
          }}
        >
          <Box size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Feature Projects Found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Try clearing filters or search queries.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {projects.map((p) => {
            const catCfg = CATEGORY_META[p.category] || CATEGORY_META.All;
            return (
              <div
                key={p._id}
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
                  {/* Top Bar: Category & Difficulty */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{catCfg.icon}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: catCfg.color }}>
                        {p.category}
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        p.difficulty === 'Hard'
                          ? 'badge-danger'
                          : p.difficulty === 'Medium'
                          ? 'badge-warning'
                          : 'badge-info'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {p.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.65rem', lineHeight: 1.4 }}>
                    {p.title}
                  </h3>

                  {/* Feature Scenario */}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.55, marginBottom: '1rem' }}>
                    {p.featureScenario}
                  </p>

                  {/* API Endpoints Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                    {p.endpoints?.map((ep, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            color: ep.method === 'POST' ? '#38bdf8' : '#10b981',
                          }}
                        >
                          {ep.method}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{ep.path}</span>
                      </div>
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
                      <span>~{p.estimatedMinutes} mins build</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>{p.completionsCount || 0} features shipped</span>
                    </div>
                  </div>

                  <Link
                    to={`/features/${p._id}`}
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
                      backgroundColor: '#10b981',
                      borderColor: '#10b981',
                    }}
                  >
                    <span>Enter Feature Studio</span>
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
export default FeaturesListPage;
