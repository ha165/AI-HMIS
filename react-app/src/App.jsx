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

export default function App() {
  const [theme, colorMode] = useMode();
  const { user } = useContext(AppContext);

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
                <Route path="/register" element={user ? <Register /> : <Register />} />
                <Route path="/login" element={user ? <Login /> : <Login />} />
              </Routes>
            </BrowserRouter>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}