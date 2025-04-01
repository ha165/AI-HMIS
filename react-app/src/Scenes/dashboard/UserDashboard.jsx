import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
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
  VideoCall,
  Chat,
  LocalHospital,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import fetchWrapper from "../../Context/fetchWrapper";

const UserDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
        const data = await fetchWrapper("/patient-dashboard",);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
    <Box display="flex">
      {/* SIDEBAR */}
      <Sidebar />

      <Box flex="1">
        {/* TOPBAR */}
        <Topbar />

        {/* CONTENT */}
        <Box m="20px">
          {/* HEADER */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="20px"
          >
            <Header
              title="DASHBOARD"
              subtitle={`Welcome back, ${
                dashboardData.patient?.user?.name || "Patient"
              }`}
            />
            <Box>
              <Button variant="contained" color="secondary" sx={{ mr: 2 }}>
                Book Appointment
              </Button>
              <Button variant="outlined">Emergency Help</Button>
            </Box>
          </Box>

          {/* QUICK STATS */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Upcoming Appointments
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.upcomingAppointments.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Active Prescriptions
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.activePrescriptions.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Recent Payments
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.paymentHistory.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Medical Records
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.recentMedicalRecords.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* MAIN CONTENT */}
          <Grid container spacing={3}>
            {/* UPCOMING APPOINTMENTS */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Upcoming Appointments</Typography>
                    <Button size="small">View All</Button>
                  </Box>
                  {dashboardData.upcomingAppointments.length > 0 ? (
                    <List>
                      {dashboardData.upcomingAppointments
                        .slice(0, 3)
                        .map((appointment) => (
                          <ListItem key={appointment.id}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: colors.primary[500] }}>
                                <CalendarToday />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={format(
                                new Date(appointment.appointment_date),
                                "PPPP p"
                              )}
                              secondary={`Dr. ${appointment.doctor?.user?.name} - ${appointment.service?.name}`}
                            />
                            <Chip
                              label={appointment.status}
                              color={
                                appointment.status === "confirmed"
                                  ? "success"
                                  : appointment.status === "pending"
                                  ? "warning"
                                  : "default"
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Typography>No upcoming appointments</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* HEALTH METRICS */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Health Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    {dashboardData.healthMetrics &&
                      Object.entries(dashboardData.healthMetrics).map(
                        ([metric, value]) => (
                          <Grid item xs={6} key={metric}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography
                                  variant="subtitle2"
                                  color="textSecondary"
                                >
                                  {metric.replace(/_/g, " ").toUpperCase()}
                                </Typography>
                                <Typography variant="h5">
                                  {value.value}
                                  {value.unit && (
                                    <span
                                      style={{
                                        fontSize: "0.8rem",
                                        marginLeft: "4px",
                                      }}
                                    >
                                      {value.unit}
                                    </span>
                                  )}
                                </Typography>
                                {value.trend && (
                                  <Typography
                                    variant="caption"
                                    color={
                                      value.trend === "up" ? "error" : "success"
                                    }
                                  >
                                    {value.trend === "up" ? "↑" : "↓"}{" "}
                                    {value.change}
                                  </Typography>
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

            {/* ACTIVE PRESCRIPTIONS */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Active Prescriptions</Typography>
                    <Button size="small">View All</Button>
                  </Box>
                  {dashboardData.activePrescriptions.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Medication</TableCell>
                            <TableCell>Dosage</TableCell>
                            <TableCell>Refills</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.activePrescriptions
                            .slice(0, 3)
                            .map((prescription) => (
                              <TableRow key={prescription.id}>
                                <TableCell>{prescription.medication}</TableCell>
                                <TableCell>{prescription.dosage}</TableCell>
                                <TableCell>
                                  {prescription.refills_left}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={prescription.status}
                                    size="small"
                                    color={
                                      prescription.status === "active"
                                        ? "success"
                                        : "default"
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>No active prescriptions</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* PAYMENT HISTORY */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Recent Payments</Typography>
                    <Button size="small">View All</Button>
                  </Box>
                  {dashboardData.paymentHistory.length > 0 ? (
                    <List>
                      {dashboardData.paymentHistory
                        .slice(0, 3)
                        .map((payment) => (
                          <ListItem key={payment.id}>
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor:
                                    payment.payment_status === "completed"
                                      ? colors.greenAccent[500]
                                      : colors.redAccent[500],
                                }}
                              >
                                <Receipt />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`KES ${payment.amount}`}
                              secondary={`${payment.service?.name} - ${format(
                                new Date(payment.payment_date),
                                "PP"
                              )}`}
                            />
                            <Chip
                              label={payment.payment_status}
                              color={
                                payment.payment_status === "completed"
                                  ? "success"
                                  : payment.payment_status === "pending"
                                  ? "warning"
                                  : "error"
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Typography>No payment history</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* MEDICAL RECORDS */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Recent Medical Records</Typography>
                    <Button size="small">View All</Button>
                  </Box>
                  {dashboardData.recentMedicalRecords.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Doctor</TableCell>
                            <TableCell>Diagnosis</TableCell>
                            <TableCell>Treatment</TableCell>
                            <TableCell>Actions</TableCell>
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
                                  Dr. {record.doctor?.user?.name}
                                </TableCell>
                                <TableCell>
                                  {record.diagnosis || "N/A"}
                                </TableCell>
                                <TableCell>
                                  {record.treatment_plan
                                    ? record.treatment_plan.substring(0, 50) +
                                      "..."
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Button size="small">View Details</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>No medical records found</Typography>
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
