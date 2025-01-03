<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Appointment::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            "patient_id" => "",
            "staff_id" => "",
            "appointment_date" => "required|date",
            "status" => "required|in:pending,confirmed,cancelled",
            "notes" => "required|max:255",
        ]);
        $appointment = Appointment::create($fields);
        return [
            "status" => "success",
            "message" => "Appointment created successfully",
            "Appointment" => $appointment
        ];
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        //
    }
}
