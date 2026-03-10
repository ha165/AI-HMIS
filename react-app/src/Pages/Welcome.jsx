import { Box, Typography, Button, Grid, Paper, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../themes";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";

import heroImage from "../assets/Doctors-rafiki.svg";
export default function Welcome() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      sx={{
        backgroundColor: colors.primary[400],
        p: 4,
      }}
    >
      {/* HERO SECTION */}
      <Grid
        container
        spacing={6}
        alignItems="center"
        justifyContent="center"
        mb={8}
      >
        {/* LEFT SIDE */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h2"
            fontWeight="bold"
            color={colors.grey[100]}
            mb={2}
          >
            AI Hospital Management System
          </Typography>

          <Typography variant="h5" color={colors.grey[300]} mb={4}>
            Manage appointments, medical records, AI diagnosis and patient care
            efficiently in one secure platform.
          </Typography>

          <Box display="flex" gap={3}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                backgroundColor: colors.blueAccent[600],
                "&:hover": { backgroundColor: colors.blueAccent[700] },
                px: 4,
                py: 1.5,
              }}
            >
              Login
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                borderColor: colors.blueAccent[500],
                color: colors.blueAccent[300],
                "&:hover": {
                  borderColor: colors.blueAccent[300],
                  backgroundColor: colors.primary[500],
                },
                px: 4,
                py: 1.5,
              }}
            >
              Register
            </Button>
          </Box>
        </Grid>

        {/* RIGHT SIDE IMAGE */}
        <Grid item xs={12} md={6} textAlign="center">
          <Box
            component="img"
            src={heroImage}
            alt="AI Hospital Illustration"
            sx={{
              width: "100%",
              maxWidth: 500,
            }}
          />
        </Grid>
      </Grid>

      {/* FEATURES SECTION */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: colors.primary[400],
              border: `1px solid ${colors.blueAccent[700]}`,
            }}
          >
            <EventIcon
              sx={{ fontSize: 50, color: colors.blueAccent[400], mb: 2 }}
            />
            <Typography variant="h5" color={colors.grey[100]} mb={1}>
              Appointment Booking
            </Typography>
            <Typography color={colors.grey[300]}>
              Easily schedule and manage doctor appointments online.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: colors.primary[400],
              border: `1px solid ${colors.blueAccent[700]}`,
            }}
          >
            <LocalHospitalIcon
              sx={{ fontSize: 50, color: colors.blueAccent[400], mb: 2 }}
            />
            <Typography variant="h5" color={colors.grey[100]} mb={1}>
              Medical Records
            </Typography>
            <Typography color={colors.grey[300]}>
              Securely store and access patient medical records anytime.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: colors.primary[400],
              border: `1px solid ${colors.blueAccent[700]}`,
            }}
          >
            <PsychologyIcon
              sx={{ fontSize: 50, color: colors.blueAccent[400], mb: 2 }}
            />
            <Typography variant="h5" color={colors.grey[100]} mb={1}>
              AI Diagnosis
            </Typography>
            <Typography color={colors.grey[300]}>
              Use AI tools to assist with diagnosis and medical image analysis.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* FOOTER */}
      <Box mt={10} textAlign="center">
        <Typography color={colors.grey[400]}>
          © {new Date().getFullYear()} AI Hospital Management System
        </Typography>
      </Box>
    </Box>
  );
}