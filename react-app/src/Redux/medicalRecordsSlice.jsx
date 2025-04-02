import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fetchWrapper from '../Context/fetchwrapper'; 

export const fetchMedicalRecords = createAsyncThunk('medicalRecords/fetchMedicalRecords', async () => {
  const data = await fetchWrapper("/medical-records");
  return data;
});

export const createMedicalRecord = createAsyncThunk('medicalRecords/createMedicalRecord', async (newRecord) => {
  const record = await fetchWrapper("/medical-records", {
    method: "POST",
    body: JSON.stringify(newRecord),
  });
  return record;
});

const medicalRecordsSlice = createSlice({
  name: 'medicalRecords',
  initialState: {
    records: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action) => {
        state.records = action.payload;
        state.loading = false;
      })
      .addCase(fetchMedicalRecords.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createMedicalRecord.fulfilled, (state, action) => {
        state.records.push(action.payload);
      });
  },
});

export default medicalRecordsSlice.reducer;