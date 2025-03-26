import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokens } from "../../../themes";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Paper,
  useTheme,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  Email,
  CalendarToday,
  Transgender,
  Home,
  LocalHospital,
} from "@mui/icons-material";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";

export default function CompleteRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
    emergency_contact: "",
  });

  useEffect(() => {
    // Check if user data exists in location state
    if (location.state?.user) {
      setFormData((prev) => ({
        ...prev,
        first_name: location.state.user.first_name || "",
        last_name: location.state.user.last_name || "",
        email: location.state.user.email || "",
      }));
    } else {
      // If no location state, try to get from localStorage or API
      const token = localStorage.getItem("token");
      if (token) {
        fetchUserData(token);
      } else {
        // If no user data at all, redirect to registration
        navigate("/register");
      }
    }
  }, [location, navigate]);

  async function fetchUserData(token) {
    try {
      const res = await fetch("api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
      }));
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      navigate("/register");
    }
  }

  function handleInputChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("api/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to complete registration");

      toast.success("Registration Completed!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong, please try again!");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      display="flex"
      height="100vh"
      flexDirection={{ xs: "column", md: "row" }}
    >
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column" overflow="auto">
        <Topbar />
        <Box m="20px">
          <Header
            title="COMPLETE REGISTRATION"
            subtitle="Please provide your additional details"
          />
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mt: 4,
              backgroundColor: colors.primary[400],
              border: `1px solid ${colors.blueAccent[700]}`,
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: colors.grey[100] }} />
                      </InputAdornment>
                    ),
                    style: { color: colors.grey[100] },
                    readOnly: true,
                  }}
                  sx={textFieldStyles(colors)}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: colors.grey[100] }} />
                      </InputAdornment>
                    ),
                    style: { color: colors.grey[100] },
                    readOnly: true,
                  }}
                  sx={textFieldStyles(colors)}
                />
              </Box>

              <TextField
                fullWidth
                variant="outlined"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: colors.grey[100] }} />
                    </InputAdornment>
                  ),
                  style: { color: colors.grey[100] },
                  readOnly: true,
                }}
                sx={textFieldStyles(colors)}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: colors.grey[100] }} />
                    </InputAdornment>
                  ),
                  style: { color: colors.grey[100] },
                }}
                sx={textFieldStyles(colors)}
              />

              <TextField
                select
                fullWidth
                variant="outlined"
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Transgender sx={{ color: colors.grey[100] }} />
                    </InputAdornment>
                  ),
                  style: { color: colors.grey[100] },
                }}
                sx={textFieldStyles(colors)}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
                <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
              </TextField>

              <TextField
                fullWidth
                variant="outlined"
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home sx={{ color: colors.grey[100] }} />
                    </InputAdornment>
                  ),
                  style: { color: colors.grey[100] },
                }}
                sx={textFieldStyles(colors)}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Emergency Contact"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalHospital sx={{ color: colors.grey[100] }} />
                    </InputAdornment>
                  ),
                  style: { color: colors.grey[100] },
                }}
                sx={textFieldStyles(colors)}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  backgroundColor: colors.blueAccent[600],
                  "&:hover": {
                    backgroundColor: colors.blueAccent[700],
                  },
                  "&:disabled": {
                    backgroundColor: colors.grey[700],
                  },
                  py: 1.5,
                  mt: 2,
                }}
              >
                {isSubmitting ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <CircularProgress
                      size={24}
                      sx={{ color: colors.grey[100], mr: 2 }}
                    />
                    Completing Registration...
                  </Box>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme.palette.mode}
      />
    </Box>
  );
}

// Reuse the same text field styles from your other components
const textFieldStyles = (colors) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: colors.grey[100],
    },
    "&:hover fieldset": {
      borderColor: colors.blueAccent[300],
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.blueAccent[500],
    },
  },
  "& .MuiInputLabel-root": {
    color: colors.grey[100],
    "&.Mui-focused": {
      color: colors.blueAccent[300],
    },
  },
  "& .MuiFormHelperText-root": {
    color: colors.redAccent[400],
  },
});
