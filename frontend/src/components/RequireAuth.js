import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";

const RequireAuth = () => {
  const { auth } = useAuthContext();
  const location = useLocation();

  return auth?.user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
export default RequireAuth;
