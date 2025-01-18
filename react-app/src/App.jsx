import { ColorModeContext, useMode } from "../themes.js";
import { CssBaseline, ThemeProvider } from "@mui/material";
import  TopBar  from "./Scenes/global/TopBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import "./App.css";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import { useContext } from "react";
import { AppContext } from "./Context/AppContext";
export default function App() {
  const [theme, colorMode] = useMode();
  const { user } = useContext(AppContext);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <main className="content">
            <TopBar />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />

                  <Route
                    path="/register"
                    element={user ? <Home /> : <Register />}
                  />
                  <Route path="/login" element={user ? <Home /> : <Login />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
