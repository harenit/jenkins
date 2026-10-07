import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import ExamExplorerPage from "./pages/ExamExplorerPage";
import ExamDetailPage from "./pages/ExamDetailPage";
import MyProgressPage from "./pages/MyProgressPage";
import StudyPlannerPage from "./pages/StudyPlannerPage";
import ResourcesPage from "./pages/ResourcesPage";
import MarketplacePage from "./pages/MarketplacePage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import CommunityPage from "./pages/CommunityPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import OpeningMotivation from "./components/OpeningMotivation";
import DeliveryDashboardPage from "./pages/DeliveryDashboardPage";
import MentorDashboardPage from "./pages/MentorDashboardPage";
import SettingsPage from "./pages/SettingsPage";

// Note: Analytics, Flashcards, and Notes no longer have their own top-level
// routes - they're sub-tabs inside My Progress (see MyProgressPage.jsx),
// matching the reference navigation structure. Dashboard was removed as a
// standalone student destination for the same reason: Exam Explorer is now
// the landing page after login.

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="pc-loading-screen">Loading PrepCycle…</div>;
  }

  return (
    <>
      <OpeningMotivation />
      <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/exam-explorer" element={<ProtectedRoute><ExamExplorerPage /></ProtectedRoute>} />
      <Route path="/exam-explorer/:slug" element={<ProtectedRoute><ExamDetailPage /></ProtectedRoute>} />
      <Route path="/my-progress" element={<ProtectedRoute><MyProgressPage /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
      <Route path="/study-planner" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute requireStudent><SettingsPage /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/delivery" element={<ProtectedRoute requireDelivery><DeliveryDashboardPage /></ProtectedRoute>} />
      <Route path="/mentor" element={<ProtectedRoute requireMentor><MentorDashboardPage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/exam-explorer" replace />} />
      <Route path="*" element={<Navigate to="/exam-explorer" replace />} />
      </Routes>
    </>
  );
}
