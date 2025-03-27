import { configureStore } from '@reduxjs/toolkit';
import appointmentsReducer from './appointmentsSlice';
import doctorsReducer from './doctorsSlice';
import medicalRecordsReducer from './medicalRecordsSlice';

export default configureStore({
  reducer: {
    appointments: appointmentsReducer,
    doctors: doctorsReducer,
     medicalRecords: medicalRecordsReducer,
  },
});