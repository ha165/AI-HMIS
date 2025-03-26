import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../../Context/AppContext";
import { tokens } from "../../../themes";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import Header from "../../Components/Header";

export default function Login() {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formdata, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formdata.email.trim()) {
      newErrors.email = ["Email is required"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formdata.email)) {
      newErrors.email = ["Please enter a valid email"];
    }

    if (!formdata.password) {
      newErrors.password = ["Password is required"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleLogin(e) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw errorData.errors || new Error("Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setToken(data.token);
      toast.success("Login Successful");

      navigate(data.role === "admin" ? "/" : "/dashboard");
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
        toast.error("Login failed. Please check your credentials.");
      } else {
        toast.error("Something went wrong. Please try again.");
        console.error("Login error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formdata, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundColor: colors.primary[400],
        p: 3,
      }}
    >
      <Box width="100%" maxWidth="600px">
        <Header
          title="LOGIN"
          subtitle="Welcome back! Please enter your credentials"
        />
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 4,
            backgroundColor: colors.primary[400],
            border: `1px solid ${colors.blueAccent[700]}`,
          }}
        >
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              label="Email"
              name="email"
              type="email"
              value={formdata.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email?.[0]}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: colors.grey[100] }} />
                  </InputAdornment>
                ),
                style: { color: colors.grey[100] },
              }}
              sx={textFieldStyles(colors)}
            />

            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formdata.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password?.[0]}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: colors.grey[100] }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{ color: colors.grey[100] }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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
                <Box display="flex" alignItems="center" justifyContent="center">
                  <CircularProgress
                    size={24}
                    sx={{ color: colors.grey[100], mr: 2 }}
                  />
                  Logging in...
                </Box>
              ) : (
                "Login"
              )}
            </Button>

            <Typography
              variant="body2"
              color={colors.grey[100]}
              textAlign="center"
              mt={2}
            >
              Don't have an account?{" "}
              <Link
                href="/register"
                color={colors.blueAccent[300]}
                underline="hover"
                sx={{ "&:hover": { color: colors.blueAccent[500] } }}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>
        </Paper>
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

// Reuse the same text field styles from Register component
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
