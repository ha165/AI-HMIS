import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

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

  // Fetch all active services
  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  // Fetch doctors when service is selected
  useEffect(() => {
    if (!selectedService) return;

    fetch(`/api/services/${selectedService}/doctors`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Doctors data:", data);
        setDoctors(data);
        setSelectedDoctor("");
        setSchedules([]);
      });
  }, [selectedService]);

  // Fetch schedules when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;

    fetch(`/api/doctors/${selectedDoctor}/schedules`)
      .then((res) => res.json())
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
      });
  }, [selectedDoctor, colors]);

  const handleDateClick = (info) => {
    const clickedSlot = schedules.find(
      (s) =>
        new Date(s.start_time).toISOString() === info.event.start.toISOString()
    );

    if (clickedSlot) {
      setSelectedSchedule(clickedSlot.id);
    }
  };

  const handleSubmit = () => {
    fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: selectedDoctor,
        schedule_id: selectedSchedule,
        reason,
        appointment_date: schedules.find((s) => s.id === selectedSchedule)
          ?.start_time,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Appointment booked successfully!");
        // Reset form
        setSelectedService("");
        setSelectedDoctor("");
        setSelectedSchedule("");
        setReason("");
        setCalendarEvents([]);
      })
      .catch((err) => console.error("Error:", err));
  };

  return (
    <Box display="flex" height="100vh">
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
            {/* Service Selection */}
            <Select
              fullWidth
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              displayEmpty
              sx={{
                mt: 2,
                backgroundColor: colors.background.paper,
                "& .MuiSelect-select": {
                  color: colors.text.primary,
                },
              }}
            >
              <MenuItem value="" disabled>
                <Typography color={colors.text.secondary}>
                  Select Medical Service
                </Typography>
              </MenuItem>
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  <Typography>
                    {service.name} ({service.duration_minutes} mins)
                  </Typography>
                </MenuItem>
              ))}
            </Select>

            {/* Doctor Selection */}
            {selectedService && (
              <Select
                fullWidth
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                displayEmpty
                sx={{
                  mt: 2,
                  backgroundColor: colors.background.paper,
                  "& .MuiSelect-select": {
                    color: colors.text.primary,
                  },
                }}
                disabled={!selectedService}
              >
                <MenuItem value="" disabled>
                  <Typography color={colors.text.secondary}>
                    Select Doctor
                  </Typography>
                </MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    <Typography>
                      Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            )}

            {/* Calendar View */}
            {selectedDoctor && (
              <Box mt={4}>
                <Typography variant="h6" mb={2} color={colors.text.primary}>
                  Available Time Slots
                </Typography>
                <Box
                  sx={{
                    "& .fc-header-toolbar": {
                      backgroundColor: colors.primary.main,
                      color: colors.primary.contrastText,
                      p: 1,
                      borderRadius: "4px 4px 0 0",
                    },
                    "& .fc-button": {
                      backgroundColor: colors.primary.main,
                      color: colors.primary.contrastText,
                      borderColor: colors.primary.dark,
                      "&:hover": {
                        backgroundColor: colors.primary.dark,
                      },
                    },
                    "& .fc-daygrid-day": {
                      backgroundColor: colors.background.paper,
                    },
                    "& .fc-day-today": {
                      backgroundColor: `${colors.primary.light} !important`,
                    },
                  }}
                >
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={calendarEvents}
                    eventClick={handleDateClick}
                    height="500px"
                    slotDuration="00:30:00"
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                  />
                </Box>
              </Box>
            )}

            {/* Reason Input */}
            <TextField
              fullWidth
              label="Reason for Appointment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={3}
              sx={{
                mt: 3,
                "& .MuiInputBase-root": {
                  backgroundColor: colors.background.paper,
                },
                "& .MuiInputLabel-root": {
                  color: colors.text.secondary,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: colors.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: colors.primary.main,
                  },
                },
              }}
            />

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!selectedSchedule || !reason}
              sx={{
                mt: 3,
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                "&:disabled": {
                  backgroundColor: colors.action.disabledBackground,
                  color: colors.action.disabled,
                },
              }}
            >
              Confirm Appointment
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppointmentBooking;
