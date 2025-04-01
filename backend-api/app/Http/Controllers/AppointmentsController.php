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

        // Eager loading
        $query = Appointments::with([
            'patient.user:id,first_name,last_name,phone,id',
            'doctor.user:id,first_name,last_name,phone,id',
            'doctor:id,specialization,user_id',
            'services:id,name'
        ]);
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

        $appointments = $query->get();

        if ($appointments->isEmpty()) {
            return response()->json(['message' => 'No appointments found'], 404);
        }
        $formattedData = $appointments->map(function ($appointment) {
            return [
                "id" => $appointment->id,
                "patient_name" => $appointment->patient && $appointment->patient->user
                    ? trim($appointment->patient->user->first_name . ' ' . $appointment->patient->user->last_name)
                    : 'N/A',
                "service_name" => $appointment->services->name ?? 'N/A',
                "doctor_name" => $appointment->doctor && $appointment->doctor->user
                    ? trim($appointment->doctor->user->first_name . ' ' . $appointment->doctor->user->last_name)
                    : 'N/A',
                "patient_phone" => $appointment->patient->user->phone ?? 'N/A',
                "doctor_phone" => $appointment->doctor->user->phone ?? 'N/A',
                "specialization" => $appointment->doctor->specialization ?? 'N/A',
                "appointment_date" => $appointment->appointment_date?->format('Y-m-d') ?? 'N/A',
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
    public function markComplete($id)
    {
        $appointment = Appointments::findOrFail($id);

        if ($appointment->status === 'cancelled') {
            return response()->json(['message' => 'Cannot complete a cancelled appointment'], 400);
        }

        $appointment->status = 'completed';
        $appointment->save();

        return response()->json(['message' => 'Appointment marked as completed', 'appointment' => $appointment]);
    }
    // app/Http/Controllers/AppointmentController.php
    public function reschedule(Appointments $appointment, Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'reason' => 'sometimes|string|max:500'
        ]);

        // Check if the appointment belongs to the user (for patients)
        if (auth()->user()->patients() && $appointment->patient_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Update the appointment
        $appointment->update([
            'schedule_id' => $validated['schedule_id'],
            'reason' => $validated['reason'] ?? $appointment->reason,
            'status' => 'rescheduled', // or whatever status you want
        ]);

        return response()->json($appointment);
    }
}