<?php

namespace App\Http\Controllers;

use App\Models\Medical_Records;
use App\Models\Patients;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicalRecordsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Eager load with all required relationships
        $query = Medical_Records::with([
            'patient.user:id,first_name,last_name,phone,id',
            'doctor.user:first_name,last_name,phone,id',
            'appointment:id,appointment_date,status'
        ]);

        if ($user->role === 'patient') {
            $patient = Patients::where('user_id', $user->id)->first();
            if ($patient) {
                $query->where('patient_id', $patient->id);
            } else {
                return response()->json(['message' => 'Patient profile not found'], 400);
            }
        } elseif ($user->role === 'doctor') {
            $query->where('doctor_id', $user->id);
        }

        $records = $query->get();

        if ($records->isEmpty()) {
            return response()->json(['message' => 'No medical records found'], 404);
        }

        $formattedData = $records->map(function ($record) {
            return [
                "id" => $record->id,
                "patient_name" => $record->patient && $record->patient->user
                    ? trim($record->patient->user->first_name . ' ' . $record->patient->user->last_name)
                    : 'N/A',
                "doctor_name" => $record->doctor && $record->doctor->user
                    ? trim($record->doctor->user->first_name . ' ' . $record->doctor->user->last_name)
                    : 'N/A',
                "patient_phone" => $record->patient->user->phone ?? 'N/A',
                "doctor_phone" => $record->doctor->phone ?? 'N/A',
                "appointment_date" => $record->appointment->appointment_date?->format('Y-m-d') ?? 'N/A',
                "appointment_status" => ucfirst($record->appointment->status ?? 'N/A'),
                "diagnosis" => $record->diagnosis ?? 'N/A',
                "prescription" => $record->prescription ?? 'N/A',
                "status" => ucfirst($record->status ?? 'draft'),
                "created_at" => $record->created_at?->format('Y-m-d H:i:s') ?? 'N/A'
            ];
        });

        return response()->json($formattedData);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Only doctors can create medical records
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Only doctors can create medical records'], 403);
        }

        $validatedData = $request->validate([
            'patient_id' => 'required|integer|exists:patients,id',
            'appointment_id' => 'nullable|integer|exists:appointments,id',
            'diagnosis' => 'required|string',
            'prescription' => 'required|string',
            'medical_history' => 'nullable|string',
            'medications' => 'nullable|string',
            'allergies' => 'nullable|string',
            'vital_signs' => 'nullable|json',
            'treatment_plan' => 'nullable|string',
            'lab_results' => 'nullable|json',
            'notes' => 'nullable|string',
            'status' => 'required|in:draft,finalized',
        ]);

        // Set the doctor_id to the current user
        $validatedData['doctor_id'] = $user->id;

        $record = Medical_Records::create($validatedData);
        return response()->json($record, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = auth()->user();
        $record = Medical_Records::with([
            'patient.user:id,first_name,last_name,phone,email,id',
            'doctor.user:id,first_name,last_name,phone,email,id',
            'appointment:id,appointment_date,status,reason'
        ])->find($id);

        if (!$record) {
            return response()->json(['message' => 'Medical record not found'], 404);
        }

        // Check authorization
        if ($user->role === 'patient') {
            $patient = Patients::where('user_id', $user->id)->first();
            if (!$patient || $record->patient_id !== $patient->id) {
                return response()->json(['message' => 'Unauthorized to view this record'], 403);
            }
        } elseif ($user->role === 'doctor' && $record->doctor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to view this record'], 403);
        }
        $patient_user = $record->patient->user ?? null;
        $doctor_user = $record->doctor->user ?? null;

        $formattedRecord = [
            "id" => $record->id,

            // Patient Details
            "patient_name" => $patient_user
                ? trim($patient_user->first_name . ' ' . $patient_user->last_name)
                : 'N/A',
            "patient_phone" => $patient_user?->phone ?? 'N/A',
            "patient_email" => $patient_user?->email ?? 'N/A',
            "patient_dob" => $record->patient?->dob?->format('Y-m-d') ?? 'N/A',
            "patient_gender" => $record->patient?->gender ?? 'N/A',
            "patient_address" => $record->patient?->address ?? 'N/A',

            // Doctor Details
            "doctor_name" => $doctor_user
                ? trim($doctor_user->first_name . ' ' . $doctor_user->last_name)
                : 'N/A',
            "doctor_phone" => $doctor_user?->phone ?? 'N/A',
            "doctor_email" => $doctor_user?->email ?? 'N/A',
            "doctor_specialization" => $record->doctor?->specialization ?? 'N/A',
            "doctor_address" => $record->doctor?->address ?? 'N/A',
            "doctor_license_number" => $record->doctor?->license_number ?? 'N/A',

            // Appointment Details
            "appointment_date" => $record->appointment?->appointment_date?->format('Y-m-d') ?? 'N/A',
            "appointment_reason" => $record->appointment?->reason ?? 'N/A',
            "appointment_status" => ucfirst($record->appointment?->status ?? 'N/A'),

            // Medical Details
            "diagnosis" => $record->diagnosis,
            "prescription" => $record->prescription,
            "medical_history" => $record->medical_history,
            "medications" => $record->medications,
            "allergies" => $record->allergies,
            "vital_signs" => $record->vital_signs ? json_decode($record->vital_signs) : null,
            "treatment_plan" => $record->treatment_plan,
            "lab_results" => $record->lab_results ? json_decode($record->lab_results) : null,
            "notes" => $record->notes,
            "status" => ucfirst($record->status),
            "created_at" => $record->created_at?->format('Y-m-d H:i:s')
        ];

        return response()->json($formattedRecord);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $record = Medical_Records::find($id);

        if (!$record) {
            return response()->json(['message' => 'Medical record not found'], 404);
        }

        // Only the creating doctor or admin can update
        if ($user->role !== 'admin' && $record->doctor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to update this record'], 403);
        }

        $validatedData = $request->validate([
            'diagnosis' => 'sometimes|string',
            'prescription' => 'sometimes|string',
            'medical_history' => 'nullable|string',
            'medications' => 'nullable|string',
            'allergies' => 'nullable|string',
            'vital_signs' => 'nullable|json',
            'treatment_plan' => 'nullable|string',
            'lab_results' => 'nullable|json',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:draft,finalized',
        ]);

        $record->update($validatedData);

        return response()->json($record);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $record = Medical_Records::find($id);

        if (!$record) {
            return response()->json(['message' => 'Medical record not found'], 404);
        }

        // Only admin can delete records
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to delete this record'], 403);
        }

        $record->delete();

        return response()->json(['message' => 'Medical record deleted successfully'], 200);
    }

    /**
     * Finalize a medical record
     */
    public function finalize($id)
    {
        $user = auth()->user();
        $record = Medical_Records::find($id);

        if (!$record) {
            return response()->json(['message' => 'Medical record not found'], 404);
        }

        // Only the creating doctor can finalize
        if ($record->doctor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to finalize this record'], 403);
        }

        if ($record->status === 'finalized') {
            return response()->json(['message' => 'Record is already finalized'], 400);
        }

        $record->status = 'finalized';
        $record->save();

        return response()->json(['message' => 'Medical record finalized successfully', 'record' => $record]);
    }
}