import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Divider,
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
} from "@mui/material";
import { format } from "date-fns";
import fetchWrapper from "../../Context/fetchWrapper";

const ViewMedicalRecord = () => {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardcoded ID for testing
  const id = 1; // Replace with your actual test record ID

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      try {
        const data = await fetchWrapper(`/medical_records/${id}`);
        if (!data) {
          throw new Error("Medical record not found");
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
      <Container
        maxWidth="lg"
        sx={{ display: "flex", justifyContent: "center", mt: 4 }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!record) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">No medical record found with ID: {id}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/medical-records")}
        >
          View All Records
        </Button>
      </Container>
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Medical Record Details (ID: {id})
          </Typography>

          <Chip
            label={record.status.toUpperCase()}
            color={record.status === "finalized" ? "success" : "warning"}
            sx={{ mb: 3 }}
          />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
              <Typography>Patient ID: {record.patient_id}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Doctor Information
              </Typography>
              <Typography>Doctor ID: {record.doctor_id}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Appointment
              </Typography>
              <Typography>
                Appointment ID: {record.appointment_id || "N/A"}
              </Typography>
              <Typography>Created: {formatDate(record.created_at)}</Typography>
              <Typography>
                Last Updated: {formatDate(record.updated_at)}
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            Diagnosis
          </Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.100", mb: 3 }}>
            {record.diagnosis || "No diagnosis recorded"}
          </Paper>

          <Typography variant="h6" gutterBottom>
            Prescription
          </Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.100", mb: 3 }}>
            {record.prescription || "No prescription recorded"}
          </Paper>

          {/* Include other fields as needed */}

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => window.print()}
          >
            Print Record
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ViewMedicalRecord;
