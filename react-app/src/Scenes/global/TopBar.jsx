import { Box, IconButton, useTheme, Popover, Typography, Button } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../../themes";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";

const TopBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  
  // State for managing popovers
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPopover, setCurrentPopover] = useState(null);

  const handleClick = (event, popoverName) => {
    setAnchorEl(event.currentTarget);
    setCurrentPopover(popoverName);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentPopover(null);
  };

  const open = Boolean(anchorEl);
  
  // Sample notifications data
  const notifications = [
    { id: 1, text: "New message received" },
    { id: 2, text: "System update available" },
  ];

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        
        {/* Notifications Icon */}
        <IconButton onClick={(e) => handleClick(e, 'notifications')}>
          <NotificationsOutlinedIcon />
        </IconButton>
        
        {/* Settings Icon */}
        <IconButton onClick={(e) => handleClick(e, 'settings')}>
          <SettingsOutlinedIcon />
        </IconButton>
        
        {/* User Icon */}
        <IconButton onClick={(e) => handleClick(e, 'user')}>
          <PersonOutlinedIcon />
        </IconButton>
      </Box>

      {/* Notifications Popover */}
      <Popover
        open={open && currentPopover === 'notifications'}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box p={2} sx={{ width: 300 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Box key={notification.id} py={1}>
                <Typography>{notification.text}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No new notifications</Typography>
          )}
        </Box>
      </Popover>

      {/* User Popover */}
      <Popover
        open={open && currentPopover === 'user'}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box p={2} sx={{ width: 200 }}>
          <Typography variant="h6" gutterBottom>
            User Profile
          </Typography>
          <Box py={1}>
            <Typography>Account Settings</Typography>
          </Box>
          <Box py={1}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => {
                // Add your logout logic here
                console.log("Logout clicked");
                handleClose();
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Settings Popover */}
      <Popover
        open={open && currentPopover === 'settings'}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box p={2} sx={{ width: 200 }}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <Box py={1}>
            <Typography>Theme Preferences</Typography>
          </Box>
          <Box py={1}>
            <Typography>Privacy Settings</Typography>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default TopBar;