import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";

const Bar = () => {
  return (
    <Box display="flex" height="100vh" flexDirection="column">
      {/* Topbar */}
      <Topbar />

      <Box display="flex" flex="1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box flex="1" p="20px">
          <Header title="Bar Chart" subtitle="Simple Bar Chart" />
          <Box height="75vh">
            <BarChart />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Bar;
