import { useState, useEffect } from "react";
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
} from "@mui/material";
import Header from "../../Components/Header";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import { tokens } from "../../../themes";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [events, setEvents] = useState([]);

  // Fetch events from Laravel API
  useEffect(() => {
    fetch("http://localhost:8000/api/schedules")
      .then((response) => response.json())
      .then((data) =>
        setEvents(
          data.map((event) => ({
            id: event.id,
            title: event.notes || "Scheduled Event",
            start: event.start_time,
            end: event.end_time,
          }))
        )
      );
  }, []);

  // Handle event creation
  const handleDateClick = async (selected) => {
    const title = prompt("Enter event notes:");
    if (!title) return;

    const newEvent = {
      doctor_id: 1, // Change this dynamically based on logged-in user
      start_time: selected.startStr,
      end_time: selected.endStr || selected.startStr,
      notes: title,
    };

    const response = await fetch("http://localhost:8000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });

    const savedEvent = await response.json();
    setEvents([
      ...events,
      {
        ...savedEvent,
        title,
        start: savedEvent.start_time,
        end: savedEvent.end_time,
      },
    ]);
  };

  // Handle event deletion
  const handleEventClick = async (selected) => {
    if (!window.confirm(`Delete event: ${selected.event.title}?`)) return;

    await fetch(`http://localhost:8000/api/schedules/${selected.event.id}`, {
      method: "DELETE",
    });

    setEvents(events.filter((event) => event.id !== selected.event.id));
  };

  return (
    <Box display="flex" height="100vh" flexDirection="column">
      {/* Topbar */}
      <Topbar />

      <Box display="flex" flex="1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box flex="1" p="20px">
          <Header title="Calendar" subtitle="Full Calendar Interactive Page" />

          <Box display="flex" justifyContent="space-between">
            {/* Calendar Sidebar - Event List */}
            <Box
              flex="1 1 20%"
              backgroundColor={colors.primary[400]}
              p="15px"
              borderRadius="4px"
            >
              <Typography variant="h5">Events</Typography>
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

            {/* Full Calendar */}
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
                selectable
                select={handleDateClick}
                events={events}
                eventClick={handleEventClick}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
