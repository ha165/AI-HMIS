// src/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import UserDashboard from "./Scenes/dashboard/UserDashboard";

// Lazy-loaded components
const Home = lazy(() => import("./Pages/Home"));
const Register = lazy(() => import("./Pages/Auth/Register"));
const Login = lazy(() => import("./Pages/Auth/Login"));
const Dashboard = lazy(() => import("./Scenes/dashboard"));
const Patients = lazy(() => import("./Pages/Patients/Patients"));
const Contacts = lazy(() => import("./Pages/Contacts/Contacts"));
const Forms = lazy(() => import("./Pages/Forms/Form"));
const Calendar = lazy(() => import("./Scenes/calendar/calendar"));
const FAQ = lazy(() => import("./Pages/Faq/Faq"));
const Bar = lazy(() => import("./Scenes/bar"));
const Line = lazy(() => import("./Scenes/line"));
const Pie = lazy(() => import("./Scenes/pie"));
const Geography = lazy(() => import("./Scenes/geography"));

// Custom ProtectedRoute to handle authentication
const ProtectedRoute = ({ element, user }) => {
  const role = localStorage.getItem("role");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Prevent patient from accessing "/"
  if (role === "patient" && window.location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};
// The main Routes component
const AppRoutes = ({ user }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" replace />}
      />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={<ProtectedRoute element={<Dashboard />} user={user} />}
      />
      <Route
        path="/home"
        element={<ProtectedRoute element={<Home />} user={user} />}
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute element={<UserDashboard />} user={user} />}
      />
      <Route
        path="/patients"
        element={<ProtectedRoute element={<Patients />} user={user} />}
      />
      <Route
        path="/contacts"
        element={<ProtectedRoute element={<Contacts />} user={user} />}
      />
      <Route
        path="/form"
        element={<ProtectedRoute element={<Forms />} user={user} />}
      />
      <Route
        path="/calendar"
        element={<ProtectedRoute element={<Calendar />} user={user} />}
      />
      <Route
        path="/faq"
        element={<ProtectedRoute element={<FAQ />} user={user} />}
      />
      <Route
        path="/bar"
        element={<ProtectedRoute element={<Bar />} user={user} />}
      />
      <Route
        path="/line"
        element={<ProtectedRoute element={<Line />} user={user} />}
      />
      <Route
        path="/pie"
        element={<ProtectedRoute element={<Pie />} user={user} />}
      />
      <Route
        path="/geography"
        element={<ProtectedRoute element={<Geography />} user={user} />}
      />
    </Routes>
  );
};

export default AppRoutes;
