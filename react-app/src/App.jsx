import { CircularProgress, Box } from "@mui/material";
import { ColorModeContext, useMode } from "../themes.js";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import "./App.css";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import { useContext } from "react";
import { AppContext } from "./Context/AppContext";
import Dashboard from "./Scenes/dashboard/index.jsx";
import Patients from "./Pages/Patients/Patients.jsx";
import Contacts from "./Pages/Contacts/Contacts.jsx";
import Forms from "./Pages/Forms/Form.jsx";
import Calendar from "./Scenes/calendar/calendar.jsx";
import FAQ from "./Pages/Faq/Faq.jsx";

export default function App() {
  const [theme, colorMode] = useMode();
  const { user, loading } = useContext(AppContext);

  if (loading) {
    // Show a styled loading spinner
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
              <Routes>
                {/* If user is logged in, redirect to Dashboard */}
                <Route path="/" element={user ? <Dashboard /> : <Login />} />
                
                {/* Additional routes */}
                <Route path="/home" element={user ? <Home /> : <Login />} />
                <Route path="/register" element={!user ? <Register /> : <Dashboard />} />
                <Route path="/login" element={!user ? <Login /> : <Dashboard />} />
                <Route path="/patients" element={user ? <Patients /> : <Login />} />
                <Route path="/contacts" element={user ? <Contacts /> : <Login />} />
                <Route path="/form" element={user ? <Forms /> : <Login />} />
                <Route path="/calendar" element={user ? <Calendar /> : <Login />} />
                <Route path="/faq" element={user ? <FAQ /> : <Login />} />
              </Routes>
            </BrowserRouter>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
