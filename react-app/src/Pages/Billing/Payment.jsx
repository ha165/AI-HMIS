import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import PaymentComponent from '../../Components/PaymentComponent';
import { Box, Typography } from '@mui/material';

const Payment = () => {
  const { appointmentId } = useParams();
  const location = useLocation();
  
  console.log("Route Param appointmentId:", appointmentId);
  console.log("Location State:", location.state);
  const appointmentData = location.state?.appointmentData || { id: appointmentId };

  if (!appointmentData?.id) {
    return (
      <Box p={4}>
        <Typography variant="h4" color="error">
          Error: No Appointment Specified
        </Typography>
        <Typography variant="body1">
          Please book an appointment first or contact support.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Complete Payment for Appointment #{appointmentData.id}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Date: {new Date(appointmentData.appointment_date).toLocaleString()}
      </Typography>
      
      <PaymentComponent appointmentId={appointmentData.id} />
    </Box>
  );
};

export default Payment;