import { Box, useTheme } from "@mui/material";
import GeographyChart from "../../components/GeographyChart";
import Header from "../../components/Header";
import { tokens } from "../../../themes";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";

const Geography = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box display="flex" height="100vh" flexDirection="column">
      {/* Topbar */}
      <Topbar />

      <Box display="flex" flex="1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box flex="1" p="20px">
          <Header title="Geography" subtitle="Simple Geography Chart" />
          <Box
            height="75vh"
            border={`1px solid ${colors.grey[100]}`}
            borderRadius="4px"
          >
            <GeographyChart />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Geography;
