<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use App\Models\Doctor;
use App\Models\Schedules;
use App\Models\Patients;
use Illuminate\Http\Request;

class AppointmentsController extends Controller
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

        // Start the query
        $query = Appointments::with(['patient.user', 'doctor.user', 'services']);

        // Handle different roles
        if ($user->role === 'patient') {
            $patient = Patients::where('user_id', $user->id)->first();
            if ($patient) {
                $query->where('patient_id', $patient->id);
            } else {
                return response()->json(['message' => 'Patient profile not found'], 400);
            }
        } elseif ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();
            if ($doctor) {
                $query->where('doctor_id', $doctor->id);
            } else {
                return response()->json(['message' => 'Doctor profile not found'], 400);
            }
        }

        // Fetch appointments
        $appointments = $query->get();
        if ($appointments->isEmpty()) {
            return response()->json(['message' => 'No appointments found'], 404);
        }

        // Format the data
        $formattedData = $appointments->map(function ($appointment) {
            return [
                "id" => $appointment->id,
                "patient_name" => optional($appointment->patient->user)->first_name . ' ' . optional($appointment->patient->user)->last_name ?: 'N/A',
                "service_name" => optional($appointment->services)->name ?? 'N/A',
                "doctor_name" => optional($appointment->doctor->user)->first_name . ' ' . optional($appointment->doctor->user)->last_name ?? 'N/A',
                "patient_phone" => optional($appointment->patient->user)->phone ?? 'N/A',
                "doctor_phone" => optional($appointment->doctor->user)->phone ?? 'N/A',
                "specialization" => optional($appointment->doctor)->specialization ?? 'N/A',
                "appointment_date" => $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : 'N/A',
                "status" => ucfirst($appointment->status ?? 'pending')
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

        // Fetch the patient manually
        $patient = Patients::where('user_id', $user->id)->first();

        if (!$patient) {
            return response()->json([
                'message' => 'Patient profile not found',
                'user_id' => $user->id,
                'all_patients' => Patients::all()
            ], 400);
        }

        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'schedule_id' => 'required|exists:schedules,id',
            'service_id' => 'required|exists:services,id',
            'reason' => 'required',
        ]);

        $schedule = Schedules::find($request->schedule_id);
        if (!$schedule || Appointments::where('schedule_id', $request->schedule_id)->exists()) {
            return response()->json(['message' => 'This schedule is no longer available'], 400);
        }

        $appointment = Appointments::create([
            'patient_id' => $patient->id,
            'doctor_id' => $request->doctor_id,
            'schedule_id' => $request->schedule_id,
            'service_id' => $request->service_id,
            'appointment_date' => $schedule->start_time,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json($appointment);
    }



    /**
     * Display the specified resource.
     */
    public function show(Appointments $appointments)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date',
            'reason' => 'required',
            'status' => 'required|in:pending,accepted,rejected',
        ]);

        $appointment = Appointments::find($id);
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        $appointment->update($request->all());

        return response()->json($appointment);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $appointment = Appointments::find($id);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        //delete appointment
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted successfully'], 200);
    }
    public function complete(Request $request, $appointmentId)
    {
        $request->validate([
            'diagnosis' => 'nullable|string',
            'prescription' => 'nullable|string',
            'vital_signs' => 'nullable|json',
        ]);

        $appointment = Appointments::findOrFail($appointmentId);

        try {
            $medicalRecord = $appointment->completed($request->all());
            return response()->json([
                'message' => 'Appointment completed and medical record created.',
                'medical_record' => $medicalRecord,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
