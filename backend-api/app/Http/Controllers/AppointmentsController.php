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
        $fields = $request->validate([
            'patient_id' => 'required|exists:users,id',
            'doctor_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date',
            'reason' => 'required',
        ]);

        $fields['status'] = 'pending';

        $appointment = Appointments::create($fields);

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
    public function update($request, Appointments $appointments)
    {
        //
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
