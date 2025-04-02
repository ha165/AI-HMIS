import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Modal,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import fetchWrapper from "../../Context/fetchwrapper";
import { tokens } from "../../../themes";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Services = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const { userRole } = useContext(AppContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [updatedService, setUpdatedService] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchServices() {
      try {
        const data = await fetchWrapper("/services");
        if (isMounted) {
          setServices(data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Error fetching services");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEdit = (service) => {
    setSelectedService(service);
    setUpdatedService({
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes,
      is_active: service.is_active,
    });
    setOpenEditModal(true);
  };

  const handleDelete = (id) => {
    setDeletingServiceId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingServiceId) return;

    try {
      const response = await fetch(`api/services/${deletingServiceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setServices(
          services.filter((service) => service.id !== deletingServiceId)
        );
        toast.success("Service deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting service", error);
      toast.error("Error deleting service");
    } finally {
      setOpenDeleteModal(false);
      setDeletingServiceId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedService) return;

    const payload = { ...selectedService, ...updatedService };
    try {
      const response = await fetch(`api/services/${selectedService.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setServices(
          services.map((service) =>
            service.id === updatedData.id ? updatedData : service
          )
        );
        setOpenEditModal(false);
        toast.success("Service updated successfully");
      }
    } catch (error) {
      console.error("Error updating service", error);
      toast.error("Error updating service");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Service Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "duration_minutes", headerName: "Duration (min)", flex: 1 },
    {
      field: "is_active",
      headerName: "Active",
      flex: 1,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        return (
          <Box display="flex" justifyContent="space-around">
            {userRole === "admin" && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleEdit(params.row)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => handleDelete(params.row.id)}
                >
                  Delete
                </Button>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Topbar />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="Services" subtitle="Managing the services" />
          {userRole === "admin" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/add-service")}
              sx={{
                backgroundColor: colors.greenAccent[500],
                "&:hover": {
                  backgroundColor: colors.greenAccent[600],
                },
              }}
            >
              Add New Service
            </Button>
          )}
        </Box>
        <Box
          m="40px 0 0 0"
          height="75vh"
          sx={{
            overflowY: "auto", // Enable vertical scrolling
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { borderBottom: "none" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
          }}
        >
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress color="secondary" />
            </Box>
          ) : (
            <DataGrid checkboxSelection rows={services} columns={columns} />
          )}
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        aria-labelledby="edit-service-modal"
        aria-describedby="edit-service-details"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: colors.primary[500],
            padding: "20px",
            borderRadius: "10px",
            width: "400px",
          }}
        >
          <Typography variant="h6" mb={2}>
            Edit Service
          </Typography>
          <TextField
            label="Service Name"
            value={updatedService.name || ""}
            onChange={(e) =>
              setUpdatedService({ ...updatedService, name: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={updatedService.description || ""}
            onChange={(e) =>
              setUpdatedService({
                ...updatedService,
                description: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Price"
            type="number"
            value={updatedService.price || ""}
            onChange={(e) =>
              setUpdatedService({ ...updatedService, price: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            value={updatedService.duration_minutes || ""}
            onChange={(e) =>
              setUpdatedService({
                ...updatedService,
                duration_minutes: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Active"
            type="checkbox"
            checked={updatedService.is_active || false}
            onChange={(e) =>
              setUpdatedService({
                ...updatedService,
                is_active: e.target.checked,
              })
            }
            fullWidth
            margin="normal"
          />
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={handleUpdate} variant="contained" color="primary">
              Update
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setDeletingServiceId(null);
        }}
        aria-labelledby="delete-confirmation-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: colors.primary[500],
            padding: "20px",
            borderRadius: "10px",
            width: "400px",
          }}
        >
          <Typography variant="h6" mb={2}>
            Confirm Delete
          </Typography>
          <Typography variant="body1" mb={3}>
            Are you sure you want to delete this service? This action cannot be
            undone.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
                setDeletingServiceId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Services;
