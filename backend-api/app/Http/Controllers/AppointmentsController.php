<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use Illuminate\Http\Request;

class AppointmentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $appointments = Appointments::with('patient.user', 'doctor.user')->get();

        $formattedData = $appointments->map(function ($appointment): array {
            return [
                "id" => $appointment->id,
                "patient_name" => optional($appointment->patient->user)->first_name . ' ' . optional($appointment->patient->user)->last_name ?? 'N/A',
                "doctor_name" => optional($appointment->doctor->user)->first_name . ' ' . optional($appointment->doctor->user)->last_name ?? 'N/A',
                "patient_phone" => optional($appointment->patient->user)->phone ?? 'N/A',
                "doctor_phone" => optional($appointment->doctor->user)->phone ?? 'N/A',
                "specialization" => optional($appointment->doctor)->specialization ?? 'N/A',
                "appointment_date" => optional($appointment->appointment_date)->format('Y-m-d H:i:s') ?? 'N/A',
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
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'doctor_id' => 'required|exists:users,id',
            'schedule_id' => 'required|exists:schedules,id',
            'reason' => 'required',
        ]);

        // Check if schedule is available
        $schedule = Schedule::find($request->schedule_id);
        if (!$schedule || $schedule->appointments()->exists()) {
            return response()->json(['message' => 'This schedule is no longer available'], 400);
        }

        // Create appointment
        $appointment = Appointments::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => $request->doctor_id,
            'schedule_id' => $request->schedule_id,
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
            'patient_id' => 'required|exists:patient,id',
            'doctor_id' => 'required|exists:doctor,id',
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
}
