import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../themes";
import Header from "../../components/Header";
import Sidebar from "../global/SideBar";
import Topbar from "../global/TopBar";

const UserDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box display="flex">
      {/* SIDEBAR */}
      <Sidebar />

      <Box flex="1" m="20px">
        {/* TOPBAR */}
        <Topbar />

        {/* CONTENT */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
