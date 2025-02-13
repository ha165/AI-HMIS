import { useState, useEffect } from "react";
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
import { tokens } from "../../../themes";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";

const Patients = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [updatedPatient, setUpdatedPatient] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch("api/patients", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();

    const storedRole = localStorage.getItem("role");
    setUserRole(storedRole);
  }, []);

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setUpdatedPatient({
      first_name: patient.first_name,
      last_name: patient.last_name,
      phone: patient.phone,
      email: patient.email,
    });
    setOpenEditModal(true);
  };

  const handleDelete = (id) => {
    setDeletingPatientId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPatientId) return;

    try {
      const response = await fetch(`api/patients/${deletingPatientId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setPatients(
          patients.filter((patient) => patient.id !== deletingPatientId)
        );
      }
    } catch (error) {
      console.error("Error deleting patient", error);
    } finally {
      setOpenDeleteModal(false);
      setDeletingPatientId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPatient) return;

    const payload = { ...selectedPatient, ...updatedPatient };
    try {
      const response = await fetch(`api/patients/${selectedPatient.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setPatients(
          patients.map((patient) =>
            patient.id === updatedData.id ? updatedData : patient
          )
        );
        setOpenEditModal(false);
      }
    } catch (error) {
      console.error("Error updating patient", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "first_name", headerName: "First Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone Number", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "emergency_contact", headerName: "Emergency Contact", flex: 1 },
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
        <Box m="20px">
          <Header title="PATIENTS" subtitle="Managing the Patients" />
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
              <DataGrid checkboxSelection rows={patients} columns={columns} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        aria-labelledby="edit-patient-modal"
        aria-describedby="edit-patient-details"
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
            Edit Patient
          </Typography>
          <TextField
            label="First Name"
            value={updatedPatient.first_name || ""}
            onChange={(e) =>
              setUpdatedPatient({
                ...updatedPatient,
                first_name: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            value={updatedPatient.last_name || ""}
            onChange={(e) =>
              setUpdatedPatient({
                ...updatedPatient,
                last_name: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone Number"
            value={updatedPatient.phone || ""}
            onChange={(e) =>
              setUpdatedPatient({ ...updatedPatient, phone: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={updatedPatient.email || ""}
            onChange={(e) =>
              setUpdatedPatient({ ...updatedPatient, email: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Gender"
            value={updatedPatient.gender || ""}
            onchannge={(e) =>
              setUpdatedPatient({ ...updatedPatient, gender: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Emergency Contact"
            value={updatedPatient.emergency_contact || ""}
            onChange={(e) =>
              setUpdatedPatient({
                ...updatedPatient,
                emergency_contact: e.target.value,
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
          setDeletingPatientId(null);
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
            Are you sure you want to delete this patient? This action cannot be
            undone.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
                setDeletingPatientId(null);
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

export default Patients;
