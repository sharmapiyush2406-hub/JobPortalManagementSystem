import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseJobs from './pages/BrowseJobs';
import JobDetails from './pages/JobDetails';
import CandidateDashboard from './pages/CandidateDashboard';
import MyApplications from './pages/MyApplications';
import CandidateProfile from './pages/CandidateProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageJobs from './pages/ManageJobs';
import ManageApplications from './pages/ManageApplications';
import ManageCandidates from './pages/ManageCandidates';
import NotFound from './pages/NotFound';

/**
 * Route protection wrapper for Candidate pages
 */
function CandidateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ message: 'Please log in to access this page.' }} />;
  }

  return children;
}

/**
 * Route protection wrapper for Admin pages
 */
function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying administrator credentials..." />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Initializing Job Portal Management System..." />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Candidate Protected Routes */}
          <Route
            path="/candidate/dashboard"
            element={
              <CandidateRoute>
                <CandidateDashboard />
              </CandidateRoute>
            }
          />
          <Route
            path="/candidate/applications"
            element={
              <CandidateRoute>
                <MyApplications />
              </CandidateRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <CandidateRoute>
                <CandidateProfile />
              </CandidateRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <AdminRoute>
                <ManageJobs />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <AdminRoute>
                <ManageApplications />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <AdminRoute>
                <ManageCandidates />
              </AdminRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
