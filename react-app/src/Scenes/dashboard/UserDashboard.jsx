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
  Scale,
  Receipt,
  EmergencyShare,
  ArrowUpward,
  ArrowDownward,
  TrendingFlat,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import fetchWrapper from "../../Context/fetchWrapper";

const UserDashboard = () => {
  const theme = useTheme();

  // Safely get colors with fallbacks
  const getColor = (colorPath, fallback) => {
    try {
      const path = colorPath.split(".");
      let result = tokens(theme.palette.mode);
      for (const part of path) {
        result = result[part];
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
      600: getColor("primary.600", "#115293"),
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
      400: getColor("grey.400", "#9e9e9e"),
    },
  };

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    patient: null,
    upcomingAppointments: [],
    recentMedicalRecords: [],
    activePrescriptions: [],
    paymentHistory: [],
    healthMetrics: {},
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchWrapper("/patient-dashboard");
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
    switch (status?.toLowerCase()) {
      case "completed":
      case "active":
      case "confirmed":
        return colors.greenAccent[500];
      case "pending":
        return colors.yellowAccent[500];
      case "cancelled":
      case "failed":
        return colors.redAccent[500];
      default:
        return colors.blueAccent[500];
    }
  };

  const renderTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <ArrowUpward color="error" fontSize="small" />;
      case "down":
        return <ArrowDownward color="success" fontSize="small" />;
      default:
        return <TrendingFlat color="info" fontSize="small" />;
    }
  };

  if (loading) {
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
          {/* Header Section */}
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
              title="MY HEALTH DASHBOARD"
              subtitle={`Welcome back, ${
                dashboardData.patient?.user?.first_name || "Patient"
              }`}
              subtitleColor={colors.greenAccent[400]}
            />
            <Box>
              <Button
                variant="contained"
                sx={{
                  mr: 2,
                  bgcolor: colors.blueAccent[500],
                  "&:hover": { bgcolor: colors.blueAccent[600] },
                }}
              >
                <Link to="/add-appointment"> Book Appointment</Link>
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: colors.redAccent[500],
                  "&:hover": { bgcolor: colors.redAccent[600] },
                }}
              >
                <EmergencyShare sx={{ mr: 1 }} />
                <Link to="/emergency-contact">Emergency Help</Link>
              </Button>
            </Box>
          </Box>

          {/* Quick Stats Cards */}
          <Grid container spacing={3} mb={3}>
            {[
              {
                title: "Upcoming Appointments",
                value: dashboardData.upcomingAppointments.length,
                icon: <CalendarToday sx={{ color: colors.blueAccent[500] }} />,
                color: colors.blueAccent[500],
              },
              {
                title: "Active Prescriptions",
                value: dashboardData.activePrescriptions.length,
                icon: <Medication sx={{ color: colors.greenAccent[500] }} />,
                color: colors.greenAccent[500],
              },
              {
                title: "Recent Payments",
                value: dashboardData.paymentHistory.length,
                icon: <Receipt sx={{ color: colors.yellowAccent[500] }} />,
                color: colors.yellowAccent[500],
              },
              {
                title: "Medical Records",
                value: dashboardData.recentMedicalRecords.length,
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

          {/* Main Content Sections */}
          <Grid container spacing={3}>
            {/* Upcoming Appointments */}
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
                    <List sx={{ p: 0 }}>
                      {dashboardData.upcomingAppointments
                        .slice(0, 3)
                        .map((appointment) => (
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
                                  sx={{
                                    bgcolor: `${colors.blueAccent[500]}20`,
                                  }}
                                >
                                  <CalendarToday
                                    sx={{ color: colors.blueAccent[500] }}
                                  />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography sx={{ fontWeight: 600 }}>
                                    {format(
                                      new Date(appointment.appointment_date),
                                      "PPPP p"
                                    )}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      display="block"
                                    >
                                      Dr. {appointment.doctor?.user?.first_name}{" "}
                                      {appointment.doctor?.user.last_name}
                                    </Typography>
                                    <Typography component="span">
                                      {appointment.service?.name}
                                    </Typography>
                                  </>
                                }
                              />
                              <Chip
                                label={appointment.status}
                                sx={{
                                  bgcolor: `${getStatusColor(
                                    appointment.status
                                  )}20`,
                                  color: getStatusColor(appointment.status),
                                  fontWeight: 600,
                                }}
                              />
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
                        sx={{ fontSize: 60, color: colors.grey[400], mb: 1 }}
                      />
                      <Typography color="textSecondary">
                        No upcoming appointments
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Health Metrics */}
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Health Metrics
                  </Typography>
                  <Divider sx={{ mb: 2, bgcolor: colors.primary[700] }} />
                  <Grid container spacing={2}>
                    {dashboardData.healthMetrics &&
                      Object.entries(dashboardData.healthMetrics).map(
                        ([metric, data]) => (
                          <Grid item xs={12} sm={6} key={metric}>
                            <Card
                              variant="outlined"
                              sx={{ borderColor: colors.primary[700] }}
                            >
                              <CardContent>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                >
                                  <Box>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {metric.replace(/_/g, " ")}
                                    </Typography>
                                    <Typography
                                      variant="h4"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      {data.value}
                                      <Typography
                                        component="span"
                                        sx={{
                                          fontSize: "0.8rem",
                                          ml: "4px",
                                          color: colors.grey[400],
                                        }}
                                      >
                                        {data.unit}
                                      </Typography>
                                    </Typography>
                                  </Box>
                                  <Box>
                                    {data.trend && renderTrendIcon(data.trend)}
                                  </Box>
                                </Box>
                                {data.trend && (
                                  <Box mt={1}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={data.trend === "up" ? 75 : 25}
                                      sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: colors.primary[700],
                                        "& .MuiLinearProgress-bar": {
                                          bgcolor:
                                            data.trend === "up"
                                              ? colors.redAccent[500]
                                              : colors.greenAccent[500],
                                        },
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {data.trend === "up" ? "↑" : "↓"}{" "}
                                      {data.change} {data.unit} from last visit
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        )
                      )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Active Prescriptions */}
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
                      Active Prescriptions
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
                  {dashboardData.activePrescriptions.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Medication
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Dosage
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Refills
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Status
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.activePrescriptions
                            .slice(0, 3)
                            .map((prescription) => (
                              <TableRow key={prescription.id}>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    <Medication
                                      sx={{
                                        color: colors.greenAccent[500],
                                        mr: 1,
                                      }}
                                    />
                                    {prescription.medication}
                                  </Box>
                                </TableCell>
                                <TableCell>{prescription.dosage}</TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    <Box
                                      sx={{
                                        width: "100%",
                                        maxWidth: "60px",
                                        bgcolor: colors.primary[700],
                                        borderRadius: "4px",
                                      }}
                                    >
                                      <LinearProgress
                                        variant="determinate"
                                        value={
                                          (prescription.refills_left / 5) * 100
                                        }
                                        sx={{
                                          height: 8,
                                          bgcolor: colors.primary[600],
                                          "& .MuiLinearProgress-bar": {
                                            bgcolor: colors.greenAccent[500],
                                          },
                                        }}
                                      />
                                    </Box>
                                    <Typography sx={{ ml: 1 }}>
                                      {prescription.refills_left}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={prescription.status}
                                    size="small"
                                    sx={{
                                      bgcolor: `${getStatusColor(
                                        prescription.status
                                      )}20`,
                                      color: getStatusColor(
                                        prescription.status
                                      ),
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
                      <Medication
                        sx={{ fontSize: 60, color: colors.grey[400], mb: 1 }}
                      />
                      <Typography color="textSecondary">
                        No active prescriptions
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Payment History */}
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
                      Payment History
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
                  {dashboardData.paymentHistory.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {dashboardData.paymentHistory
                        .slice(0, 3)
                        .map((payment) => (
                          <Card
                            key={payment.id}
                            sx={{
                              mb: 2,
                              bgcolor: colors.primary[700],
                              boxShadow: "none",
                            }}
                          >
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    bgcolor: `${getStatusColor(
                                      payment.payment_status
                                    )}20`,
                                    color: getStatusColor(
                                      payment.payment_status
                                    ),
                                  }}
                                >
                                  <Receipt />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography sx={{ fontWeight: 600 }}>
                                    KES {payment.amount}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      display="block"
                                    >
                                      {payment.service?.name}
                                    </Typography>
                                    <Typography component="span">
                                      {format(
                                        new Date(payment.payment_date),
                                        "PP"
                                      )}
                                    </Typography>
                                  </>
                                }
                              />
                              <Chip
                                label={payment.payment_status}
                                sx={{
                                  bgcolor: `${getStatusColor(
                                    payment.payment_status
                                  )}20`,
                                  color: getStatusColor(payment.payment_status),
                                  fontWeight: 600,
                                }}
                              />
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
                      <Receipt
                        sx={{ fontSize: 60, color: colors.grey[400], mb: 1 }}
                      />
                      <Typography color="textSecondary">
                        No payment history
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Medical Records */}
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
                      Recent Medical Records
                    </Typography>
                    <Button
                      size="medium"
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
                  {dashboardData.recentMedicalRecords.length > 0 ? (
                    <TableContainer
                      component={Paper}
                      sx={{ bgcolor: colors.primary[700] }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Doctor
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Diagnosis
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.recentMedicalRecords
                            .slice(0, 3)
                            .map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>
                                  {format(new Date(record.created_at), "PP")}
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    <Avatar
                                      sx={{
                                        width: 30,
                                        height: 30,
                                        mr: 1,
                                        bgcolor: colors.blueAccent[500],
                                      }}
                                    >
                                      {record.doctor?.user?.name?.charAt(0)}
                                    </Avatar>
                                    Dr. {record.doctor?.user?.name}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>
                                  {record.diagnosis || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="small"
                                    sx={{
                                      color: colors.blueAccent[500],
                                      fontWeight: 600,
                                    }}
                                  >
                                    View Details
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
                      <MedicalServices
                        sx={{ fontSize: 60, color: colors.grey[400], mb: 1 }}
                      />
                      <Typography color="textSecondary">
                        No medical records found
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

export default UserDashboard;
