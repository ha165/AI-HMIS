// src/App.jsx
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { useContext, Suspense } from "react";

import { ColorModeContext, useMode } from "../themes.js";
import { AppContext } from "./Context/AppContext";
import Loader from "./components/Loader";
import ErrorBoundary from "./components/ErrorBoundary";
import AppRoutes from "./AppRoutes"; // Import the new AppRoutes component

import "./App.css";

export default function App() {
  const [theme, colorMode] = useMode();
  const { user, loading } = useContext(AppContext);

  // Show loader during initial app load
  if (loading) {
    return <Loader />;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <main className="content">
            <ErrorBoundary>
              <BrowserRouter>
                <Suspense fallback={<Loader />}>
                  <AppRoutes user={user} /> 
                </Suspense>
              </BrowserRouter>
            </ErrorBoundary>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}