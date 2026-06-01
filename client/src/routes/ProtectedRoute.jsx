import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import PageLoader from "../components/common/PageLoader";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <PageLoader
        title="Checking your session"
        message="Please wait while we prepare your Fitness Buddy Pro account."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;