import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Button, TextField, Modal, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../themes";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../Components/Header";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";

const Patients = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false); // Modal state for editing
  const [selectedPatient, setSelectedPatient] = useState(null); // Store selected patient for editing
  const [updatedPatient, setUpdatedPatient] = useState({}); // Store updated patient details

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch("http://localhost:8000/api/patients", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
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
  }, []);

  const handleEdit = (patient) => {
    setSelectedPatient(patient); // Set selected patient to edit
    setOpenEditModal(true); // Open the edit modal
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/patients/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (response.ok) {
        setPatients(patients.filter(patient => patient.id !== id)); // Remove deleted patient from state
      }
    } catch (error) {
      console.error("Error deleting patient", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/patients/${selectedPatient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedPatient),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setPatients(
          patients.map((patient) =>
            patient.id === updatedData.id ? updatedData : patient
          )
        );
        setOpenEditModal(false); // Close modal after successful update
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
              "& .name-column--cell": { color: colors.greenAccent[300] },
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
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
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
            value={updatedPatient.first_name || selectedPatient?.first_name || ""}
            onChange={(e) => setUpdatedPatient({ ...updatedPatient, first_name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            value={updatedPatient.last_name || selectedPatient?.last_name || ""}
            onChange={(e) => setUpdatedPatient({ ...updatedPatient, last_name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone Number"
            value={updatedPatient.phone || selectedPatient?.phone || ""}
            onChange={(e) => setUpdatedPatient({ ...updatedPatient, phone: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={updatedPatient.email || selectedPatient?.email || ""}
            onChange={(e) => setUpdatedPatient({ ...updatedPatient, email: e.target.value })}
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
    </Box>
  );
};

export default Patients;
