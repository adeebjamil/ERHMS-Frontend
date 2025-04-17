import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // User doesn't have the required role
    return <Navigate to={`/${currentUser.role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;