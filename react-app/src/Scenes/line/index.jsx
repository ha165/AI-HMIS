import { Box } from "@mui/material";
import Header from "../../components/Header";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import LineChart from "../../components/LineChart";

const Line = () => {
  return (
    <Box display="flex" height="100vh" flexDirection="column">
      {/* Topbar */}
      <Topbar />

      <Box display="flex" flex="1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box flex="1" p="20px">
          <Header title="Line Chart" subtitle="Simple Line Chart" />
          <Box height="75vh">
            <LineChart />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Line;
