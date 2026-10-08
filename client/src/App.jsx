import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { RoleRoute } from './components/routes/RoleRoute';
import { PublicLayout, CandidateLayout, InstructorLayout } from './components/layout/Layouts';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { SkillAnalysisPage } from './pages/candidate/SkillAnalysisPage';
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';

import { ProblemListPage } from './pages/problems/ProblemListPage';
import { AssessmentsPage } from './pages/assessments/AssessmentsPage';
import { AssessmentDetailPage } from './pages/assessments/AssessmentDetailPage';
import { CodingArenaPage } from './pages/arena/CodingArenaPage';
import { AIInterviewPage } from './pages/interview/AIInterviewPage';
import { RealInterviewSimulatorPage } from './pages/interview/RealInterviewSimulatorPage';
import { InterviewReportPage } from './pages/interview/InterviewReportPage';
import { MissionsListPage } from './pages/missions/MissionsListPage';
import { MissionWorkspacePage } from './pages/missions/MissionWorkspacePage';
import { DebugArenaListPage } from './pages/debug/DebugArenaListPage';
import { DebugWorkspacePage } from './pages/debug/DebugWorkspacePage';
import { FeaturesListPage } from './pages/features/FeaturesListPage';
import { FeatureWorkspacePage } from './pages/features/FeatureWorkspacePage';
import { CodeReplayPage } from './pages/submissions/CodeReplayPage';
import { SubmissionsHistoryPage } from './pages/submissions/SubmissionsHistoryPage';
import { AssessmentResultPage } from './pages/results/AssessmentResultPage';

import { InstructorProblemsPage } from './pages/instructor/InstructorProblemsPage';
import { InstructorAssessmentsPage } from './pages/instructor/InstructorAssessmentsPage';
import { CandidateManagementPage } from './pages/instructor/CandidateManagementPage';
import { AnalyticsPage } from './pages/instructor/AnalyticsPage';

import { LeaderboardPage } from './pages/leaderboard/LeaderboardPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ProductionSimulatorPage } from './pages/simulation/ProductionSimulatorPage';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Standalone Full-screen Coding Arena & Mission Workspace Routes */}
              <Route path="/arena/:problemId" element={<CodingArenaPage />} />
              <Route path="/assessments/:assessmentId/arena" element={<CodingArenaPage />} />
              <Route path="/assessments/:assessmentId/arena/:problemId" element={<CodingArenaPage />} />
              <Route path="/missions/:id" element={<MissionWorkspacePage />} />
              <Route path="/debug-arena/:id" element={<DebugWorkspacePage />} />
              <Route path="/features/:id" element={<FeatureWorkspacePage />} />
              <Route path="/simulations/current" element={<ProductionSimulatorPage />} />
              <Route path="/simulations/:id" element={<ProductionSimulatorPage />} />
              <Route path="/simulation" element={<ProductionSimulatorPage />} />

              {/* Public Routes with Navbar */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/problems" element={<ProblemListPage />} />
                <Route path="/missions" element={<MissionsListPage />} />
                <Route path="/debug-arena" element={<DebugArenaListPage />} />
                <Route path="/features" element={<FeaturesListPage />} />
                <Route path="/assessments" element={<AssessmentsPage />} />
                <Route path="/assessments/:id" element={<AssessmentDetailPage />} />
                <Route path="/results/:id" element={<AssessmentResultPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/ai-interview" element={<RealInterviewSimulatorPage />} />
                <Route path="/interview/simulator" element={<RealInterviewSimulatorPage />} />
                <Route path="/interview/report/:id" element={<InterviewReportPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Candidate Routes with Sidebar */}
              <Route
                path="/candidate"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['candidate']}>
                      <CandidateLayout />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<CandidateDashboard />} />
                <Route path="skills" element={<Navigate to="/candidate/dashboard" replace />} />
                <Route path="submissions" element={<SubmissionsHistoryPage />} />
                <Route path="replay" element={<CodeReplayPage />} />
              </Route>

              {/* Direct /dashboard route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['candidate', 'instructor']}>
                      <CandidateLayout />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<CandidateDashboard />} />
              </Route>

              {/* Instructor Routes with Sidebar */}
              <Route
                path="/instructor"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['instructor']}>
                      <InstructorLayout />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="problems" element={<InstructorProblemsPage />} />
                <Route path="problems/new" element={<InstructorProblemsPage />} />
                <Route path="assessments" element={<InstructorAssessmentsPage />} />
                <Route path="assessments/new" element={<InstructorAssessmentsPage />} />
                <Route path="candidates" element={<Navigate to="/instructor/dashboard" replace />} />
                <Route path="submissions" element={<SubmissionsHistoryPage />} />
                <Route path="plagiarism" element={<Navigate to="/instructor/dashboard" replace />} />
                <Route path="analytics" element={<Navigate to="/instructor/dashboard" replace />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
