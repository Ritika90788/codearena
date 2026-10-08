import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect candidate away from instructor-only routes, or vice versa
    return <Navigate to={user.role === 'instructor' ? '/instructor/dashboard' : '/candidate/dashboard'} replace />;
  }

  return children;
};
