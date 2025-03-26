import { useEffect, useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../../themes";
import fetchWrapper from "../../Context/fetchwrapper";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatIcon from "@mui/icons-material/Chat";
import useLogout from "../../Pages/Auth/Logout";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { handleLogout } = useLogout();

  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      try {
        const data = await fetchWrapper("/user");
        if (isMounted) {
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        {loading ? (
          <Box
            height="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress size={50} />
          </Box>
        ) : (
          <Menu iconShape="square">
            <MenuItem
              onClick={() => setIsCollapsed(!isCollapsed)}
              icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
              style={{
                margin: "10px 0 20px 0",
                color: colors.grey[100],
              }}
            >
              {!isCollapsed && (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  ml="15px"
                >
                  <Typography variant="h3" color={colors.grey[100]}>
                    {user?.role}
                  </Typography>
                  <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <MenuOutlinedIcon />
                  </IconButton>
                </Box>
              )}
            </MenuItem>

            {!isCollapsed && (
              <Box mb="25px">
                <Box display="flex" justifyContent="center" alignItems="center">
                  {loading ? (
                    <Typography variant="h6" color={colors.grey[100]}>
                      Loading...
                    </Typography>
                  ) : (
                    <img
                      alt="profile-user"
                      width="100px"
                      height="100px"
                      src={user?.profile_photo_url}
                      style={{ borderRadius: "50%" }}
                    />
                  )}
                </Box>
                <Box textAlign="center">
                  {loading ? (
                    <Typography variant="h6" color={colors.grey[100]}>
                      Loading...
                    </Typography>
                  ) : (
                    <>
                      <Typography
                        variant="h2"
                        color={colors.grey[100]}
                        fontWeight="bold"
                        sx={{ m: "10px 0 0 0" }}
                      >
                        {user?.first_name}
                      </Typography>
                      <Typography variant="h5" color={colors.greenAccent[500]}>
                        {user?.role}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            )}

            <Box paddingLeft={isCollapsed ? undefined : "10%"}>
              <Item
                title="Dashboard"
                to="/"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Data
              </Typography>
              {user?.role !== "patient" && (
                <>
                  <Item
                    title="Manage Patients"
                    to="/patients"
                    icon={<PeopleOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Manage Doctors"
                    to="/doctors"
                    icon={<GroupIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                </>
              )}
              {user?.role !== "patient" && (
                <>
                  <Item
                    title="Contacts Information"
                    to="/contacts"
                    icon={<ContactsOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Invoices Balances"
                    to="/invoices"
                    icon={<ReceiptOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Departments"
                    to="/departments"
                    icon={<BusinessIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                </>
              )}
              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Pages
              </Typography>
              <Item
                title="Profile Form"
                to="/form"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Appointments"
                to="/appointments"
                icon={<ScheduleIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Medical Records"
                to="/medical-records"
                icon={<HealthAndSafetyIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Billing"
                to="/billing"
                icon={<AttachMoneyIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Schedule"
                to="/calendar"
                icon={<CalendarTodayOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              {user?.role !== "patient" && (
                <>
                  <Item
                    title="FAQ Page"
                    to="/faq"
                    icon={<HelpOutlineOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Typography
                    variant="h6"
                    color={colors.grey[300]}
                    sx={{ m: "15px 0 5px 20px" }}
                  >
                    AI
                  </Typography>
                  <Item
                    title="Diagnosis"
                    to="/diagnosis-chat"
                    icon={<ChatIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Image Analyzer"
                    to="/image-analyzer"
                    icon={<ChatIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Typography
                    variant="h6"
                    color={colors.grey[300]}
                    sx={{ m: "15px 0 5px 20px" }}
                  >
                    Charts
                  </Typography>

                  <Item
                    title="Bar Chart"
                    to="/bar"
                    icon={<BarChartOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Pie Chart"
                    to="/pie"
                    icon={<PieChartOutlineOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Line Chart"
                    to="/line"
                    icon={<TimelineOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Geography Chart"
                    to="/geography"
                    icon={<MapOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                 
                </>
                
              )}
               <MenuItem
                    onClick={handleLogout}
                    icon={<LogoutIcon />}
                    style={{
                      color: colors.grey[100],
                      marginTop: "20px",
                      borderTop: `1px solid ${colors.grey[700]}`,
                      paddingTop: "15px",
                    }}
                  >
                    <Typography>Logout</Typography>
                  </MenuItem>
            </Box>
          </Menu>
        )}
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
