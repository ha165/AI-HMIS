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
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock,
  CameraAlt,
} from "@mui/icons-material";
import Header from "../../Components/Header";

export default function Register() {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formdata, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "254",
    password: "",
    password_confirmation: "",
    profile_photo: null,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^254\d{9}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*()_]).{8,}$/;

    // Name validation
    if (!formdata.first_name.trim()) {
      newErrors.first_name = ["First name is required"];
    } else if (!nameRegex.test(formdata.first_name)) {
      newErrors.first_name = ["Name should only contain letters"];
    }

    if (!formdata.last_name.trim()) {
      newErrors.last_name = ["Last name is required"];
    } else if (!nameRegex.test(formdata.last_name)) {
      newErrors.last_name = ["Name should only contain letters"];
    }

    // Email validation
    if (!formdata.email.trim()) {
      newErrors.email = ["Email is required"];
    } else if (!emailRegex.test(formdata.email)) {
      newErrors.email = ["Please enter a valid email"];
    }

    // Phone validation
    if (!formdata.phone.trim()) {
      newErrors.phone = ["Phone number is required"];
    } else if (!phoneRegex.test(formdata.phone)) {
      newErrors.phone = ["Phone must start with 254 followed by 9 digits"];
    }

    // Password validation
    if (!formdata.password) {
      newErrors.password = ["Password is required"];
    } else if (!passwordRegex.test(formdata.password)) {
      newErrors.password = [
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@#$%^&*()_)",
      ];
    }

    // Password confirmation
    if (formdata.password !== formdata.password_confirmation) {
      newErrors.password_confirmation = ["Passwords do not match"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Ensure phone starts with 254 and only contains numbers
    if (value.startsWith("254") && /^\d*$/.test(value.slice(3))) {
      setFormData({ ...formdata, phone: value });
      if (errors.phone) setErrors({ ...errors, phone: null });
    } else if (value.length <= 3) {
      setFormData({ ...formdata, phone: "254" });
    }
  };

  async function handleRegister(e) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("first_name", formdata.first_name);
    formData.append("last_name", formdata.last_name);
    formData.append("email", formdata.email);
    formData.append("phone", formdata.phone);
    formData.append("password", formdata.password);
    formData.append("password_confirmation", formdata.password_confirmation);
    formData.append("role", "patient");

    if (formdata.profile_photo) {
      formData.append("profile_photo", formdata.profile_photo);
    }

    try {
      const res = await fetch("api/register", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw errorData.errors || new Error("Registration failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setToken(data.token);
      toast.success("Registration Successful");

      navigate(data.role === "admin" ? "/" : "/complete-registration", {
        state: {
          user: {
            first_name: formdata.first_name,
            last_name: formdata.last_name,
            email: formdata.email,
          },
        },
      });
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
        toast.error("Registration failed. Please check your inputs.");
      } else {
        toast.error("Something went wrong. Please try again.");
        console.error("Registration error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;

    // Special handling for name fields to prevent numbers
    if (name === "first_name" || name === "last_name") {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setFormData({ ...formdata, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
      }
      return;
    }

    setFormData({ ...formdata, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  }

  function handleFileChange(e) {
    setFormData({ ...formdata, profile_photo: e.target.files[0] });
    if (errors.profile_photo) setErrors({ ...errors, profile_photo: null });
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: colors.primary[400], p: 3 }}
    >
      <Box width="100%" maxWidth="600px">
        <Header
          title="REGISTER"
          subtitle="Create your account to get started"
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
            onSubmit={handleRegister}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                variant="outlined"
                label="First Name"
                name="first_name"
                value={formdata.first_name}
                onChange={handleInputChange}
                error={!!errors.first_name}
                helperText={errors.first_name?.[0]}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: colors.grey[100] }} />
                    </InputAdornment>
                  ),
                  style: { color: colors.grey[100] },
                }}
                sx={textFieldStyles(colors)}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Last Name"
                name="last_name"
                value={formdata.last_name}
                onChange={handleInputChange}
                error={!!errors.last_name}
                helperText={errors.last_name?.[0]}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: colors.grey[100] }} />
                    </InputAdornment>
                  ),
                  style: { color: colors.grey[100] },
                }}
                sx={textFieldStyles(colors)}
              />
            </Box>

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
              label="Phone Number"
              name="phone"
              value={formdata.phone}
              onChange={handlePhoneChange}
              error={!!errors.phone}
              helperText={errors.phone?.[0]}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: colors.grey[100] }} />
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

            <TextField
              fullWidth
              variant="outlined"
              label="Confirm Password"
              name="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              value={formdata.password_confirmation}
              onChange={handleInputChange}
              error={!!errors.password_confirmation}
              helperText={errors.password_confirmation?.[0]}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: colors.grey[100] }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                      sx={{ color: colors.grey[100] }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                style: { color: colors.grey[100] },
              }}
              sx={textFieldStyles(colors)}
            />

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CameraAlt />}
                disabled={isSubmitting}
                sx={{
                  color: colors.grey[100],
                  borderColor: colors.grey[100],
                  "&:hover": { borderColor: colors.blueAccent[300] },
                  "&:disabled": {
                    borderColor: colors.grey[700],
                    color: colors.grey[700],
                  },
                }}
              >
                Upload Profile Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {errors.profile_photo && (
                <Typography color="error" variant="caption" display="block">
                  {errors.profile_photo[0]}
                </Typography>
              )}
              {formdata.profile_photo && (
                <Typography
                  variant="caption"
                  color={colors.grey[100]}
                  display="block"
                  mt={1}
                >
                  {formdata.profile_photo.name}
                </Typography>
              )}
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                backgroundColor: colors.blueAccent[600],
                "&:hover": { backgroundColor: colors.blueAccent[700] },
                "&:disabled": { backgroundColor: colors.grey[700] },
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
                  Registering...
                </Box>
              ) : (
                "Register"
              )}
            </Button>

            <Typography
              variant="body2"
              color={colors.grey[100]}
              textAlign="center"
              mt={2}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                color={colors.blueAccent[300]}
                underline="hover"
                sx={{ "&:hover": { color: colors.blueAccent[500] } }}
              >
                Login here
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

const textFieldStyles = (colors) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: colors.grey[100] },
    "&:hover fieldset": { borderColor: colors.blueAccent[300] },
    "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
  },
  "& .MuiInputLabel-root": {
    color: colors.grey[100],
    "&.Mui-focused": { color: colors.blueAccent[300] },
  },
  "& .MuiFormHelperText-root": { color: colors.redAccent[400] },
});
