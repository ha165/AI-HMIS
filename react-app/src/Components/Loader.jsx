// src/components/Loader.jsx
import React from "react";
import { CircularProgress, Box, Typography, useTheme } from "@mui/material";

const Loader = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{ color: theme.palette.primary.main }}
      />{" "}
      {/* Use primary color for spinner */}
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Loading, please wait...
      </Typography>
    </Box>
  );
};

export default Loader;
