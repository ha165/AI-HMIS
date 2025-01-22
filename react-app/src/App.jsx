import { CircularProgress, Box } from "@mui/material";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext, Suspense, lazy } from "react";

import { ColorModeContext, useMode } from "../themes.js";
import { AppContext } from "./Context/AppContext";

import "./App.css";

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
  return user ? element : <Navigate to="/login" replace />;
};

// Fallback loading component for lazy-loaded pages
const LazyLoader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
    }}
  >
    <CircularProgress size={60} thickness={4} />
    <Box mt={2}>Loading...</Box>
  </Box>
);

export default function App() {
  const [theme, colorMode] = useMode();
  const { user, loading } = useContext(AppContext);

  // Show loading spinner for initial app load
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <main className="content">
            <BrowserRouter>
              <Suspense fallback={<LazyLoader />}>
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
                    element={
                      <ProtectedRoute element={<Dashboard />} user={user} />
                    }
                  />
                  <Route
                    path="/home"
                    element={<ProtectedRoute element={<Home />} user={user} />}
                  />
                  <Route
                    path="/patients"
                    element={
                      <ProtectedRoute element={<Patients />} user={user} />
                    }
                  />
                  <Route
                    path="/contacts"
                    element={
                      <ProtectedRoute element={<Contacts />} user={user} />
                    }
                  />
                  <Route
                    path="/form"
                    element={<ProtectedRoute element={<Forms />} user={user} />}
                  />
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute element={<Calendar />} user={user} />
                    }
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
                    element={
                      <ProtectedRoute element={<Geography />} user={user} />
                    }
                  />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
