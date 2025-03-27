import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../../themes";
import fetchWrapper from "../../Context/fetchwrapper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MedicalRecords = ({ appointmentId, onComplete }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [record, setRecord] = useState({
    diagnosis: "",
    prescription: "",
    medical_history: "",
    medications: "",
    allergies: "",
    vital_signs: {},
    treatment_plan: "",
    lab_results: {},
    notes: "",
    status: "draft",
  });

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      try {
        const response = await fetchWrapper(
          `/api/appointments/${appointmentId}/medical-record`
        );
        if (response.data) {
          setRecord(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching medical record:", error);
        toast.error("Failed to load medical record");
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchMedicalRecord();
    }
  }, [appointmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleVitalSignChange = (field, value) => {
    setRecord((prev) => ({
      ...prev,
      vital_signs: { ...prev.vital_signs, [field]: value },
    }));
  };

  const handleSubmit = async (finalize = false) => {
    setSubmitting(true);
    try {
      const url = `/api/medical-records${record.id ? `/${record.id}` : ""}`;
      const method = record.id ? "PUT" : "POST";

      const response = await fetchWrapper(url, {
        method,
        body: JSON.stringify({
          ...record,
          appointment_id: appointmentId,
          status: finalize ? "finalized" : "draft",
        }),
      });

      toast.success(
        `Medical record ${finalize ? "finalized" : "saved"} successfully!`
      );
      if (finalize && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error saving medical record:", error);
      toast.error("Failed to save medical record");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Typography variant="h4" mb={2} color={colors.grey[100]}>
        Medical Record
      </Typography>

      <Box
        component="form"
        sx={{
          backgroundColor: colors.primary[400],
          p: 3,
          borderRadius: "4px",
        }}
      >
        {/* Diagnosis */}
        <TextField
          fullWidth
          label="Diagnosis"
          name="diagnosis"
          value={record.diagnosis}
          onChange={handleChange}
          multiline
          rows={3}
          margin="normal"
        />

        {/* Prescription */}
        <TextField
          fullWidth
          label="Prescription"
          name="prescription"
          value={record.prescription}
          onChange={handleChange}
          multiline
          rows={3}
          margin="normal"
        />

        {/* Vital Signs */}
        <Typography variant="h6" mt={3} mb={1} color={colors.grey[100]}>
          Vital Signs
        </Typography>
        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
          <TextField
            label="Blood Pressure"
            value={record.vital_signs?.blood_pressure || ""}
            onChange={(e) =>
              handleVitalSignChange("blood_pressure", e.target.value)
            }
          />
          <TextField
            label="Heart Rate"
            value={record.vital_signs?.heart_rate || ""}
            onChange={(e) =>
              handleVitalSignChange("heart_rate", e.target.value)
            }
          />
          <TextField
            label="Temperature (°C)"
            value={record.vital_signs?.temperature || ""}
            onChange={(e) =>
              handleVitalSignChange("temperature", e.target.value)
            }
          />
        </Box>

        {/* Treatment Plan */}
        <TextField
          fullWidth
          label="Treatment Plan"
          name="treatment_plan"
          value={record.treatment_plan}
          onChange={handleChange}
          multiline
          rows={4}
          margin="normal"
        />

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
          >
            {submitting ? "Finalizing..." : "Finalize Record"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MedicalRecords;
