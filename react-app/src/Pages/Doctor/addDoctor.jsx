import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  useTheme,
  CircularProgress,
  Avatar,
  IconButton,
} from "@mui/material";
import { tokens } from "../../../themes";
import Header from "../../Components/Header";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddDoctor = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    specialization: "",
    license_number: "",
    password: "",
    profile_photo: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_photo: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.specialization.trim())
      newErrors.specialization = "Specialization is required";
    if (!formData.license_number.trim())
      newErrors.license_number = "License number is required";
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
  
    setLoading(true);
  
    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("specialization", formData.specialization);
    formDataToSend.append("license_number", formData.license_number);
    formDataToSend.append("password", formData.password);
    
    if (formData.profile_photo) {
      formDataToSend.append("profile_photo", formData.profile_photo);
    }
  
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData.errors || new Error("Failed to add doctor");
      }
  
      const data = await res.json();
      toast.success("Doctor added successfully");
      navigate("/doctors");
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
        toast.error("Failed to add doctor. Please check your inputs.");
      } else {
        toast.error("Something went wrong. Please try again.");
        console.error("Add doctor error:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Topbar />
        <Box m="20px">
          <Header
            title="Add New Doctor"
            subtitle="Create a new doctor profile"
          />

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              mt: 3,
              p: 3,
              backgroundColor: colors.primary[400],
              borderRadius: "4px",
              boxShadow: 3,
            }}
            encType="multipart/form-data"
          >
            {errors.general && (
              <Box
                mb={2}
                p={1}
                bgcolor={colors.redAccent[500]}
                color="white"
                borderRadius="4px"
              >
                {errors.general}
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={previewImage || "/default-profile.jpg"}
                    sx={{
                      width: 120,
                      height: 120,
                      border: `2px solid ${colors.blueAccent[500]}`,
                    }}
                  />
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: colors.blueAccent[500],
                      "&:hover": {
                        backgroundColor: colors.blueAccent[600],
                      },
                    }}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      name="profile_photo"
                      onChange={handleImageChange}
                    />
                    <PhotoCamera />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  error={!!errors.specialization}
                  helperText={errors.specialization}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  error={!!errors.license_number}
                  helperText={errors.license_number}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/doctors")}
                    sx={{
                      borderColor: colors.blueAccent[500],
                      color: colors.blueAccent[500],
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      backgroundColor: colors.greenAccent[500],
                      "&:hover": {
                        backgroundColor: colors.greenAccent[600],
                      },
                      minWidth: "120px",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Save Doctor"
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddDoctor;
