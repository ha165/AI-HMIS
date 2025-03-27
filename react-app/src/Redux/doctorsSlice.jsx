import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fetchWrapper from '../Context/fetchwrapper';

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWrapper('/doctors');
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDoctorSchedules = createAsyncThunk(
  'doctors/fetchDoctorSchedules',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await fetchWrapper(`/doctors/${doctorId}/schedules`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: {
    doctors: [],
    schedules: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDoctorSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchDoctorSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default doctorsSlice.reducer;