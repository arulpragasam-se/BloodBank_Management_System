import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import Loading from '../common/Loading';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requiredRoles = [], 
  requiredPermissions = [],
  redirectTo = '/login',
  fallback = null 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { checkAnyPermission, checkAllPermissions } = usePermissions();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = checkAllPermissions(requiredPermissions);
    if (!hasRequiredPermissions) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Higher-order component for role-based protection
export const withRoleProtection = (Component, requiredRoles = []) => {
  return (props) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Higher-order component for permission-based protection
export const withPermissionProtection = (Component, requiredPermissions = []) => {
  return (props) => (
    <ProtectedRoute requiredPermissions={requiredPermissions}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Admin only route protection
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

// Hospital staff route protection
export const HospitalStaffRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin', 'hospital_staff']}>
    {children}
  </ProtectedRoute>
);

// Donor route protection
export const DonorRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['donor']}>
    {children}
  </ProtectedRoute>
);

// Recipient route protection
export const RecipientRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['recipient']}>
    {children}
  </ProtectedRoute>
);

// Public route (redirect authenticated users)
export const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;