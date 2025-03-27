import { AppContext } from "../../Context/AppContext";
import { useContext, useState, useEffect } from "react";
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
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatedAppointment, setUpdatedAppointment] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [patientsData, doctorsData] = await Promise.all([
          fetchWrapper("/patients"),
          fetchWrapper("/doctors"),
        ]);
        setPatients(patientsData.data || patientsData);
        setDoctors(doctorsData.data || doctorsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Error loading initial data");
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetchWrapper(
          `/appointments?page=${pagination.page}&per_page=${pagination.pageSize}`
        );
        if (isMounted) {
          setAppointments(response.data || response); // Handle both paginated and non-paginated responses
          setPagination((prev) => ({
            ...prev,
            total: response.pagination?.total || response.length || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Error fetching appointments");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAppointments();

    return () => {
      isMounted = false;
    };
  }, [pagination.page, pagination.pageSize]);

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
    if (!deletingAppointmentId) return;

    try {
      await fetchWrapper(`/appointments/${deletingAppointmentId}`, {
        method: "DELETE",
      });
      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== deletingAppointmentId)
      );
      toast.success("Appointment deleted successfully!");
    } catch (error) {
      console.error("Error deleting appointment", error);
      toast.error("Error deleting appointment");
    } finally {
      setOpenDeleteModal(false);
      setDeletingAppointmentId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAppointment) return;

    const payload = { ...selectedAppointment, ...updatedAppointment };
    try {
      const updatedData = await fetchWrapper(
        `/appointments/${selectedAppointment.id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === updatedData.id ? updatedData : appointment
        )
      );
      toast.success("Appointment updated successfully");
      setOpenEditModal(false);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Error updating appointment");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newPageSize }));
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "patient_name", headerName: "Patient Name", flex: 1 },
    { field: "doctor_name", headerName: "Doctor Name", flex: 1 },
    { field: "service_name", headerName: "Service", flex: 1 },
    { field: "patient_phone", headerName: "Patient No", flex: 1 },
    { field: "doctor_phone", headerName: "Doctor No", flex: 1 },
    { field: "specialization", headerName: "Specialization", flex: 1 },
    { field: "appointment_date", headerName: "Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
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
      ),
    },
  ];

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Topbar />
        <Box m="20px">
          <Header title="Appointments" subtitle="View Your Appointments" />
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
              <DataGrid
                checkboxSelection
                rows={Array.isArray(appointments) ? appointments : []}
                columns={columns}
                pagination
                pageSize={pagination.pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                rowCount={pagination.total}
                paginationMode="server"
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        aria-labelledby="edit-appointment-modal"
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
            value={updatedAppointment.reason || ""}
            onChange={(e) =>
              setUpdatedAppointment({
                ...updatedAppointment,
                reason: e.target.value,
              })
            }
            fullWidth
            multiline
            rows={3}
            margin="normal"
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
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

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
          setDeletingAppointmentId(null);
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
            Are you sure you want to delete this appointment? This action cannot
            be undone.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDeleteModal(false);
                setDeletingAppointmentId(null);
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

export default Appointments;
