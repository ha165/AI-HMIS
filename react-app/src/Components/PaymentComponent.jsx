import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import fetchWrapper from "../Context/fetchwrapper";
import { useNavigate } from "react-router-dom";

const PaymentComponent = ({ appointmentId }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [error, setError] = useState(null);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const navigate = useNavigate();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  // Fetch payment details when component mounts
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWrapper(`/payments/${appointmentId}`);
        setPaymentDetails(data);

        // If payment already exists, check its status
        if (data.payment_status) {
          setPaymentStatus(data.payment_status);
          if (data.payment_status === "pending") {
            startPolling(data.id);
          } else if (data.payment_status === "completed") {
            setOpenSuccessDialog(true);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load payment details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [appointmentId]);

  // Polling function for payment status
  const startPolling = (paymentId) => {
    // Clear any existing interval
    if (pollingInterval) clearInterval(pollingInterval);

    // Start new polling
    const interval = setInterval(async () => {
      try {
        const updatedPayment = await fetchWrapper(
          `/payments/status/${paymentId}`
        );

        if (updatedPayment.payment_status !== "pending") {
          clearInterval(interval);
          setPaymentStatus(updatedPayment.payment_status);
          setPollingInterval(null);

          if (updatedPayment.payment_status === "completed") {
            setOpenSuccessDialog(true);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Retry logic could be added here
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  };

  // Handle payment initiation
  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    setPaymentStatus("initiating");

    try {
      // Validate phone number format (Kenyan format)
      const formattedPhone = phoneNumber.startsWith("0")
        ? `254${phoneNumber.substring(1)}`
        : phoneNumber;
      if (!/^254[17]\d{8}$/.test(formattedPhone)) {
        throw new Error(
          "Please enter a valid Kenyan phone number (e.g., 07XXXXXXXX)"
        );
      }

      const response = await fetchWrapper("/payments/mpesa", {
        method: "POST",
        body: JSON.stringify({
          phone_number: phoneNumber,
          appointment_id: appointmentId,
          amount: paymentDetails.price,
        }),
      });

      // Start polling for this new payment
      startPolling(response.payment_id);
      setPaymentStatus("pending");
    } catch (err) {
      setPaymentStatus("failed");
      setError(err.message || "Payment initiation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Status messages and UI
  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "initiating":
        return "Initiating payment request...";
      case "pending":
        return (
          <>
            Waiting for payment confirmation...
            <Box component="span" sx={{ display: "block", mt: 1 }}>
              Please check your phone and enter your M-Pesa PIN when prompted.
            </Box>
          </>
        );
      case "completed":
        return "Payment successful! Your appointment is confirmed.";
      case "failed":
        return "Payment failed. Please try again.";
      case "cancelled":
        return "Payment was cancelled. Please try again.";
      default:
        return null;
    }
  };

  // Handle success dialog close
  const handleSuccessClose = () => {
    setOpenSuccessDialog(false);
    navigate("/appointments"); // Redirect to appointments page
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", my: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        Complete Your Payment
      </Typography>

      {isLoading && !paymentDetails ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : paymentDetails ? (
        <>
          <Box
            sx={{
              backgroundColor: "background.paper",
              p: 3,
              borderRadius: 2,
              boxShadow: 1,
              mb: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Payment Summary
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Service:</Typography>
              <Typography>{paymentDetails.service_name}</Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Appointment Date:</Typography>
              <Typography>
                {new Date(paymentDetails.appointment_date).toLocaleString()}
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography>Amount:</Typography>
              <Typography sx={{ fontWeight: "bold" }}>
                {formatCurrency(paymentDetails.price)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: "background.paper",
              p: 3,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              M-Pesa Payment
            </Typography>

            <TextField
              fullWidth
              label="M-Pesa Phone Number"
              placeholder="e.g., 0712345678"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/\D/g, ""))
              }
              margin="normal"
              variant="outlined"
              disabled={
                paymentStatus === "pending" || paymentStatus === "completed"
              }
              inputProps={{ maxLength: 10 }}
            />

            {paymentStatus && (
              <Alert
                severity={
                  paymentStatus === "completed"
                    ? "success"
                    : paymentStatus === "failed" ||
                      paymentStatus === "cancelled"
                    ? "error"
                    : "info"
                }
                sx={{ mt: 2 }}
              >
                {getStatusMessage()}
                {paymentStatus === "pending" && (
                  <CircularProgress size={20} sx={{ ml: 2 }} />
                )}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handlePayment}
              disabled={
                isLoading ||
                !phoneNumber ||
                phoneNumber.length !== 10 ||
                paymentStatus === "pending" ||
                paymentStatus === "completed"
              }
              size="large"
              sx={{ mt: 3 }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                  Processing...
                </>
              ) : (
                "Pay with M-Pesa"
              )}
            </Button>
          </Box>
        </>
      ) : null}

      {/* Success Dialog */}
      <Dialog open={openSuccessDialog} onClose={handleSuccessClose}>
        <DialogTitle sx={{ color: "success.main" }}>
          Payment Successful!
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Your payment of {formatCurrency(paymentDetails?.price || 0)} has
            been received.
          </Typography>
          <Typography>
            Appointment #{appointmentId} is now confirmed for{" "}
            {paymentDetails &&
              new Date(paymentDetails.appointment_date).toLocaleString()}
            .
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSuccessClose}
            color="primary"
            variant="contained"
          >
            View My Appointments
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentComponent;
