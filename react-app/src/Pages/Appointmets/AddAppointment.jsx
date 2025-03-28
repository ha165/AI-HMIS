import { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import Header from "../../Components/Header";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fetchWrapper from "../../Context/fetchwrapper";

const AppointmentBooking = () => {
  const theme = useTheme();
  const colors = theme.palette;
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [reason, setReason] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [appointmentId, setAppointmentId] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxPollingAttempts = 20; // ~1 minute (3s intervals)

  // Fetch all active services
  useEffect(() => {
    setIsLoading(true);
    fetchWrapper("/services")
      .then(setServices)
      .catch((err) => {
        console.error("Error fetching services:", err);
        toast.error("Failed to load services");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch doctors when service is selected
  useEffect(() => {
    if (!selectedService) return;

    setIsLoading(true);
    fetchWrapper(`/services/${selectedService}/doctors`)
      .then((data) => {
        setDoctors(data);
        setSelectedDoctor("");
        setSchedules([]);
      })
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        toast.error("Failed to load doctors");
      })
      .finally(() => setIsLoading(false));
  }, [selectedService]);

  // Fetch schedules when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;

    setIsLoading(true);
    fetchWrapper(`/doctors/${selectedDoctor}/schedules`)
      .then((data) => {
        setSchedules(data);
        setCalendarEvents(
          data.map((slot) => ({
            id: slot.id,
            title: "Available",
            start: slot.start_time,
            end: slot.end_time,
            backgroundColor: colors.success.main,
            borderColor: colors.success.dark,
          }))
        );
      })
      .catch((err) => {
        console.error("Error fetching schedules:", err);
        toast.error("Failed to load available slots");
      })
      .finally(() => setIsLoading(false));
  }, [selectedDoctor, colors]);

  const handleDateClick = (info) => {
    const clickedSlot = schedules.find(
      (s) =>
        new Date(s.start_time).toISOString() === info.event.start.toISOString()
    );

    if (clickedSlot) {
      setSelectedSchedule(clickedSlot.id);
      toast.info(
        `Selected time slot: ${new Date(
          clickedSlot.start_time
        ).toLocaleString()}`
      );
    }
  };

  const resetForm = () => {
    setSelectedService("");
    setSelectedDoctor("");
    setSelectedSchedule("");
    setReason("");
    setPhoneNumber("");
    setShowPaymentForm(false);
    setCalendarEvents([]);
    setPaymentStatus(null);
    setPaymentId(null);
    setPollingCount(0);
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedSchedule || !reason) {
      toast.warn("Please fill all required fields");
      return;
    }

    // Get the selected service price
    const selectedServiceObj = services.find((s) => s.id === selectedService);
    if (!selectedServiceObj) {
      toast.error("Service not found");
      return;
    }

    try {
      const appointmentResponse = await fetchWrapper("/appointments", {
        method: "POST",
        body: JSON.stringify({
          service_id: selectedService,
          doctor_id: selectedDoctor,
          schedule_id: selectedSchedule,
          reason,
          appointment_date: schedules.find((s) => s.id === selectedSchedule)
            ?.start_time,
        }),
      });

      if (!appointmentResponse.success) {
        throw new Error(
          appointmentResponse.message || "Failed to book appointment."
        );
      }

      setAppointmentId(appointmentResponse.id); // Store appointment ID for payment
      setShowPaymentForm(true); // Show payment form after successful appointment creation
    } catch (err) {
      toast.error(err.message || "Error booking appointment");
    }
  };

  const handlePaymentSubmit = async () => {
    if (!phoneNumber.match(/^254[0-9]{9}$/)) {
        toast.warn("Please enter a valid M-Pesa phone number (format: 2547XXXXXXXX)");
        return;
    }

    if (!appointmentId) {
        toast.error("Appointment not found. Please try again.");
        return;
    }

    setPaymentInProgress(true);
    setPollingCount(0);
    const toastId = toast.loading("Initiating M-Pesa payment...");

    try {
        // 1. Initiate STK Push
        const paymentResponse = await fetchWrapper("/payments/mpesa/stk", {
            method: "POST",
            body: JSON.stringify({
                phone: phoneNumber,
                service_id: selectedService,
                appointment_id: appointmentId 
            }),
        });

        if (!paymentResponse.success) {
            throw new Error(paymentResponse.message || "Payment initiation failed");
        }

        setPaymentId(paymentResponse.payment_id);
        toast.update(toastId, {
            render: "Please complete the payment on your phone",
            type: "info",
            isLoading: true,
            autoClose: false
        });

        // 2. Start polling for payment status
        const pollInterval = setInterval(async () => {
            try {
                const statusResponse = await fetchWrapper(
                    `/payments/${paymentResponse.payment_id}/status`
                );

                setPaymentStatus(statusResponse.payment_status);
                setPollingCount(prev => prev + 1);

                if (statusResponse.is_successful) {
                    clearInterval(pollInterval);
                    await updateAppointmentPaymentStatus(paymentResponse.payment_id, toastId);
                } else if (
                    statusResponse.payment_status === 'failed' || 
                    pollingCount >= maxPollingAttempts
                ) {
                    clearInterval(pollInterval);
                    throw new Error(
                        statusResponse.result_desc || "Payment failed. Please try again."
                    );
                }
            } catch (err) {
                clearInterval(pollInterval);
                toast.update(toastId, {
                    render: err.message,
                    type: "error",
                    isLoading: false,
                    autoClose: 5000
                });
                setPaymentInProgress(false);
            }
        }, 3000); // Poll every 3 seconds

    } catch (err) {
        toast.update(toastId, {
            render: err.message,
            type: "error",
            isLoading: false,
            autoClose: 5000
        });
        setPaymentInProgress(false);
    }
};
const updateAppointmentPaymentStatus = async (paymentId, toastId) => {
  try {
      const response = await fetchWrapper(`/appointments/${appointmentId}/update-payment`, {
          method: "PUT",
          body: JSON.stringify({
              payment_id: paymentId,
              payment_status: "completed"
          }),
      });

      if (!response.success) {
          throw new Error("Failed to update appointment payment status.");
      }

      toast.update(toastId, {
          render: "Payment successful! Appointment confirmed.",
          type: "success",
          isLoading: false,
          autoClose: 5000
      });

      // Reset form and navigate
      resetForm();
      setTimeout(() => navigate("/appointments"), 3000);

  } catch (err) {
      toast.update(toastId, {
          render: `Payment successful but appointment update failed: ${err.message}`,
          type: "warning",
          isLoading: false,
          autoClose: 5000
      });
      setPaymentInProgress(false);
  }
};

  return (
    <Box display="flex" height="100vh">
      <ToastContainer position="top-right" autoClose={5000} />
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Topbar />
        <Box m="20px">
          <Header
            title="Book Appointment"
            subtitle="Schedule with your preferred doctor"
          />
          <Box
            p={4}
            sx={{
              backgroundColor: colors.background.default,
              borderRadius: "10px",
              boxShadow: theme.shadows[3],
            }}
          >
            <Select
              fullWidth
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              displayEmpty
              disabled={isLoading}
            >
              <MenuItem value="" disabled>
                Select Medical Service
              </MenuItem>
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name} ({service.duration_minutes} mins)
                </MenuItem>
              ))}
            </Select>

            {selectedService && (
              <Select
                fullWidth
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                displayEmpty
                disabled={isLoading}
              >
                <MenuItem value="" disabled>
                  Select Doctor
                </MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name} -{" "}
                    {doctor.specialization}
                  </MenuItem>
                ))}
              </Select>
            )}

            {selectedDoctor && (
              <Box mt={4}>
                <Typography variant="h6" mb={2}>
                  Available Time Slots
                </Typography>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  events={calendarEvents}
                  eventClick={handleDateClick}
                  height="500px"
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Reason for Appointment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={3}
              disabled={isLoading}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isLoading || !selectedSchedule || !reason}
              sx={{ mt: 2 }}
            >
              {isLoading ? "Processing..." : "Confirm Appointment"}
            </Button>

            {showPaymentForm && (
              <Box
                mt={4}
                p={3}
                sx={{
                  backgroundColor: colors.primary.light,
                  borderRadius: "8px",
                }}
              >
                <Typography variant="h6" mb={2}>
                  Complete Payment
                </Typography>
                <Typography mb={2}>
                  Service:{" "}
                  {services.find((s) => s.id === selectedService)?.name}
                </Typography>
                <Typography mb={2}>
                  Amount: Ksh{" "}
                  {services.find((s) => s.id === selectedService)?.price}
                </Typography>

                <TextField
                  fullWidth
                  label="M-Pesa Phone Number (2547XXXXXXXX)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={paymentInProgress}
                  sx={{ mb: 2 }}
                />

                {paymentStatus && (
                  <Box
                    mt={2}
                    p={2}
                    sx={{
                      backgroundColor:
                        paymentStatus === "completed"
                          ? colors.success.light
                          : paymentStatus === "failed"
                          ? colors.error.light
                          : colors.warning.light,
                      borderRadius: "4px",
                    }}
                  >
                    <Typography>
                      Payment Status:{" "}
                      <strong>{paymentStatus.toUpperCase()}</strong>
                    </Typography>
                    {paymentStatus === "processing" && (
                      <Typography variant="body2">
                        Waiting for payment confirmation... ({pollingCount * 3}s
                        elapsed)
                      </Typography>
                    )}
                  </Box>
                )}

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowPaymentForm(false)}
                    disabled={paymentInProgress}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePaymentSubmit}
                    disabled={paymentInProgress || !phoneNumber}
                  >
                    {paymentInProgress
                      ? "Processing Payment..."
                      : "Pay via M-Pesa"}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppointmentBooking;
