import { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppContext } from "../../Context/AppContext";
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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokens } from "../../../themes";
import { Link } from "react-router-dom";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";
import {
  fetchAppointments,
  completeAppointment,
  rescheduleAppointment,
  setPagination,
} from "../../Redux/appointmentsSlice";
import { fetchDoctors, fetchDoctorSchedules } from "../../Redux/doctorsSlice";

const Appointments = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { userRole } = useContext(AppContext); // Get user role from context

  // Redux selectors
  const {
    data: appointments,
    loading,
    pagination,
  } = useSelector((state) => state.appointments);

  const {
    doctors,
    schedules,
    loading: doctorsLoading,
  } = useSelector((state) => state.doctors);

  // Local state
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reason, setReason] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(
      fetchAppointments({
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
    );
  }, [dispatch, pagination.page, pagination.pageSize]);

  // Handlers
  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDoctor(appointment.doctor_id);
    setReason(appointment.reason || "");
    dispatch(fetchDoctorSchedules(appointment.doctor_id));
    setOpenRescheduleModal(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedAppointment || !selectedSchedule) return;

    dispatch(
      rescheduleAppointment({
        id: selectedAppointment.id,
        schedule_id: selectedSchedule,
        reason,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Appointment rescheduled successfully!");
        setOpenRescheduleModal(false);
      })
      .catch((error) => {
        toast.error("Error rescheduling appointment");
        console.error("Error:", error);
      });
  };

  const handleComplete = (id) => {
    dispatch(completeAppointment(id))
      .unwrap()
      .then(() => {
        toast.success("Appointment marked as completed!");
      })
      .catch((error) => {
        toast.error("Error updating appointment");
        console.error("Error:", error);
      });
  };

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ ...pagination, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPagination({ ...pagination, pageSize: newPageSize, page: 0 }));
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
      flex: 1.5,
      renderCell: (params) => {
        const { status, id } = params.row;
        const isPatient = userRole === "patient";
        const isCompleted = status === "Completed";
        const isCancelled = status === "Cancelled";

        return (
          <Box display="flex" gap={1}>
            {isCompleted && (
              <Button
                variant="contained"
                color="info"
                size="small"
                component={Link}
                to={`/appointments/${id}/view`}
              >
                View
              </Button>
            )}
            {!isPatient && !isCompleted && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleComplete(id)}
                disabled={isCancelled}
              >
                Complete
              </Button>
            )}
            {!isCancelled && (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => handleReschedule(params.row)}
                disabled={isCompleted}
              >
                Reschedule
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  const showAddButton = userRole !== "admin";

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Topbar />
        <Box m="20px">
          <Header title="Appointments" subtitle="View Your Appointments" />

          {showAddButton && (
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
          )}

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
                paginationMode="server"
                page={pagination.page}
                pageSize={pagination.pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                rowCount={pagination.total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                disableSelectionOnClick
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Reschedule Modal */}
      <Modal
        open={openRescheduleModal}
        onClose={() => setOpenRescheduleModal(false)}
        aria-labelledby="reschedule-appointment-modal"
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
            width: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" mb={2}>
            Reschedule Appointment
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Doctor</InputLabel>
            <Select
              label="Doctor"
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(e.target.value);
                dispatch(fetchDoctorSchedules(e.target.value));
              }}
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedDoctor && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Available Time Slots</InputLabel>
              <Select
                label="Available Time Slots"
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                disabled={doctorsLoading}
              >
                {schedules.map((schedule) => (
                  <MenuItem key={schedule.id} value={schedule.id}>
                    {new Date(schedule.start_time).toLocaleString()} -{" "}
                    {new Date(schedule.end_time).toLocaleTimeString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Reason for Rescheduling"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />

          <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
            <Button
              variant="outlined"
              onClick={() => setOpenRescheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmReschedule}
              disabled={!selectedSchedule || doctorsLoading}
            >
              {doctorsLoading ? "Loading..." : "Confirm Reschedule"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Appointments;
