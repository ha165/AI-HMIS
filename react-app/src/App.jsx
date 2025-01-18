import { ColorModeContext, useMode } from "../themes.js";
import { CssBaseline, ThemeProvider } from "@mui/material";
import TopBar from "./Scenes/global/TopBar";
import SideBar from "./Scenes/global/SideBar.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import "./App.css";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import { useContext } from "react";
import { AppContext } from "./Context/AppContext";
import Dashboard from "./Scenes/dashboard/index.jsx";
// import Team from "./Scenes/team/index.jsx";
// import Invoices from "./Scenes/invoices/index.jsx";
// import Contacts from "./Scenes/contacts/index.jsx";
// import FAQ from "./Scenes/faq/index.jsx";
// import Bar from "./Scenes/bar/index.jsx";
// import Pie from "./Scenes/pie/index.jsx";
// import Line from "./Scenes/line/index.jsx";
// import Geography from "./Scenes/geography/index.jsx";
// import Calender from "./Scenes/calendar/calendar.jsx";
// import Form from "./Scenes/form/index.jsx";

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
            <SideBar />
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
                <Route path="/dashboard" element={<Dashboard />} />
                {/* <Route path="/team" element={<Team />} /> */}
                {/* <Route path="/invoices" element={<Invoices />} /> */}
                {/* <Route path="/contacts" element={<Contacts />} /> */}
                {/* <Route path="/faq" element={<FAQ />} /> */}
                {/* <Route path="/bar" element={<Bar />} /> */}
                {/* <Route path="/pie" element={<Pie />} /> */}
                {/* <Route path="/line" element={<Line />} /> */}
                {/* <Route path="/geography" element={<Geography />} /> */}
                {/* <Route path="/calendar" element={<Calender />} /> */}
                {/* <Route path="/form" element={<Form />} /> */}
              </Routes>
            </BrowserRouter>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
