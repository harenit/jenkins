import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false, requireDelivery = false, requireStudent = false, requireMentor = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pc-loading-screen">Loading PrepCycle…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== "admin") return <Navigate to={user.role === "delivery" ? "/delivery" : user.role === "mentor" ? "/mentor" : "/exam-explorer"} replace />;
  if (requireDelivery && user.role !== "delivery") return <Navigate to={user.role === "admin" ? "/admin" : user.role === "mentor" ? "/mentor" : "/exam-explorer"} replace />;
  if (requireMentor && user.role !== "mentor" && user.role !== "admin") return <Navigate to={user.role === "delivery" ? "/delivery" : "/exam-explorer"} replace />;
  if (requireStudent && user.role !== "student") return <Navigate to={user.role === "admin" ? "/admin" : user.role === "mentor" ? "/mentor" : "/delivery"} replace />;
  if (!requireAdmin && !requireDelivery && !requireStudent && !requireMentor) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "delivery") return <Navigate to="/delivery" replace />;
    if (user.role === "mentor") return <Navigate to="/mentor" replace />;
  }
  return children;
}
