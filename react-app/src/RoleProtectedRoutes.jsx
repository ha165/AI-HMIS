import { Routes, Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import RoleProtectedRoute from "./RoleProtectedRoute"; // Import new role-based route guard

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
        element={<RoleProtectedRoute element={<Dashboard />} allowedRoles={["admin", "doctor", "patient"]} user={user} />}
      />
      <Route
        path="/home"
        element={<RoleProtectedRoute element={<Home />} allowedRoles={["admin", "doctor", "patient"]} user={user} />}
      />
      <Route
        path="/patients"
        element={<RoleProtectedRoute element={<Patients />} allowedRoles={["admin", "doctor"]} user={user} />}
      />
      <Route
        path="/contacts"
        element={<RoleProtectedRoute element={<Contacts />} allowedRoles={["admin"]} user={user} />}
      />
      <Route
        path="/form"
        element={<RoleProtectedRoute element={<Forms />} allowedRoles={["admin", "doctor"]} user={user} />}
      />
      <Route
        path="/calendar"
        element={<RoleProtectedRoute element={<Calendar />} allowedRoles={["admin", "doctor", "patient"]} user={user} />}
      />
      <Route
        path="/faq"
        element={<RoleProtectedRoute element={<FAQ />} allowedRoles={["admin", "doctor", "patient"]} user={user} />}
      />
      <Route
        path="/bar"
        element={<RoleProtectedRoute element={<Bar />} allowedRoles={["admin"]} user={user} />}
      />
      <Route
        path="/line"
        element={<RoleProtectedRoute element={<Line />} allowedRoles={["admin"]} user={user} />}
      />
      <Route
        path="/pie"
        element={<RoleProtectedRoute element={<Pie />} allowedRoles={["admin"]} user={user} />}
      />
      <Route
        path="/geography"
        element={<RoleProtectedRoute element={<Geography />} allowedRoles={["admin"]} user={user} />}
      />
    </Routes>
  );
};

export default AppRoutes;
