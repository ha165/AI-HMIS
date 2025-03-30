import React from 'react';
import { Box, Typography } from '@mui/material';
import PaymentComponent from '../../Components/PaymentComponent';
import { useParams } from 'react-router-dom';
const Payment = () => {

    const { appointmentId } = useParams();
    
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Complete Your Payment
            </Typography>
            
            <Typography variant="body1" gutterBottom>
                Please complete payment for your appointment to secure your booking.
            </Typography>
            
            <PaymentComponent appointmentId={22} />
        </Box>
    );
};

export default Payment;