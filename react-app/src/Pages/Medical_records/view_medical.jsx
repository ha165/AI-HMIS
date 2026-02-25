import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { format } from "date-fns";
import fetchWrapper from "../../Context/fetchwrapper";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewMedicalRecord = () => {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      try {
        const data = await fetchWrapper(
          `/medical-records/${id}?expand=patient,doctor,appointment`
        );
        console.log("API Response:", data);
        if (!data) {
          throw new Error("Medical record not found");
          toast.error("Medical Records not found");
        }
        setRecord(data);
      } catch (err) {
        setError(err.message || "Failed to fetch medical record");
        if (err.message.includes("404")) {
          navigate("/medical-records", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecord();
  }, [id, navigate]);

  if (loading) {
    return (
      <Box display="flex" height="100vh">
        <Sidebar />
        <Box flex="1" display="flex" flexDirection="column">
          <Topbar />
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" height="100vh">
        <Sidebar />
        <Box flex="1" display="flex" flexDirection="column">
          <Topbar />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Alert severity="error">{error}</Alert>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Container>
        </Box>
      </Box>
    );
  }

  if (!record) {
    return (
      <Box display="flex" height="100vh">
        <Sidebar />
        <Box flex="1" display="flex" flexDirection="column">
          <Topbar />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Alert severity="warning">
              No medical record found with ID: {id}
            </Alert>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate("/medical-records")}
            >
              View All Records
            </Button>
          </Container>
        </Box>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    return dateString ? format(new Date(dateString), "PPpp") : "N/A";
  };

  const renderJsonData = (data) => {
    if (!data) return "N/A";

    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableBody>
              {Object.entries(parsedData).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell sx={{ fontWeight: "bold" }}>{key}</TableCell>
                  <TableCell>{value || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    } catch (e) {
      return data;
    }
  };

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Topbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Medical Record Details (Patient: {record.patient_name})
              </Typography>

              <Chip
                label={record.status.toUpperCase()}
                color={record.status === "finalized" ? "success" : "warning"}
                sx={{ mb: 3 }}
              />

              {/* Patient Information Section */}
              <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                Patient Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Basic Info</Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Full Name
                          </TableCell>
                          <TableCell>{record.patient_name} </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Date of Birth
                          </TableCell>
                          <TableCell>
                            {formatDate(record.patient_dob)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Gender
                          </TableCell>
                          <TableCell>
                            {record.patient_gender || "N/A"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    Contact Information
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Email
                          </TableCell>
                          <TableCell>{record.patient_email || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Phone
                          </TableCell>
                          <TableCell>{record.patient_phone || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Address
                          </TableCell>
                          <TableCell>
                            {record.patient_address || "N/A"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              {/* Doctor Information Section */}
              <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Doctor Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Professional Info</Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Name
                          </TableCell>
                          <TableCell>{record.doctor_name} </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Specialization
                          </TableCell>
                          <TableCell>
                            {record.doctor_specialization || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            License Number
                          </TableCell>
                          <TableCell>
                            {record.doctor_license_number || "N/A"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    Contact Information
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Email
                          </TableCell>
                          <TableCell>{record.doctor_email || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Phone
                          </TableCell>
                          <TableCell>{record.doctor_phone || "N/A"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              {/* Appointment Information Section */}
              <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Appointment Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Appointment Date
                          </TableCell>
                          <TableCell>
                            {formatDate(record.appointment_date)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Reason
                          </TableCell>
                          <TableCell>
                            {record.appointment_reason || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Status
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                record.appointment_status.toUpperCase() || "N/A"
                              }
                              color={
                                record.appointment?.status === "Completed"
                                  ? "success"
                                  : record.appointment?.status === "Cancelled"
                                    ? "error"
                                    : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              {/* Medical Information Section */}
              <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Medical Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Diagnosis
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "grey.100", mb: 3 }}
                  >
                    {record.diagnosis || "No diagnosis recorded"}
                  </Paper>

                  <Typography variant="h6" gutterBottom>
                    Treatment Plan
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "grey.100", mb: 3 }}
                  >
                    {record.treatment_plan || "No treatment plan recorded"}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Prescription
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "grey.100", mb: 3 }}
                  >
                    {record.prescription || "No prescription recorded"}
                  </Paper>

                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: "grey.100", mb: 3 }}
                  >
                    {record.notes || "No notes recorded"}
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.print()}
                  sx={{ mr: 2 }}
                >
                  Print Record
                </Button>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Back to Records
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default ViewMedicalRecord;
