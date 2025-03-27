import { configureStore } from '@reduxjs/toolkit';
import appointmentsReducer from './appointmentsSlice';
import doctorsReducer from './doctorsSlice';

export default configureStore({
  reducer: {
    appointments: appointmentsReducer,
    doctors: doctorsReducer,
  },
});