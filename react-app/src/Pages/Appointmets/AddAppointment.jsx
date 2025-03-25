import { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fetchWrapper from "../../Context/fetchwrapper";

const AppointmentBooking = () => {
  const theme = useTheme();
  const colors = theme.palette;
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [reason, setReason] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all active services
  useEffect(() => {
    setIsLoading(true);
    fetchWrapper("/api/services")
      .then(setServices)
      .catch((err) => {
        console.error("Error fetching services:", err);
        toast.error("Failed to load services");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch doctors when service is selected
  useEffect(() => {
    if (!selectedService) return;

    setIsLoading(true);
    fetchWrapper(`/services/${selectedService}/doctors`)
      .then((data) => {
        setDoctors(data);
        setSelectedDoctor("");
        setSchedules([]);
      })
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        toast.error("Failed to load doctors");
      })
      .finally(() => setIsLoading(false));
  }, [selectedService]);

  // Fetch schedules when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;

    setIsLoading(true);
    fetchWrapper(`/doctors/${selectedDoctor}/schedules`)
      .then((data) => {
        setSchedules(data);
        setCalendarEvents(
          data.map((slot) => ({
            id: slot.id,
            title: "Available",
            start: slot.start_time,
            end: slot.end_time,
            backgroundColor: colors.success.main,
            borderColor: colors.success.dark,
          }))
        );
      })
      .catch((err) => {
        console.error("Error fetching schedules:", err);
        toast.error("Failed to load available slots");
      })
      .finally(() => setIsLoading(false));
  }, [selectedDoctor, colors]);

  const handleDateClick = (info) => {
    const clickedSlot = schedules.find(
      (s) =>
        new Date(s.start_time).toISOString() === info.event.start.toISOString()
    );

    if (clickedSlot) {
      setSelectedSchedule(clickedSlot.id);
      toast.info(
        `Selected time slot: ${new Date(
          clickedSlot.start_time
        ).toLocaleString()}`
      );
    }
  };

  const handleSubmit = () => {
    if (!selectedDoctor || !selectedSchedule || !reason) {
      toast.warn("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Booking your appointment...");

    fetchWrapper("/appointments", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: selectedDoctor,
        schedule_id: selectedSchedule,
        service_id: selectedService,
        reason,
        appointment_date: schedules.find((s) => s.id === selectedSchedule)
          ?.start_time,
      }),
    })
      .then((data) => {
        toast.update(toastId, {
          render: `Appointment booked successfully! Confirmation #${data.id}`,
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });

        setSelectedService("");
        setSelectedDoctor("");
        setSelectedSchedule("");
        setReason("");
        setCalendarEvents([]);

        // Redirect after success
        setTimeout(() => {
          navigate("/appointments");
        }, 3000);
      })
      .catch((err) => {
        console.error("Error:", err);
        toast.update(toastId, {
          render: `Failed to book appointment: ${err.message}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Box display="flex" height="100vh">
      <ToastContainer position="top-right" autoClose={5000} />
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Topbar />
        <Box m="20px">
          <Header
            title="Book Appointment"
            subtitle="Schedule with your preferred doctor"
          />
          <Box
            p={4}
            sx={{
              backgroundColor: colors.background.default,
              borderRadius: "10px",
              boxShadow: theme.shadows[3],
            }}
          >
            <Select
              fullWidth
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              displayEmpty
              disabled={isLoading}
            >
              <MenuItem value="" disabled>
                Select Medical Service
              </MenuItem>
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name} ({service.duration_minutes} mins)
                </MenuItem>
              ))}
            </Select>

            {selectedService && (
              <Select
                fullWidth
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                displayEmpty
                disabled={isLoading}
              >
                <MenuItem value="" disabled>
                  Select Doctor
                </MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name} -{" "}
                    {doctor.specialization}
                  </MenuItem>
                ))}
              </Select>
            )}

            {selectedDoctor && (
              <Box mt={4}>
                <Typography variant="h6" mb={2}>
                  Available Time Slots
                </Typography>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  events={calendarEvents}
                  eventClick={handleDateClick}
                  height="500px"
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Reason for Appointment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={3}
              disabled={isLoading}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isLoading || !selectedSchedule || !reason}
            >
              {isLoading ? "Processing..." : "Confirm Appointment"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppointmentBooking;
