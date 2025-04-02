import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Grid,
  useTheme,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from "@mui/material";
import { tokens } from "../../../themes";
import Header from "../../Components/Header";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fetchWrapper from "../../Context/fetchwrapper";

const AddService = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    is_active: true,
  });
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Service name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    if (!formData.duration_minutes.trim())
      newErrors.duration_minutes = "Duration is required";

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

    try {
      await fetchWrapper("/services", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success("Service added successfully");
      navigate("/service");
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
        toast.error("Failed to add service. Please check your inputs.");
      } else {
        toast.error("Something went wrong. Please try again.");
        console.error("Add service error:", error);
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
            title="Add New Service"
            subtitle="Create a new service profile"
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
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Service Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  error={!!errors.price}
                  helperText={errors.price}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration_minutes"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  error={!!errors.duration_minutes}
                  helperText={errors.duration_minutes}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="is-active-label">Active</InputLabel>
                  <Select
                    labelId="is-active-label"
                    id="is-active-select"
                    name="is_active"
                    value={formData.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === "true",
                      })
                    }
                    input={<OutlinedInput label="Active" />}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/services")}
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
                      "Save Service"
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

export default AddService;
