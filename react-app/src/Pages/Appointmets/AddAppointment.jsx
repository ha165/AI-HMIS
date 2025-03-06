import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/Header";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import fetchWrapper from "../../Context/fetchwrapper";
import { toast } from "react-toastify";

const AddAppointment = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    //patients
    fetch("/api/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error(err));
    //doctors
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error(err));
  }, []);

  const handleFormSubmit = async (values) => {
    try {
      const data = await fetchWrapper("/appointments", {
        method: "POST",
        body: JSON.stringify({
          patient_id: values.patientId,
          doctor_id: values.doctorId,
          appointment_date: values.appointmentDate,
          reason: values.reason,
        }),
      });

      console.log("Appointment created successfully:", data);
      navigate("/appointments");
      toast.success("Appointment created successfully!");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment.");
    }
  };

  return (
    <Box display="flex" height="100vh" flexDirection="row">
      <Sidebar />

      <Box flexGrow={1} display="flex" flexDirection="column">
        <Topbar />

        <Box flexGrow={1} p="20px">
          <Header
            title="CREATE APPOINTMENT"
            subtitle="Schedule a New Appointment"
          />

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
                  {/* Patient Select */}
                  <FormControl
                    fullWidth
                    variant="filled"
                    sx={{ gridColumn: "span 4" }}
                  >
                    <InputLabel>Patient</InputLabel>
                    <Select
                      name="patientId"
                      value={values.patientId}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={!!touched.patientId && !!errors.patientId}
                    >
                      {patients.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Doctor Select */}
                  <FormControl
                    fullWidth
                    variant="filled"
                    sx={{ gridColumn: "span 4" }}
                  >
                    <InputLabel>Doctor</InputLabel>
                    <Select
                      name="doctorId"
                      value={values.doctorId}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={!!touched.doctorId && !!errors.doctorId}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          {doctor.first_name} {doctor.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Appointment Date */}
                  <TextField
                    fullWidth
                    variant="filled"
                    type="datetime-local"
                    label="Appointment Date & Time"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.appointmentDate}
                    name="appointmentDate"
                    error={
                      !!touched.appointmentDate && !!errors.appointmentDate
                    }
                    helperText={
                      touched.appointmentDate && errors.appointmentDate
                    }
                    sx={{ gridColumn: "span 4" }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().slice(0, 16),
                      step: 60,
                    }}
                  />

                  {/* Reason */}
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Reason"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.reason}
                    name="reason"
                    error={!!touched.reason && !!errors.reason}
                    helperText={touched.reason && errors.reason}
                    sx={{ gridColumn: "span 4" }}
                    multiline
                    rows={4}
                  />
                </Box>
                <Box display="flex" justifyContent="end" mt="20px">
                  <Button type="submit" color="secondary" variant="contained">
                    Create New Appointment
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Box>
      </Box>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  patientId: yup.string().required("Patient is required"),
  doctorId: yup.string().required("Doctor is required"),
  appointmentDate: yup
    .date()
    .min(new Date(), "Appointment date must be in the future")
    .required("Appointment date is required"),
  reason: yup.string().required("Reason is required"),
});

const initialValues = {
  patientId: "",
  doctorId: "",
  appointmentDate: "",
  reason: "",
};

export default AddAppointment;
