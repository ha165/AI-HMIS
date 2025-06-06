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

const Doctors = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const { userRole } = useContext(AppContext);
  const [doctors, setdoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selecteddoctor, setSelecteddoctor] = useState(null);
  const [updateddoctor, setUpdateddoctor] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingdoctorId, setDeletingdoctorId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDoctors() {
      try {
        const data = await fetchWrapper("/doctors");
        if (isMounted) {
          setdoctors(data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Error fetching doctors");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEdit = (doctor) => {
    setSelecteddoctor(doctor);
    setUpdateddoctor({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      phone: doctor.phone,
      email: doctor.email,
      address: doctor.address,
      specialization: doctor.specialization,
      license_number: doctor.license_number,
    });
    setOpenEditModal(true);
  };

  const handleDelete = (id) => {
    setDeletingdoctorId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingdoctorId) return;

    try {
      const response = await fetch(`api/doctors/${deletingdoctorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setdoctors(doctors.filter((doctor) => doctor.id !== deletingdoctorId));
      }
      toast.success("Doctor deleted successfully");
    } catch (error) {
      console.error("Error deleting doctor", error);
      toast.error("Error deleting doctor");
    } finally {
      setOpenDeleteModal(false);
      setDeletingdoctorId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selecteddoctor) return;

    const payload = { ...selecteddoctor, ...updateddoctor };
    try {
      const response = await fetch(`api/doctors/${selecteddoctor.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setdoctors(
          doctors.map((doctor) =>
            doctor.id === updatedData.id ? updatedData : doctor
          )
        );
        setOpenEditModal(false);
      }
      toast.success("Doctor updated successfully");
    } catch (error) {
      console.error("Error updating doctor", error);
      toast.error("Error updating doctor");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "first_name", headerName: "First Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone Number", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "specialization", headerName: "Specialization", flex: 1 },
    { field: "license_number", headerName: "License Number", flex: 1 },
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
            <Header title="Doctors" subtitle="Managing the doctors" />
            {userRole === "admin" && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/add-doctor')}
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  '&:hover': {
                    backgroundColor: colors.greenAccent[600],
                  }
                }}
              >
                Add New Doctor
              </Button>
            )}
          </Box>
          <Box
            m="40px 0 0 0"
            height="75vh"
            sx={{
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
              <DataGrid checkboxSelection rows={doctors} columns={columns} />
            )}
          </Box>
        </Box>
    

      {/* Edit Modal */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        aria-labelledby="edit-doctor-modal"
        aria-describedby="edit-doctor-details"
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
            Edit doctor
          </Typography>
          <TextField
            label="First Name"
            value={updateddoctor.first_name || ""}
            onChange={(e) =>
              setUpdateddoctor({
                ...updateddoctor,
                first_name: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            value={updateddoctor.last_name || ""}
            onChange={(e) =>
              setUpdateddoctor({
                ...updateddoctor,
                last_name: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone Number"
            value={updateddoctor.phone || ""}
            onChange={(e) =>
              setUpdateddoctor({ ...updateddoctor, phone: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={updateddoctor.email || ""}
            onChange={(e) =>
              setUpdateddoctor({ ...updateddoctor, email: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Address"
            value={updateddoctor.address || ""}
            onChange={(e) =>
              setUpdateddoctor({ ...updateddoctor, address: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="specilization"
            value={updateddoctor.specialization || ""}
            onChange={(e) =>
              setUpdateddoctor({
                ...updateddoctor,
                specialization: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="License Number"
            value={updateddoctor.license_number || ""}
            onChange={(e) =>
              setUpdateddoctor({
                ...updateddoctor,
                license_number: e.target.value,
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
          setDeletingdoctorId(null);
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
            Are you sure you want to delete this doctor? This action cannot be
            undone.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
                setDeletingdoctorId(null);
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

export default Doctors;
