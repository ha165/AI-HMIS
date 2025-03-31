import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  Card,
  CardContent,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  CircularProgress
} from "@mui/material";
import {
  CalendarToday,
  MedicalServices,
  Medication,
  MonitorHeart,
  Scale,
  EmergencyShare,
  VideoCall,
  Chat,
  LocalHospital,
  Receipt,
  Assignment,
  History,
  Insights
} from "@mui/icons-material";
import { tokens } from "../../../themes";
import Header from "../../components/Header";
import Sidebar from "../global/SideBar";
import Topbar from "../global/TopBar";
import fetchWrapper from "../../Context/fetchWrapper";
import { format } from "date-fns";

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
    healthMetrics: {}
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all dashboard data in parallel
        const [patient, appointments, medicalRecords, payments] = await Promise.all([
          fetchWrapper('/patients/me'),
          fetchWrapper('/appointments/upcoming'),
          fetchWrapper('/medical-records/recent'),
          fetchWrapper('/payments/history')
        ]);

        // Extract prescriptions from medical records
        const activePrescriptions = medicalRecords
          .flatMap(record => record.prescription ? JSON.parse(record.prescription) : [])
          .filter(prescription => prescription.status === 'active');

        // Process health metrics from medical records
        const healthMetrics = medicalRecords.reduce((acc, record) => {
          if (record.vital_signs) {
            const vitals = JSON.parse(record.vital_signs);
            return {
              ...acc,
              bloodPressure: vitals.blood_pressure || acc.bloodPressure,
              weight: vitals.weight || acc.weight,
              height: vitals.height || acc.height,
              bmi: vitals.bmi || acc.bmi
            };
          }
          return acc;
        }, {});

        setDashboardData({
          patient,
          upcomingAppointments: appointments,
          recentMedicalRecords: medicalRecords.slice(0, 3),
          activePrescriptions,
          paymentHistory: payments.slice(0, 5),
          healthMetrics
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" height="100vh">
        <Sidebar />
        <Box flex="1" display="flex" justifyContent="center" alignItems="center">
          <CircularProgress color="secondary" />
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" height="100vh">
      {/* SIDEBAR */}
      <Sidebar />

      <Box flex="1" display="flex" flexDirection="column">
        {/* TOPBAR */}
        <Topbar />

        {/* MAIN CONTENT */}
        <Box m="20px" sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
          {/* HEADER */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Header 
              title={`Welcome, ${dashboardData.patient?.user?.name || 'Patient'}`} 
              subtitle="Your personal health dashboard" 
            />
            <Box display="flex" gap={2}>
              <Button variant="contained" color="secondary" startIcon={<EmergencyShare />}>
                Emergency
              </Button>
              <Button variant="outlined" startIcon={<VideoCall />}>
                Start Telemedicine
              </Button>
            </Box>
          </Box>

          {/* QUICK STATS GRID */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<CalendarToday sx={{ color: colors.greenAccent[500] }} />}
                title="Upcoming Appointments"
                value={dashboardData.upcomingAppointments.length}
                color={colors.greenAccent[500]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<MedicalServices sx={{ color: colors.blueAccent[500] }} />}
                title="Active Prescriptions"
                value={dashboardData.activePrescriptions.length}
                color={colors.blueAccent[500]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<Assignment sx={{ color: colors.redAccent[500] }} />}
                title="Medical Records"
                value={dashboardData.recentMedicalRecords.length}
                color={colors.redAccent[500]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<Receipt sx={{ color: colors.yellowAccent[500] }} />}
                title="Pending Payments"
                value={dashboardData.paymentHistory.filter(p => p.payment_status === 'pending').length}
                color={colors.yellowAccent[500]}
              />
            </Grid>
          </Grid>

          {/* MAIN CONTENT GRID */}
          <Grid container spacing={3}>
            {/* UPCOMING APPOINTMENTS */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight="bold">
                      Upcoming Appointments
                    </Typography>
                    <Button size="small" color="primary">View All</Button>
                  </Box>
                  {dashboardData.upcomingAppointments.length > 0 ? (
                    <List>
                      {dashboardData.upcomingAppointments.slice(0, 3).map(appointment => (
                        <React.Fragment key={appointment.id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: colors.blueAccent[500] }}>
                                <CalendarToday />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={format(new Date(appointment.appointment_date), 'PPPP p')}
                              secondary={`Dr. ${appointment.doctor?.user?.name} - ${appointment.service?.name}`}
                            />
                            <Chip 
                              label={appointment.status} 
                              color={
                                appointment.status === 'confirmed' ? 'success' : 
                                appointment.status === 'pending' ? 'warning' : 'default'
                              }
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                      No upcoming appointments
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* HEALTH METRICS */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" mb={2}>
                    Health Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MetricItem
                        icon={<MonitorHeart />}
                        title="Blood Pressure"
                        value={dashboardData.healthMetrics.bloodPressure || '--/--'}
                        unit="mmHg"
                        color={colors.greenAccent[500]}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <MetricItem
                        icon={<Scale />}
                        title="Weight"
                        value={dashboardData.healthMetrics.weight || '--'}
                        unit="kg"
                        color={colors.blueAccent[500]}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <MetricItem
                        icon={<Insights />}
                        title="BMI"
                        value={dashboardData.healthMetrics.bmi || '--'}
                        unit=""
                        color={
                          dashboardData.healthMetrics.bmi > 25 ? colors.redAccent[500] : 
                          dashboardData.healthMetrics.bmi > 18.5 ? colors.greenAccent[500] : 
                          colors.yellowAccent[500]
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <MetricItem
                        icon={<MedicalServices />}
                        title="Last Checkup"
                        value={
                          dashboardData.recentMedicalRecords[0] ? 
                          format(new Date(dashboardData.recentMedicalRecords[0].created_at), 'MMM d') : 
                          'Never'
                        }
                        unit=""
                        color={colors.purpleAccent[500]}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* ACTIVE PRESCRIPTIONS */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight="bold">
                      Active Prescriptions
                    </Typography>
                    <Button size="small" color="primary">View All</Button>
                  </Box>
                  {dashboardData.activePrescriptions.length > 0 ? (
                    <List>
                      {dashboardData.activePrescriptions.slice(0, 3).map((prescription, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: colors.redAccent[500] }}>
                                <Medication />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={prescription.medication}
                              secondary={`${prescription.dosage} - ${prescription.frequency}`}
                            />
                            <Chip 
                              label={`Refills: ${prescription.refills_left}`} 
                              variant="outlined"
                            />
                          </ListItem>
                          {index < dashboardData.activePrescriptions.length - 1 && (
                            <Divider variant="inset" component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                      No active prescriptions
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* RECENT PAYMENTS */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight="bold">
                      Recent Payments
                    </Typography>
                    <Button size="small" color="primary">View All</Button>
                  </Box>
                  {dashboardData.paymentHistory.length > 0 ? (
                    <List>
                      {dashboardData.paymentHistory.map(payment => (
                        <React.Fragment key={payment.id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: colors.yellowAccent[500] }}>
                                <Receipt />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`KES ${payment.amount}`}
                              secondary={`${payment.service?.name} - ${format(new Date(payment.payment_date), 'PP')}`}
                            />
                            <Chip 
                              label={payment.payment_status} 
                              color={
                                payment.payment_status === 'completed' ? 'success' :
                                payment.payment_status === 'pending' ? 'warning' :
                                payment.payment_status === 'failed' ? 'error' : 'default'
                              }
                              size="small"
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                      No payment history
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* QUICK ACTIONS FAB */}
          <Box sx={{ position: 'fixed', bottom: 32, right: 32 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<VideoCall />}
              sx={{
                borderRadius: '50px',
                padding: '12px 24px',
                boxShadow: 3
              }}
            >
              Quick Consult
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, title, value, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={1}>
        <Box mr={2} color={color}>
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight="bold" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// Reusable Metric Item Component
const MetricItem = ({ icon, title, value, unit, color }) => (
  <Box display="flex" alignItems="center" p={2} sx={{ bgcolor: `${color}10`, borderRadius: 2 }}>
    <Box mr={2} color={color}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {value} {unit && <Typography component="span" variant="body2" color="text.secondary">{unit}</Typography>}
      </Typography>
    </Box>
  </Box>
);

export default UserDashboard;