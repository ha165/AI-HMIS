import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import fetchWrapper from "../Context/fetchwrapper";

const PaymentComponent = ({ appointmentId }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWrapper(`/payments/${appointmentId}`);
        setPaymentDetails(data);
      } catch (err) {
        setError(err.message || "Failed to load payment details");
      } finally {
        setIsLoading(false);
      }
    };

    if (appointmentId) {
      fetchPaymentDetails();
    }
  }, [appointmentId]);

  const handlePayment = async () => {
    if (!phoneNumber || !paymentDetails) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetchWrapper("/payments/mpesa", {
        method: "POST",
        body: JSON.stringify({
          phone_number: phoneNumber,
          appointment_id: paymentDetails.appointment_id,
          amount: paymentDetails.price,
        }),
      });

      setSuccess(
        "Payment initiated successfully. Please check your phone to complete the payment."
      );
    } catch (err) {
      setError(err.message || "Failed to initiate payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !paymentDetails) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!paymentDetails) {
    return null;
  }

  return (
    <Box p={4} border={1} borderRadius={2} borderColor="grey.300" mt={4}>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>

      <Typography variant="body1" gutterBottom>
        Service: {paymentDetails.service_name}
      </Typography>

      <Typography variant="body1" gutterBottom>
        Amount: KES {paymentDetails.price.toLocaleString()}
      </Typography>

      <TextField
        fullWidth
        label="M-Pesa Phone Number (e.g., 07XXXXXXXX)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        margin="normal"
        variant="outlined"
      />

      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePayment}
          disabled={isLoading || !phoneNumber}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? "Processing..." : "Pay via M-Pesa"}
        </Button>
      </Box>

      {error && (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {success && (
        <Box mt={2}>
          <Alert severity="success">{success}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default PaymentComponent;
