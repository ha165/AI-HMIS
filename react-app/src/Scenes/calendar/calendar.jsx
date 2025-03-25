import { useState, useEffect, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  Alert,
  Chip,
} from "@mui/material";
import Header from "../../Components/Header";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import { tokens } from "../../../themes";
import fetchWrapper from "../../Context/fetchwrapper";
import { AppContext } from "../../Context/AppContext";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [events, setEvents] = useState([]);
  const { user, loading } = useContext(AppContext);
  const [accessLevel, setAccessLevel] = useState(null);

  // Check user role
  useEffect(() => {
    if (user) {
      if (user.role === "doctor") {
        setAccessLevel("doctor");
        fetchSchedules(user.id); // Fetch only this doctor's schedules
      } else if (user.role === "admin") {
        setAccessLevel("admin");
        fetchAllSchedules(); // Fetch all doctors' schedules
      }
    }
  }, [user]);

  const fetchSchedules = (doctorId) => {
    fetchWrapper(`/schedules?doctor_id=${doctorId}`)
      .then((response) => response.json())
      .then((data) => formatEvents(data));
  };

  const fetchAllSchedules = () => {
    fetchWrapper("/schedules")
      .then((response) => response.json())
      .then((data) => formatEvents(data));
  };

  const formatEvents = (data) => {
    setEvents(
      data.map((event) => ({
        id: event.id,
        title: `${event.doctor_name || "Doctor"}: ${
          event.notes || "Appointment"
        }`,
        start: event.start_time,
        end: event.end_time,
        doctorId: event.doctor_id,
      }))
    );
  };

  // Handle event creation
  const handleDateClick = async (selected) => {
    if (accessLevel !== "doctor") return;

    const title = prompt("Enter appointment notes:");
    if (!title) return;

    const newEvent = {
      doctor_id: user.id,
      start_time: selected.startStr,
      end_time: selected.endStr || selected.startStr,
      notes: title,
    };

    try {
      const response = await fetchWrapper("/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      const savedEvent = await response.json();
      setEvents([
        ...events,
        {
          id: savedEvent.id,
          title: `${user.name}: ${title}`,
          start: savedEvent.start_time,
          end: savedEvent.end_time,
          doctorId: user.id,
        },
      ]);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // Handle event deletion
  const handleEventClick = async (selected) => {
    if (accessLevel !== "doctor") return;

    if (selected.event.extendedProps.doctorId !== user.id) {
      alert("You can only delete your own appointments");
      return;
    }

    if (window.confirm(`Delete this appointment: ${selected.event.title}?`)) {
      try {
        await fetchWrapper(`/schedules/${selected.event.id}`, {
          method: "DELETE",
        });
        setEvents(events.filter((event) => event.id !== selected.event.id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (!accessLevel) {
    return (
      <Box display="flex" height="100vh" flexDirection="column">
        <Topbar />
        <Box display="flex" flex="1">
          <Sidebar />
          <Box flex="1" p="20px">
            <Header title="Calendar" />
            <Alert severity="error" sx={{ mt: 2 }}>
              {user
                ? "Your role doesn't have calendar access"
                : "Please log in to access the calendar"}
            </Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" height="100vh" flexDirection="column">
      <Topbar />
      <Box display="flex" flex="1">
        <Sidebar />
        <Box flex="1" p="20px">
          <Header
            title={
              accessLevel === "admin"
                ? "All Doctors' Schedules"
                : "My Appointment Calendar"
            }
            subtitle={
              <>
                {accessLevel === "admin" && (
                  <Chip
                    label="View Only Mode"
                    color="info"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </>
            }
          />

          <Box display="flex" justifyContent="space-between">
            <Box
              flex="1 1 20%"
              backgroundColor={colors.primary[400]}
              p="15px"
              borderRadius="4px"
            >
              <Typography variant="h5">
                {accessLevel === "admin"
                  ? "All Appointments"
                  : "My Appointments"}
              </Typography>
              <List>
                {events.map((event) => (
                  <ListItem
                    key={event.id}
                    sx={{
                      backgroundColor: colors.greenAccent[500],
                      margin: "10px 0",
                      borderRadius: "2px",
                    }}
                  >
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <Typography>
                          {formatDate(event.start, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box flex="1 1 100%" ml="15px">
              <FullCalendar
                height="75vh"
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                }}
                initialView="dayGridMonth"
                selectable={accessLevel === "doctor"}
                select={handleDateClick}
                events={events}
                eventClick={handleEventClick}
                selectMirror={true}
                editable={accessLevel === "doctor"}
                eventDisplay="block"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
