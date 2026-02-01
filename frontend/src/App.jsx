import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './pages/Home';
import ReportComplaint from './components/ReportComplaint';
import ComplaintStatus from './components/ComplaintStatus';
import MyComplaints from './components/MyComplaints';
import HRDashboard from './components/HRDashboard';
import ViewComplaint from './components/ViewComplaint';
import './index.css';

/**
 * Protected route wrapper to handle authentication
 */
function ProtectedRoute({ children, requiredRole = null }) {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  const userData = JSON.parse(user);
  if (requiredRole && userData.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

/**
 * Layout wrapper for authenticated pages
 */
function Layout({ children }) {
  return <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>;
}

/**
 * Main App component with routing
 */
export default function App() {
  const [isAuthPage, setIsAuthPage] = useState(false);

  useEffect(() => {
    const currentPath = window.location.pathname;
    setIsAuthPage(currentPath === '/login');
  }, []);

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Employee Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Layout>
                <ReportComplaint />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaint/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ComplaintStatus />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute>
              <Layout>
                <MyComplaints />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* HR Routes */}
        <Route
          path="/hr-dashboard"
          element={
            <ProtectedRoute requiredRole="HR">
              <Layout>
                <HRDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/view-complaint/:id"
          element={
            <ProtectedRoute requiredRole="HR">
              <Layout>
                <ViewComplaint />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
