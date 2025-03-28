import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import fetchWrapper from "../../Context/fetchwrapper";

const PaymentComponent = ({
  appointmentId,
  selectedService,
  services,
  phoneNumber,
  setPhoneNumber,
  onPaymentSuccess,
  onCancel,
  colors,
}) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);

  const maxPollingAttempts = 20; // ~1 minute (3s intervals)

  const handlePaymentSubmit = async () => {
    if (!phoneNumber.match(/^254[0-9]{9}$/)) {
      toast.warn(
        "Please enter a valid M-Pesa phone number (format: 2547XXXXXXXX)"
      );
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
          appointment_id: appointmentId,
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
        autoClose: false,
      });

      // 2. Start polling for payment status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetchWrapper(
            `/payments/${paymentResponse.payment_id}/status`
          );

          setPaymentStatus(statusResponse.payment_status);
          setPollingCount((prev) => prev + 1);

          if (statusResponse.is_successful) {
            clearInterval(pollInterval);
            await updateAppointmentPaymentStatus(paymentResponse.payment_id, toastId);
          } else if (
            statusResponse.payment_status === "failed" ||
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
            autoClose: 5000,
          });
          setPaymentInProgress(false);
        }
      }, 3000); // Poll every 3 seconds
    } catch (err) {
      toast.update(toastId, {
        render: err.message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      setPaymentInProgress(false);
    }
  };

  const updateAppointmentPaymentStatus = async (paymentId, toastId) => {
    try {
      const response = await fetchWrapper(
        `/appointments/${appointmentId}/update-payment`,
        {
          method: "PUT",
          body: JSON.stringify({
            payment_id: paymentId,
            payment_status: "completed",
          }),
        }
      );

      if (!response.success) {
        throw new Error("Failed to update appointment payment status.");
      }

      toast.update(toastId, {
        render: "Payment successful! Appointment confirmed.",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      // Notify parent component of successful payment
      onPaymentSuccess();

    } catch (err) {
      toast.update(toastId, {
        render: `Payment successful but appointment update failed: ${err.message}`,
        type: "warning",
        isLoading: false,
        autoClose: 5000,
      });
      setPaymentInProgress(false);
    }
  };

  return (
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
        Service: {services.find((s) => s.id === selectedService)?.name}
      </Typography>
      <Typography mb={2}>
        Amount: Ksh {services.find((s) => s.id === selectedService)?.price}
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
            Payment Status: <strong>{paymentStatus.toUpperCase()}</strong>
          </Typography>
          {paymentStatus === "processing" && (
            <Typography variant="body2">
              Waiting for payment confirmation... ({pollingCount * 3}s elapsed)
            </Typography>
          )}
        </Box>
      )}

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button
          variant="outlined"
          onClick={onCancel}
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
          {paymentInProgress ? "Processing Payment..." : "Pay via M-Pesa"}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentComponent;