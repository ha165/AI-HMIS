import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  LinearProgress,
  Badge,
} from "@mui/material";
import { tokens } from "../../../themes";
import Header from "../../components/Header";
import Sidebar from "../global/SideBar";
import Topbar from "../global/TopBar";
import {
  CalendarToday,
  Medication,
  MonitorHeart,
  MedicalServices,
  People,
  Assignment,
  Notifications,
  Chat,
  VideoCall,
  AccessTime,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import fetchWrapper from "../../Context/fetchWrapper";

const DoctorDashboard = () => {
  const theme = useTheme();

  // Safely get colors with fallbacks
  const getColor = (colorPath, fallback) => {
    try {
      const path = colorPath.split(".");
      let result = tokens(theme.palette.mode);
      for (const part of path) {
        result = result?.[part];
        if (result === undefined) return fallback;
      }
      return result || fallback;
    } catch {
      return fallback;
    }
  };

  // Define color variables with fallbacks
  const colors = {
    primary: {
      400: getColor("primary.400", "#1976d2"),
      500: getColor("primary.500", "#1565c0"),
      600: getColor("primary.600", "#0d47a1"),
      700: getColor("primary.700", "#0d3c61"),
    },
    blueAccent: {
      500: getColor("blueAccent.500", "#2196f3"),
      600: getColor("blueAccent.600", "#0b7dda"),
      700: getColor("blueAccent.700", "#0a6fc9"),
    },
    greenAccent: {
      400: getColor("greenAccent.400", "#4caf50"),
      500: getColor("greenAccent.500", "#3d8b40"),
    },
    redAccent: {
      500: getColor("redAccent.500", "#f44336"),
      600: getColor("redAccent.600", "#d32f2f"),
    },
    yellowAccent: {
      500: getColor("yellowAccent.500", "#ffeb3b"),
    },
    grey: {
      100: getColor("grey.100", "#f5f5f5"),
      300: getColor("grey.300", "#e0e0e0"),
      400: getColor("grey.400", "#bdbdbd"),
    },
  };

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    doctor: null,
    upcomingAppointments: [],
    todaysSchedule: [],
    recentPatients: [],
    pendingTasks: [],
    notifications: [],
    performanceMetrics: {},
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchWrapper("/doctor-dashboard");
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    const defaultColor = colors.blueAccent[500];
    try {
      switch (status?.toLowerCase()) {
        case "completed":
        case "confirmed":
          return colors.greenAccent[500] || defaultColor;
        case "pending":
          return colors.yellowAccent[500] || defaultColor;
        case "cancelled":
        case "no-show":
          return colors.redAccent[500] || defaultColor;
        default:
          return defaultColor;
      }
    } catch {
      return defaultColor;
    }
  };

  const renderTrendIcon = (value, comparisonValue) => {
    if (value > comparisonValue) {
      return <TrendingUp color="error" fontSize="small" />;
    } else if (value < comparisonValue) {
      return <TrendingDown color="success" fontSize="small" />;
    }
    return <TrendingFlat color="info" fontSize="small" />;
  };

  if (loading || !dashboardData.doctor) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box display="flex" bgcolor={colors.primary[400]}>
      <Sidebar />
      <Box flex="1" overflow="auto" height="100vh">
        <Topbar />
        <Box m="20px">
          {/* HEADER */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="20px"
            p="15px"
            borderRadius="4px"
            bgcolor={colors.primary[600]}
          >
            <Header
              title="DOCTOR DASHBOARD"
              subtitle={`Welcome, Dr. ${
                dashboardData.doctor?.user?.first_name || ""
              }`}
              subtitleColor={colors.greenAccent[400]}
            />
            <Box display="flex" alignItems="center">
              <Badge
                badgeContent={dashboardData.notifications.length}
                color="error"
                sx={{ mr: 3 }}
              >
                <Notifications sx={{ color: colors.grey[100] }} />
              </Badge>
              <Button
                variant="contained"
                sx={{
                  bgcolor: colors.blueAccent[600],
                  "&:hover": { bgcolor: colors.blueAccent[700] },
                }}
              >
                Start Teleconsultation
              </Button>
            </Box>
          </Box>

          {/* QUICK STATS */}
          <Grid container spacing={3} mb={3}>
            {[
              {
                title: "Today's Appointments",
                value: dashboardData.todaysSchedule.length,
                icon: <CalendarToday sx={{ color: colors.blueAccent[500] }} />,
                color: colors.blueAccent[500],
              },
              {
                title: "New Patients",
                value: dashboardData.recentPatients.filter((p) => p.isNew)
                  .length,
                icon: <People sx={{ color: colors.greenAccent[500] }} />,
                color: colors.greenAccent[500],
              },
              {
                title: "Pending Tasks",
                value: dashboardData.pendingTasks.length,
                icon: <Assignment sx={{ color: colors.yellowAccent[500] }} />,
                color: colors.yellowAccent[500],
              },
              {
                title: "Patient Satisfaction",
                value: `${dashboardData.performanceMetrics.satisfaction || 0}%`,
                icon: <MedicalServices sx={{ color: colors.redAccent[500] }} />,
                color: colors.redAccent[500],
              },
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    borderLeft: `4px solid ${stat.color}`,
                    boxShadow: 3,
                    transition: "transform 0.3s",
                    "&:hover": { transform: "translateY(-5px)" },
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography
                          variant="h6"
                          color="textSecondary"
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: `${stat.color}20`,
                          width: 56,
                          height: 56,
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* MAIN CONTENT */}
          <Grid container spacing={3}>
            {/* TODAY'S SCHEDULE */}
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Today's Schedule
                    </Typography>
                    <Button
                      size="small"
                      sx={{
                        color: colors.blueAccent[500],
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2, bgcolor: colors.primary[700] }} />
                  {dashboardData.todaysSchedule.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {dashboardData.todaysSchedule.map((appointment) => (
                        <Card
                          key={appointment.id}
                          sx={{
                            mb: 2,
                            borderLeft: `3px solid ${getStatusColor(
                              appointment.status
                            )}`,
                            boxShadow: "none",
                          }}
                        >
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar
                                sx={{ bgcolor: `${colors.blueAccent[500]}20` }}
                              >
                                <AccessTime
                                  sx={{ color: colors.blueAccent[500] }}
                                />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography sx={{ fontWeight: 600 }}>
                                  {format(
                                    new Date(appointment.appointment_date),
                                    "p"
                                  )}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography component="span" display="block">
                                    {appointment.patient?.name ||
                                      "Unknown Patient"}
                                  </Typography>
                                  <Typography component="span">
                                    {appointment.service?.name ||
                                      "General Checkup"}{" "}
                                    -{" "}
                                    {appointment.reason || "No reason provided"}
                                  </Typography>
                                </>
                              }
                            />
                            <Box>
                              <Chip
                                label={appointment.status || "Scheduled"}
                                sx={{
                                  bgcolor: `${getStatusColor(
                                    appointment.status
                                  )}20`,
                                  color: getStatusColor(appointment.status),
                                  fontWeight: 600,
                                  mb: 1,
                                }}
                              />
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: colors.blueAccent[500],
                                  color: colors.blueAccent[500],
                                }}
                              >
                                Start
                              </Button>
                            </Box>
                          </ListItem>
                        </Card>
                      ))}
                    </List>
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      p={3}
                    >
                      <CalendarToday
                        sx={{
                          fontSize: 60,
                          color: colors.grey[400],
                          mb: 1,
                        }}
                      />
                      <Typography color="textSecondary">
                        No appointments scheduled for today
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* RECENT PATIENTS */}
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Recent Patients
                    </Typography>
                    <Button
                      size="small"
                      sx={{
                        color: colors.blueAccent[500],
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2, bgcolor: colors.primary[700] }} />
                  {dashboardData.recentPatients.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Patient
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Last Visit
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Status
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.recentPatients
                            .slice(0, 4)
                            .map((patient) => (
                              <TableRow key={patient.id}>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    <Avatar
                                      src={patient.avatar}
                                      sx={{ width: 32, height: 32, mr: 1 }}
                                    >
                                      {patient.name?.charAt(0) || "P"}
                                    </Avatar>
                                    <Typography sx={{ fontWeight: 500 }}>
                                      {patient.name || "Unknown Patient"}
                                    </Typography>
                                    {patient.isNew && (
                                      <Chip
                                        label="New"
                                        size="small"
                                        sx={{
                                          ml: 1,
                                          bgcolor: `${colors.greenAccent[500]}20`,
                                          color: colors.greenAccent[500],
                                        }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {patient.lastVisit
                                    ? format(new Date(patient.lastVisit), "PP")
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={patient.status || "Active"}
                                    size="small"
                                    sx={{
                                      bgcolor:
                                        patient.status === "Follow-up needed"
                                          ? `${colors.yellowAccent[500]}20`
                                          : `${colors.greenAccent[500]}20`,
                                      color:
                                        patient.status === "Follow-up needed"
                                          ? colors.yellowAccent[500]
                                          : colors.greenAccent[500],
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="small"
                                    sx={{
                                      color: colors.blueAccent[500],
                                      fontWeight: 500,
                                    }}
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      p={3}
                    >
                      <People
                        sx={{
                          fontSize: 60,
                          color: colors.grey[400],
                          mb: 1,
                        }}
                      />
                      <Typography color="textSecondary">
                        No recent patients
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* UPCOMING APPOINTMENTS */}
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Upcoming Appointments
                    </Typography>
                    <Button
                      size="small"
                      sx={{
                        color: colors.blueAccent[500],
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2, bgcolor: colors.primary[700] }} />
                  {dashboardData.upcomingAppointments.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Date & Time
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Patient
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Service
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Status
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.upcomingAppointments
                            .slice(0, 4)
                            .map((appointment) => (
                              <TableRow key={appointment.id}>
                                <TableCell>
                                  {format(
                                    new Date(appointment.appointment_date),
                                    "PP p"
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography sx={{ fontWeight: 500 }}>
                                    {appointment.patient?.name ||
                                      "Unknown Patient"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {appointment.service?.name ||
                                    "General Checkup"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={appointment.status || "Scheduled"}
                                    size="small"
                                    sx={{
                                      bgcolor: `${getStatusColor(
                                        appointment.status
                                      )}20`,
                                      color: getStatusColor(appointment.status),
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      p={3}
                    >
                      <CalendarToday
                        sx={{
                          fontSize: 60,
                          color: colors.grey[400],
                          mb: 1,
                        }}
                      />
                      <Typography color="textSecondary">
                        No upcoming appointments
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* PERFORMANCE METRICS */}
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Performance Metrics
                  </Typography>
                  <Divider sx={{ mb: 2, bgcolor: colors.primary[700] }} />
                  <Grid container spacing={2}>
                    {[
                      {
                        title: "Patient Satisfaction",
                        value:
                          dashboardData.performanceMetrics.satisfaction || 0,
                        unit: "%",
                        icon: (
                          <People sx={{ color: colors.greenAccent[500] }} />
                        ),
                        color: colors.greenAccent[500],
                        trend: renderTrendIcon(
                          dashboardData.performanceMetrics.satisfaction || 0,
                          dashboardData.performanceMetrics
                            .lastMonthSatisfaction || 0
                        ),
                      },
                      {
                        title: "Appointments Completed",
                        value:
                          dashboardData.performanceMetrics
                            .appointmentsCompleted || 0,
                        icon: (
                          <CalendarToday
                            sx={{ color: colors.blueAccent[500] }}
                          />
                        ),
                        color: colors.blueAccent[500],
                        trend: renderTrendIcon(
                          dashboardData.performanceMetrics
                            .appointmentsCompleted || 0,
                          dashboardData.performanceMetrics
                            .lastMonthAppointments || 0
                        ),
                      },
                      {
                        title: "Avg Consultation Time",
                        value:
                          dashboardData.performanceMetrics
                            .avgConsultationTime || 0,
                        unit: "min",
                        icon: (
                          <AccessTime
                            sx={{ color: colors.yellowAccent[500] }}
                          />
                        ),
                        color: colors.yellowAccent[500],
                        trend: renderTrendIcon(
                          dashboardData.performanceMetrics
                            .avgConsultationTime || 0,
                          dashboardData.performanceMetrics
                            .lastMonthConsultationTime || 0
                        ),
                      },
                      {
                        title: "Prescriptions Issued",
                        value:
                          dashboardData.performanceMetrics
                            .prescriptionsIssued || 0,
                        icon: (
                          <Medication sx={{ color: colors.redAccent[500] }} />
                        ),
                        color: colors.redAccent[500],
                        trend: renderTrendIcon(
                          dashboardData.performanceMetrics
                            .prescriptionsIssued || 0,
                          dashboardData.performanceMetrics
                            .lastMonthPrescriptions || 0
                        ),
                      },
                    ].map((metric, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderColor: colors.primary[700],
                            bgcolor: colors.primary[700],
                          }}
                        >
                          <CardContent>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              mb={1}
                            >
                              <Box display="flex" alignItems="center">
                                <Avatar
                                  sx={{
                                    bgcolor: `${metric.color}20`,
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    color: metric.color,
                                  }}
                                >
                                  {metric.icon}
                                </Avatar>
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {metric.title}
                                </Typography>
                              </Box>
                              {metric.trend}
                            </Box>
                            <Typography
                              variant="h3"
                              sx={{ fontWeight: 700, textAlign: "center" }}
                            >
                              {metric.value}
                              {metric.unit && (
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize: "1rem",
                                    ml: "4px",
                                    color: colors.grey[400],
                                  }}
                                >
                                  {metric.unit}
                                </Typography>
                              )}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* PENDING TASKS */}
            <Grid item xs={12}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Pending Tasks
                    </Typography>
                    <Button
                      size="small"
                      sx={{
                        color: colors.blueAccent[500],
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2, bgcolor: colors.primary[700] }} />
                  {dashboardData.pendingTasks.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Patient
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Due Date
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Priority
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.pendingTasks
                            .slice(0, 4)
                            .map((task) => (
                              <TableRow key={task.id}>
                                <TableCell sx={{ fontWeight: 500 }}>
                                  {task.title || "Untitled Task"}
                                </TableCell>
                                <TableCell>
                                  {task.patientName || "No patient assigned"}
                                </TableCell>
                                <TableCell>
                                  {task.dueDate
                                    ? format(new Date(task.dueDate), "PP")
                                    : "No due date"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={task.priority || "Medium"}
                                    size="small"
                                    sx={{
                                      bgcolor:
                                        task.priority === "High"
                                          ? `${colors.redAccent[500]}20`
                                          : `${colors.blueAccent[500]}20`,
                                      color:
                                        task.priority === "High"
                                          ? colors.redAccent[500]
                                          : colors.blueAccent[500],
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="small"
                                    sx={{
                                      color: colors.blueAccent[500],
                                      fontWeight: 600,
                                    }}
                                  >
                                    Complete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      p={3}
                    >
                      <Assignment
                        sx={{
                          fontSize: 60,
                          color: colors.grey[400],
                          mb: 1,
                        }}
                      />
                      <Typography color="textSecondary">
                        No pending tasks
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorDashboard;
