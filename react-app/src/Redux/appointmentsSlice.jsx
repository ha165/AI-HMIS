import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fetchWrapper from '../Context/fetchwrapper';

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ page, pageSize }, { rejectWithValue }) => {
    try {
      const response = await fetchWrapper(
        `/appointments?page=${page + 1}&per_page=${pageSize}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeAppointment = createAsyncThunk(
  'appointments/completeAppointment',
  async (id, { rejectWithValue }) => {
    try {
      await fetchWrapper(`/appointments/${id}/complete`, {
        method: "PUT",
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'appointments/rescheduleAppointment',
  async ({ id, schedule_id, reason }, { rejectWithValue }) => {
    try {
      await fetchWrapper(`/appointments/${id}/reschedule`, {
        method: "PUT",
        body: JSON.stringify({ schedule_id, reason }),
      });
      return { id, schedule_id, reason };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 0,
      pageSize: 10,
      total: 0,
    }
  },
  reducers: {
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        const formattedAppointments = (action.payload.data || action.payload).map(appt => ({
          ...appt,
          patient_name: appt.patient 
            ? `${appt.patient.first_name || ''} ${appt.patient.last_name || ''}`.trim() 
            : appt.patient_name || 'Unknown',
          doctor_name: appt.doctor 
            ? `${appt.doctor.first_name || ''} ${appt.doctor.last_name || ''}`.trim()
            : appt.doctor_name || 'Unknown',
          service_name: appt.service?.name || appt.service_name || 'Unknown',
        }));
        state.data = formattedAppointments;
        state.pagination.total = action.payload.pagination?.total || action.payload.length || 0;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(completeAppointment.fulfilled, (state, action) => {
        const appointment = state.data.find(appt => appt.id === action.payload);
        if (appointment) {
          appointment.status = "completed";
        }
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        const appointment = state.data.find(appt => appt.id === action.payload.id);
        if (appointment) {
          appointment.schedule_id = action.payload.schedule_id;
          appointment.reason = action.payload.reason;
        }
      });
  }
});

export const { setPagination } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;