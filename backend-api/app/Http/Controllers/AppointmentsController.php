<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use Carbon\Carbon;
use App\Http\Requests\StoreAppointmentsRequest;
use App\Http\Requests\UpdateAppointmentsRequest;

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
                "patient_name" => optional(optional($appointment->patient)->user)->first_name . ' ' . optional(optional($appointment->patient)->user)->last_name,
                "doctor_name" => optional(optional($appointment->doctor)->user)->first_name . ' ' . optional(optional($appointment->doctor)->user)->last_name,
                "patient_phone" => optional(optional($appointment->patient)->user)->phone ?? 'N/A',
                "doctor_phone" => optional(optional($appointment->doctor)->user)->phone ?? 'N/A',
                "specialization" => optional($appointment->doctor)->specialization ?? 'N/A',
                "appointment_date" => $appointment->appointment_date ? Carbon::parse($appointment->appointment_date)->format('Y-m-d H:i:s') : 'N/A',
                "status" => ucfirst($appointment->status ?? 'pending')
            ];
        });

        return response()->json($formattedData);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAppointmentsRequest $request)
    {
        //
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
    public function update(UpdateAppointmentsRequest $request, Appointments $appointments)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointments $appointments)
    {
        //
    }
}
