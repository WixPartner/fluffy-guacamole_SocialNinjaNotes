import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface AuthRouteProps {
  children: JSX.Element;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Allow access to plans page even when authenticated
  if (token && location.pathname !== '/plans') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthRoute; 