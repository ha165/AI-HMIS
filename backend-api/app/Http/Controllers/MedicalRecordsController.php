<?php

namespace App\Http\Controllers;

use App\Models\Medical_Records;
use App\Models\Appointments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MedicalRecordsController extends Controller
{
    /**
     * Get all medical records for a specific patient
     */
    public function index($patientId)
    {
        try {
            $records = Medical_Records::with(['patient', 'doctor', 'appointment'])
                ->where('patient_id', $patientId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $records
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch medical records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new medical record
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'diagnosis' => 'required|string',
            'prescription' => 'nullable|string',
            'notes' => 'nullable|string',
            'vital_signs' => 'nullable|json'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medicalRecord = Medical_Records::create([
                'patient_id' => $request->patient_id,
                'doctor_id' => $request->doctor_id,
                'appointment_id' => $request->appointment_id,
                'diagnosis' => $request->diagnosis,
                'prescription' => $request->prescription,
                'notes' => $request->notes,
                'vital_signs' => $request->vital_signs ? json_decode($request->vital_signs) : null
            ]);

            return response()->json([
                'success' => true,
                'data' => $medicalRecord,
                'message' => 'Medical record created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create medical record',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Get a specific medical record
     */
    public function show($id)
    {
        try {
            $medicalRecord = Medical_Records::with(['patient', 'doctor', 'appointment'])
                ->find($id);

            if (!$medicalRecord) {
                return response()->json([
                    'success' => false,
                    'message' => 'Medical record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $medicalRecord
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch medical record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a medical record
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'diagnosis' => 'sometimes|required|string',
            'prescription' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'notes' => 'nullable|string',
            'vital_signs' => 'nullable|json',
            'lab_results' => 'nullable|json'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medicalRecord = Medical_Records::find($id);

            if (!$medicalRecord) {
                return response()->json([
                    'success' => false,
                    'message' => 'Medical record not found'
                ], 404);
            }

            $medicalRecord->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $medicalRecord,
                'message' => 'Medical record updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update medical record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a medical record
     */
    public function destroy($id)
    {
        try {
            $medicalRecord = Medical_Records::find($id);

            if (!$medicalRecord) {
                return response()->json([
                    'success' => false,
                    'message' => 'Medical record not found'
                ], 404);
            }

            $medicalRecord->delete();

            return response()->json([
                'success' => true,
                'message' => 'Medical record deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete medical record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medical records for a specific appointment
     */
    public function getByAppointment($appointmentId)
    {
        try {
            $records = Medical_Records::with(['patient', 'doctor'])
                ->where('appointment_id', $appointmentId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $records
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch medical records',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}