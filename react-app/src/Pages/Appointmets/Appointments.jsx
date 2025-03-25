import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Modal,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { AddCircleOutline } from "@mui/icons-material";
import fetchWrapper from "../../Context/fetchwrapper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokens } from "../../../themes";
import { Link } from "react-router-dom";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";

const Appointments = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { userRole } = useContext(AppContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatedAppointment, setUpdatedAppointment] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Medical Record Modal State
  const [openMedicalRecordModal, setOpenMedicalRecordModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [medicalRecordData, setMedicalRecordData] = useState({
    diagnosis: "",
    prescription: "",
    notes: "",
    vital_signs: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetchWrapper("/patients"),
          fetchWrapper("/doctors"),
        ]);
        setPatients(patientsRes);
        setDoctors(doctorsRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await fetchWrapper("/appointments");
        setAppointments(data);
      } catch (error) {
        toast.error("Error fetching appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setUpdatedAppointment({
      patient_id: appointment.patient_id,
      service_id: appointment.service_id,
      doctor_id: appointment.doctor_id,
      reason: appointment.reason,
      status: appointment.status,
    });
    setOpenEditModal(true);
  };

  const handleDelete = (id) => {
    setDeletingAppointmentId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await fetchWrapper(`/appointments/${deletingAppointmentId}`, {
        method: "DELETE",
      });
      setAppointments(
        appointments.filter((a) => a.id !== deletingAppointmentId)
      );
      toast.success("Appointment deleted successfully!");
    } catch (error) {
      toast.error("Error deleting appointment");
    } finally {
      setOpenDeleteModal(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const updatedData = await fetchWrapper(
        `/appointments/${selectedAppointment.id}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedAppointment),
        }
      );
      setAppointments(
        appointments.map((a) => (a.id === updatedData.id ? updatedData : a))
      );
      toast.success("Appointment updated successfully");
      setOpenEditModal(false);
    } catch (error) {
      toast.error("Error updating appointment");
    }
  };

  const handleComplete = async (appointment) => {
    try {
      // First mark appointment as completed
      await fetchWrapper(`/appointments/${appointment.id}/complete`, {
        method: "POST",
      });

      // Store the completed appointment for medical record
      setCurrentAppointment(appointment);
      setOpenMedicalRecordModal(true);

      // Refresh appointments list
      const updatedAppointments = await fetchWrapper("/appointments");
      setAppointments(updatedAppointments);
    } catch (error) {
      toast.error(error.message || "Failed to complete appointment");
    }
  };

  const handleMedicalRecordSubmit = async () => {
    try {
      // Create/update medical record
      await fetchWrapper("/medical-records", {
        method: "POST",
        body: JSON.stringify({
          appointment_id: currentAppointment.id,
          patient_id: currentAppointment.patient_id,
          doctor_id: currentAppointment.doctor_id,
          ...medicalRecordData,
        }),
      });

      toast.success("Medical record saved successfully");
      setOpenMedicalRecordModal(false);
      setMedicalRecordData({
        diagnosis: "",
        prescription: "",
        notes: "",
        vital_signs: "",
      });
    } catch (error) {
      toast.error("Error saving medical record");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "patient_name", headerName: "Patient Name", flex: 1 },
    { field: "doctor_name", headerName: "Doctor Name", flex: 1 },
    { field: "service_name", headerName: "Service", flex: 1 },
    { field: "appointment_date", headerName: "Date", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Typography
          color={
            params.value === "completed"
              ? "success.main"
              : params.value === "cancelled"
              ? "error.main"
              : "warning.main"
          }
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      renderCell: (params) => {
        const isAdminOrDoctor = ["admin", "doctor"].includes(userRole);
        const canComplete = ["pending", "accepted"].includes(params.row.status);

        return (
          <Box display="flex" gap={1}>
            {/* Edit Button (Admin Only) */}
            {userRole === "admin" && (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleEdit(params.row)}
                sx={{ backgroundColor: colors.blueAccent[600] }}
              >
                Edit
              </Button>
            )}

            {/* Delete Button (Admin Only) */}
            {userRole === "admin" && (
              <Button
                variant="contained"
                size="small"
                color="error"
                onClick={() => handleDelete(params.row.id)}
              >
                Delete
              </Button>
            )}

            {/* Complete Button (Admin/Doctor) */}
            {isAdminOrDoctor && canComplete && (
              <Button
                variant="contained"
                size="small"
                color="success"
                onClick={() => handleComplete(params.row)}
              >
                Complete
              </Button>
            )}

            {/* View Record Button */}
            {params.row.status === "completed" && (
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  navigate(`/medical-records?appointment_id=${params.row.id}`)
                }
              >
                View Record
              </Button>
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
          <Header title="Appointments" subtitle="Manage Appointments" />
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddCircleOutline />}
              component={Link}
              to="/add-appointment"
            >
              Add Appointment
            </Button>
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
              <DataGrid
                rows={appointments}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Appointment Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={3}>
            Edit Appointment
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Patient</InputLabel>
            <Select
              value={updatedAppointment.patient_id || ""}
              onChange={(e) =>
                setUpdatedAppointment({
                  ...updatedAppointment,
                  patient_id: e.target.value,
                })
              }
              label="Patient"
            >
              {patients.map((patient) => (
                <MenuItem key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Doctor</InputLabel>
            <Select
              value={updatedAppointment.doctor_id || ""}
              onChange={(e) =>
                setUpdatedAppointment({
                  ...updatedAppointment,
                  doctor_id: e.target.value,
                })
              }
              label="Doctor"
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Reason"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={updatedAppointment.reason || ""}
            onChange={(e) =>
              setUpdatedAppointment({
                ...updatedAppointment,
                reason: e.target.value,
              })
            }
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={updatedAppointment.status || ""}
              onChange={(e) =>
                setUpdatedAppointment({
                  ...updatedAppointment,
                  status: e.target.value,
                })
              }
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
            <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate}>
              Update
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Confirm Delete
          </Typography>
          <Typography mb={3}>
            Are you sure you want to delete this appointment?
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Medical Record Modal */}
      <Modal
        open={openMedicalRecordModal}
        onClose={() => setOpenMedicalRecordModal(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" mb={3}>
            Medical Record for {currentAppointment?.patient_name}
          </Typography>

          <TextField
            label="Diagnosis"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={medicalRecordData.diagnosis}
            onChange={(e) =>
              setMedicalRecordData({
                ...medicalRecordData,
                diagnosis: e.target.value,
              })
            }
          />

          <TextField
            label="Prescription"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={medicalRecordData.prescription}
            onChange={(e) =>
              setMedicalRecordData({
                ...medicalRecordData,
                prescription: e.target.value,
              })
            }
          />

          <TextField
            label="Vital Signs (JSON)"
            fullWidth
            margin="normal"
            placeholder='{"blood_pressure": "120/80", "heart_rate": 72}'
            value={medicalRecordData.vital_signs}
            onChange={(e) =>
              setMedicalRecordData({
                ...medicalRecordData,
                vital_signs: e.target.value,
              })
            }
          />

          <TextField
            label="Notes"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={medicalRecordData.notes}
            onChange={(e) =>
              setMedicalRecordData({
                ...medicalRecordData,
                notes: e.target.value,
              })
            }
          />

          <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
            <Button onClick={() => setOpenMedicalRecordModal(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleMedicalRecordSubmit}
            >
              Save Medical Record
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Appointments;
