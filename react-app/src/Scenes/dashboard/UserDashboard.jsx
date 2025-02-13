import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../themes";
import { mockTransactions } from "../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
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
