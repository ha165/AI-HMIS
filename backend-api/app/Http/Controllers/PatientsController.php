<?php

namespace App\Http\Controllers;

use App\Models\Patients;
use Illuminate\Http\Request;

class PatientsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $patients = Patients::with('user:id,first_name,last_name,email,phone')->get();

        $formatdata = $patients->map(function ($patients): array {
            return [
                'id' => $patients->id,
                'first_name' => $patients->user->first_name,
                'last_name' => $patients->user->last_name,
                'email' => $patients->user->email,
                'phone' => $patients->user->phone,
                'gender' => $patients->gender,
                'emergency_contact' => $patients->emergency_contact
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
    public function show(Patients $patients)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Validate the request data
        $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'gender' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
        ]);

        // Find the patient by ID
        $patient = Patients::find($id);

        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        // Update the patient's user details
        $patient->user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        // Update the patient's details
        $patient->update([
            'gender' => $request->gender,
            'emergency_contact' => $request->emergency_contact,
        ]);

        return response()->json(['message' => 'Patient updated successfully', 'data' => $patient], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        // Find the patient by ID
        $patient = Patients::find($id);

        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        // Delete the associated user
        $patient->user->delete();

        // Delete the patient
        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully'], 200);
    }
    public function completeRegistration(Request $request)
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'dob' => 'required|date',
            'gender' => 'required|string',
            'address' => 'required|string',
            'emergency_contact' => 'required|string'
        ]);

        Patients::create([
            'user_id' => $user->id,
            'dob' => $validatedData['dob'],
            'gender' => $validatedData['gender'],
            'address' => $validatedData['address'],
            'emergency_contact' => $validatedData['emergency_contact'],
        ]);

        return response()->json(['message' => 'Profile completed successfully']);
    }
}