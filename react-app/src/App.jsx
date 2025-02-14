import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { useContext, Suspense } from "react";
import { ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

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
        <ToastContainer position="top-right" autoClose={5000} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
