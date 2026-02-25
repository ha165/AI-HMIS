import { Box, Button, TextField, CircularProgress } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMedicalRecords,
  createMedicalRecord,
} from "../../Redux/medicalRecordsSlice";
import Header from "../../Components/Header";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const MedicalRecords = () => {
  const dispatch = useDispatch();
  const { records, loading } = useSelector((state) => state.medicalRecords);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const initialValues = {
    patient_id: "",
    doctor_id: "",
    appointment_id: "",
    diagnosis: "",
    prescription: "",
    medical_history: "",
    medications: "",
    allergies: "",
    vital_signs: "",
    treatment_plan: "",
    lab_results: "",
    notes: "",
    status: "draft",
  };

  const checkoutSchema = yup.object().shape({
    patient_id: yup.string().required("Patient ID is required"),
    doctor_id: yup.string().required("Doctor ID is required"),
    diagnosis: yup.string().required("Diagnosis is required"),
    prescription: yup.string(),
    medical_history: yup.string(),
    medications: yup.string(),
    allergies: yup.string(),
    vital_signs: yup.string(),
    treatment_plan: yup.string(),
    lab_results: yup.string(),
    notes: yup.string(),
    status: yup.string().oneOf(["draft", "finalized"]).required(),
  });

  useEffect(() => {
    const loadRecords = async () => {
      try {
        await dispatch(fetchMedicalRecords());
      } catch (error) {
        console.error("Failed to fetch medical records:", error);
        toast.error("Failed to fetch Medical records")
      }
    };

    loadRecords();
  }, [dispatch]);

  const handleFormSubmit = async (values) => {
    try {
      await dispatch(createMedicalRecord(values)).unwrap();
      toast.success("Medical record created successfully!");
    } catch (error) {
      toast.error("Error creating medical record");
      console.error("Error:", error);
    }
  };

  return (
    <Box display="flex" height="100vh" flexDirection="row">
      {/* Sidebar */}
      <Sidebar />

      <Box flexGrow={1} display="flex" flexDirection="column">
        {/* Topbar */}
        <Topbar />

        <Box flexGrow={1} p="20px">
          <Header title="MEDICAL RECORDS" subtitle="Manage Medical Records" />

          {loading ? (
            <CircularProgress />
          ) : (
            <Formik
              onSubmit={handleFormSubmit}
              initialValues={initialValues}
              validationSchema={checkoutSchema}
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Box
                    display="grid"
                    gap="30px"
                    gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                    sx={{
                      "& > div": {
                        gridColumn: isNonMobile ? undefined : "span 4",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Patient ID"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.patient_id}
                      name="patient_id"
                      error={!!touched.patient_id && !!errors.patient_id}
                      helperText={touched.patient_id && errors.patient_id}
                      sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Doctor ID"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.doctor_id}
                      name="doctor_id"
                      error={!!touched.doctor_id && !!errors.doctor_id}
                      helperText={touched.doctor_id && errors.doctor_id}
                      sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Appointment ID"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.appointment_id}
                      name="appointment_id"
                      error={
                        !!touched.appointment_id && !!errors.appointment_id
                      }
                      helperText={
                        touched.appointment_id && errors.appointment_id
                      }
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Diagnosis"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.diagnosis}
                      name="diagnosis"
                      error={!!touched.diagnosis && !!errors.diagnosis}
                      helperText={touched.diagnosis && errors.diagnosis}
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Prescription"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.prescription}
                      name="prescription"
                      error={!!touched.prescription && !!errors.prescription}
                      helperText={touched.prescription && errors.prescription}
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Medical History"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.medical_history}
                      name="medical_history"
                      error={
                        !!touched.medical_history && !!errors.medical_history
                      }
                      helperText={
                        touched.medical_history && errors.medical_history
                      }
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Medications"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.medications}
                      name="medications"
                      error={!!touched.medications && !!errors.medications}
                      helperText={touched.medications && errors.medications}
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Allergies"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.allergies}
                      name="allergies"
                      error={!!touched.allergies && !!errors.allergies}
                      helperText={touched.allergies && errors.allergies}
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Vital Signs"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.vital_signs}
                      name="vital_signs"
                      error={!!touched.vital_signs && !!errors.vital_signs}
                      helperText={touched.vital_signs && errors.vital_signs}
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Treatment Plan"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.treatment_plan}
                      name="treatment_plan"
                      error={
                        !!touched.treatment_plan && !!errors.treatment_plan
                      }
                      helperText={
                        touched.treatment_plan && errors.treatment_plan
                      }
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Lab Results"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.lab_results}
                      name="lab_results"
                      error={!!touched.lab_results && !!errors.lab_results}
                      helperText={touched.lab_results && errors.lab_results}
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Notes"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.notes}
                      name="notes"
                      error={!!touched.notes && !!errors.notes}
                      helperText={touched.notes && errors.notes}
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      label="Status"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.status}
                      name="status"
                      error={!!touched.status && !!errors.status}
                      helperText={touched.status && errors.status}
                      sx={{ gridColumn: "span 4" }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="end" mt="20px">
                    <Button type="submit" color="secondary" variant="contained">
                      Create Medical Record
                    </Button>
                  </Box>
                </form>
              )}
            </Formik>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MedicalRecords;
