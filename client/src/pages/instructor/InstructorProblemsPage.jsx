import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Terminal,
  PlusCircle,
  Search,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  X,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

export const InstructorProblemsPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(() => searchParams.get('create') === 'true' || location.pathname.endsWith('/new'));
  const [selectedProblemForTC, setSelectedProblemForTC] = useState(null);
  const [problemTestCases, setProblemTestCases] = useState([]);
  const [loadingTC, setLoadingTC] = useState(false);

  // New Test Case sub-form
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcOutput, setNewTcOutput] = useState('');
  const [newTcHidden, setNewTcHidden] = useState(false);
  const [newTcExplanation, setNewTcExplanation] = useState('');

  const toCamelCase = (str) => {
    return (
      str
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .filter(Boolean)
        .map((w, idx) => (idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('') || 'solution'
    );
  };

  // New Problem Form
  const initialForm = {
    title: '',
    difficulty: 'Medium',
    topic: 'Arrays',
    description: '',
    constraints: '1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9',
    inputFormat: 'Array of elements',
    outputFormat: 'Expected return value',
    timeLimit: 2000,
    memoryLimit: 256,
    starterCode: '',
    sampleInput: '',
    sampleOutput: '',
    sampleExplanation: '',
    hiddenInput: '',
    hiddenOutput: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const handleTitleChange = (newTitle) => {
    const fn = toCamelCase(newTitle);
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      starterCode:
        !prev.starterCode || prev.starterCode.includes('function ')
          ? `/**\n * @param {any} input\n * @return {any}\n */\nfunction ${fn}(input) {\n  // Write your solution here\n  \n}`
          : prev.starterCode,
    }));
  };

  const { success, error } = useToast();

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await api.get('/problems?limit=50');
      if (data.success && data.problems) {
        setProblems(data.problems);
      }
    } catch (err) {
      error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete problem "${title}"?`)) return;
    try {
      await api.delete(`/problems/${id}`);
      success(`Problem "${title}" deleted.`);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      error(err.message || 'Failed to delete problem');
    }
  };

  const handleOpenTestCases = async (problem) => {
    setSelectedProblemForTC(problem);
    setLoadingTC(true);
    try {
      const data = await api.get(`/problems/${problem._id}/testcases`);
      if (data.success && data.testCases) {
        setProblemTestCases(data.testCases);
      }
    } catch (err) {
      error('Failed to load test cases');
    } finally {
      setLoadingTC(false);
    }
  };

  const handleAddTestCase = async (e) => {
    e.preventDefault();
    if (!newTcInput || !newTcOutput) {
      error('Input and Expected Output are required');
      return;
    }

    try {
      const res = await api.post(`/problems/${selectedProblemForTC._id}/testcases`, {
        input: newTcInput,
        expectedOutput: newTcOutput,
        isHidden: newTcHidden,
        explanation: newTcExplanation,
      });

      if (res.success && res.testCase) {
        setProblemTestCases((prev) => [...prev, res.testCase]);
        setNewTcInput('');
        setNewTcOutput('');
        setNewTcHidden(false);
        setNewTcExplanation('');
        success('Test case attached successfully');
      }
    } catch (err) {
      error(err.message || 'Failed to add testcase');
    }
  };

  const handleDeleteTestCase = async (tcId) => {
    try {
      await api.delete(`/problems/testcases/${tcId}`);
      setProblemTestCases((prev) => prev.filter((t) => t._id !== tcId));
      success('Test case removed.');
    } catch (err) {
      error(err.message || 'Failed to remove testcase');
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      const constraintsArr = formData.constraints
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean);

      const funcName = toCamelCase(formData.title);

      const testCases = [];
      if (formData.sampleInput.trim() && formData.sampleOutput.trim()) {
        testCases.push({
          input: formData.sampleInput.trim(),
          expectedOutput: formData.sampleOutput.trim(),
          isHidden: false,
          explanation: formData.sampleExplanation || 'Public sample test case',
        });
      }
      if (formData.hiddenInput.trim() && formData.hiddenOutput.trim()) {
        testCases.push({
          input: formData.hiddenInput.trim(),
          expectedOutput: formData.hiddenOutput.trim(),
          isHidden: true,
          explanation: 'Hidden test case for edge evaluation',
        });
      }

      const jsStarter =
        formData.starterCode.trim() ||
        `/**\n * @param {any} input\n * @return {any}\n */\nfunction ${funcName}(input) {\n  // Write your solution here\n  \n}`;
      const pyStarter = `class Solution:\n    def ${funcName}(self, input):\n        # Write your solution here\n        pass`;
      const cppStarter = `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your solution here\n};`;
      const javaStarter = `public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`;

      const payload = {
        title: formData.title,
        difficulty: formData.difficulty,
        topic: formData.topic,
        description: formData.description,
        constraints: constraintsArr,
        inputFormat: formData.inputFormat,
        outputFormat: formData.outputFormat,
        timeLimit: formData.timeLimit,
        memoryLimit: formData.memoryLimit,
        starterCode: {
          javascript: jsStarter,
          python: pyStarter,
          cpp: cppStarter,
          java: javaStarter,
        },
        testCases,
      };

      const res = await api.post('/problems', payload);
      if (res.success) {
        success(`Problem "${res.problem.title}" created successfully with ${testCases.length} calibrated test cases!`);
        setIsModalOpen(false);
        setFormData(initialForm);
        fetchProblems();
      }
    } catch (err) {
      error(err.message || 'Problem creation failed');
    }
  };

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Terminal size={22} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Problem Repository Management</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Author, calibrate, and manage coding challenges, time limits, and public & hidden test suites.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <PlusCircle size={16} />
          <span>Author New Problem</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="input-arena"
          placeholder="Filter by title or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {/* Problems Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton" style={{ height: '65px', borderRadius: '0.5rem' }} />
          ))}
        </div>
      ) : (
        <div className="card-glass" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
              padding: '0.85rem 1.25rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            <div>Problem Title</div>
            <div>Topic</div>
            <div>Difficulty</div>
            <div>Limits</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          <div>
            {filteredProblems.map((prob, idx) => (
              <div
                key={prob._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: idx !== filteredProblems.length - 1 ? '1px solid var(--border-primary)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {prob.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Slug: {prob.slug}
                  </div>
                </div>

                <div>
                  <span className="badge badge-info">{prob.topic}</span>
                </div>

                <div>
                  <span className={`badge badge-${prob.difficulty.toLowerCase()}`}>
                    {prob.difficulty}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {prob.timeLimit}ms / {prob.memoryLimit}MB
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenTestCases(prob)}
                    className="btn btn-secondary btn-sm"
                    title="Manage Test Cases"
                  >
                    <FileCheck size={14} color="#06b6d4" />
                    <span>Test Cases</span>
                  </button>
                  <button
                    onClick={() => handleDelete(prob._id, prob.title)}
                    className="btn btn-secondary btn-sm"
                    title="Delete Problem"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Author New Problem Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card-glass animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Author Coding Challenge</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  className="input-arena"
                  placeholder="e.g. Subarray Sum Equals K"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Topic Category *
                  </label>
                  <select
                    className="input-arena"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  >
                    {['Arrays', 'Strings', 'Linked Lists', 'Stack', 'Queue', 'Trees', 'Graphs', 'DP', 'Sorting', 'Searching', 'Hashing', 'JavaScript'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Difficulty Level *
                  </label>
                  <select
                    className="input-arena"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Problem Statement / Description (Markdown supported) *
                </label>
                <textarea
                  required
                  rows={3}
                  className="input-arena"
                  placeholder="Describe the objective, input parameters, and mathematical expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Input Format
                  </label>
                  <input
                    type="text"
                    className="input-arena"
                    placeholder="e.g. Array of integers nums"
                    value={formData.inputFormat}
                    onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Output Format
                  </label>
                  <input
                    type="text"
                    className="input-arena"
                    placeholder="e.g. Array of products"
                    value={formData.outputFormat}
                    onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Constraints (one per line)
                </label>
                <textarea
                  rows={2}
                  className="input-arena"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  placeholder="1 <= nums.length <= 10^5&#10;-10^9 <= nums[i] <= 10^9"
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                />
              </div>

              {/* Public Sample Test Case */}
              <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: '0.65rem' }}>
                  Public Sample Test Case (Required)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Sample Input *
                    </label>
                    <textarea
                      required
                      rows={2}
                      className="input-arena"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                      placeholder="e.g. [1,2,3,4]"
                      value={formData.sampleInput}
                      onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Expected Output *
                    </label>
                    <textarea
                      required
                      rows={2}
                      className="input-arena"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                      placeholder="e.g. [24,12,8,6]"
                      value={formData.sampleOutput}
                      onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="input-arena"
                    placeholder="Explanation (e.g. nums[0] excludes 1, product 2*3*4=24)"
                    value={formData.sampleExplanation}
                    onChange={(e) => setFormData({ ...formData, sampleExplanation: e.target.value })}
                  />
                </div>
              </div>

              {/* Hidden Test Case */}
              <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.65rem' }}>
                  Hidden Edge Test Case (For Assessment Scoring)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Hidden Input
                    </label>
                    <textarea
                      rows={2}
                      className="input-arena"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                      placeholder="e.g. [-1,1,0,-3,3]"
                      value={formData.hiddenInput}
                      onChange={(e) => setFormData({ ...formData, hiddenInput: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Hidden Expected Output
                    </label>
                    <textarea
                      rows={2}
                      className="input-arena"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                      placeholder="e.g. [0,0,9,0,0]"
                      value={formData.hiddenOutput}
                      onChange={(e) => setFormData({ ...formData, hiddenOutput: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Time Limit (ms)
                  </label>
                  <input
                    type="number"
                    className="input-arena"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Memory Limit (MB)
                  </label>
                  <input
                    type="number"
                    className="input-arena"
                    value={formData.memoryLimit}
                    onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Starter Code Template (JavaScript)
                </label>
                <textarea
                  rows={4}
                  className="input-arena"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                  value={formData.starterCode}
                  onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Test Cases Modal */}
      {selectedProblemForTC && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card-glass animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '0.35rem' }}>
                  {selectedProblemForTC.topic}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Test Cases for: {selectedProblemForTC.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProblemForTC(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Existing Test Cases List */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Existing Test Cases ({problemTestCases.length})
              </div>

              {loadingTC ? (
                <div className="skeleton" style={{ height: '80px', borderRadius: '0.5rem' }} />
              ) : problemTestCases.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No test cases configured yet. Add at least one public and one hidden case.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {problemTestCases.map((tc, idx) => (
                    <div
                      key={tc._id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Case #{idx + 1}</span>
                          <span className={`badge ${tc.isHidden ? 'badge-hard' : 'badge-easy'}`}>
                            {tc.isHidden ? 'Hidden Test' : 'Public Case'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          In: {tc.input} ➔ Out: {tc.expectedOutput}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTestCase(tc._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                        title="Delete Test Case"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Test Case Form */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                Add New Test Case
              </h3>
              <form onSubmit={handleAddTestCase} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Standard Input (raw string or JSON) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      className="input-arena"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                      placeholder="[2,7,11,15]&#10;9"
                      value={newTcInput}
                      onChange={(e) => setNewTcInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Expected Standard Output *
                    </label>
                    <textarea
                      required
                      rows={2}
                      className="input-arena"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                      placeholder="[0,1]"
                      value={newTcOutput}
                      onChange={(e) => setNewTcOutput(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={newTcHidden}
                      onChange={(e) => setNewTcHidden(e.target.checked)}
                    />
                    <span style={{ fontWeight: 600, color: newTcHidden ? '#ef4444' : 'var(--text-primary)' }}>
                      Hidden Test Case (Invisible to candidates)
                    </span>
                  </label>

                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      className="input-arena"
                      placeholder="Optional explanation for public case"
                      value={newTcExplanation}
                      onChange={(e) => setNewTcExplanation(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <PlusCircle size={14} />
                    <span>Insert Test Case</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
