<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;

class DoctorsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $doctors = Doctor::with('user')->get();

        $formatdata = $doctors->map(function ($doctors) {
            return [
                "id" => $doctors->id,
                "first_name" => $doctors->user->first_name,
                "last_name" => $doctors->user->last_name,
                "email" => $doctors->user->email,
                "phone" => $doctors->user->phone,
                "specialization" => $doctors->specialization,
                "address" => $doctors->address,
                "license_number" => $doctors->license_number
            ];
        });

        return response()->json($formatdata);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        // Validate incoming data
        $validatedData = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'specialization' => 'nullable|string',
            'address' => 'nullable|string',
            'license_number' => 'nullable|string'
        ]);

        // Update the related User model
        $doctor->user->update([
            'first_name' => $validatedData['first_name'],
            'last_name' => $validatedData['last_name'],
            'email' => $validatedData['email'],
            'phone' => $validatedData['phone'],
        ]);

        // Update the Doctor model
        $doctor->update([
            'specialization' => $validatedData['specialization'],
            'address' => $validatedData['address'],
            'license_number' => $validatedData['license_number']
        ]);

        // Return updated doctor data
        return response()->json([
            'id' => $doctor->id,
            'first_name' => $doctor->user->first_name,
            'last_name' => $doctor->user->last_name,
            'email' => $doctor->user->email,
            'phone' => $doctor->user->phone,
            'specialization' => $doctor->specialization,
            'address' => $doctor->address,
            'license_number' => $doctor->license_number
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
    public function getAvailableDoctors(Request $request)
    {
        $specialization = $request->query('specialization');

        $doctors = User::where('role', 'doctor')
            ->where('specialization', $specialization)
            ->whereHas('schedules', function ($query) {
                $query->where('start_time', '>', now());
            })
            ->with('schedules')
            ->get();

        return response()->json($doctors);
    }

}
