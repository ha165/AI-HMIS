<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'specialization' => 'required|string',
            'license_number' => 'required|string|unique:doctors,license_number',
        ]);

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            $validatedData['profile_photo'] = $request->file('profile_photo')->store('profile_photos', 'public');
        } else {
            $validatedData['profile_photo'] = null;
        }

        // Create the User
        $user = User::create([
            'first_name' => $validatedData['first_name'],
            'last_name' => $validatedData['last_name'],
            'phone' => $validatedData['phone'],
            'role' => 'doctor',
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'profile_photo' => $validatedData['profile_photo'],
        ]);

        $doctor = Doctor::create([
            'user_id' => $user->id,
            'address' => $validatedData['address'],
            'specialization' => $validatedData['specialization'],
            'license_number' => $validatedData['license_number'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Doctor created successfully',
            'doctor' => $doctor,
        ], 201);
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
        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor not found'
            ], 404);
        }

        try {
            // Get the user associated with the doctor
            $user = $doctor->user;

            // Delete the doctor record first
            $doctor->delete();

            // Then delete the associated user
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Doctor and associated user deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete doctor',
                'error' => $e->getMessage()
            ], 500);
        }
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
    public function getSchedules(Doctor $doctor)
    {
        return $doctor->schedules()
            ->where('start_time', '>', now())
            ->whereDoesntHave('appointment')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'formatted' => Carbon::parse($schedule->start_time)->format('D, M j, Y g:i A')
                ];
            });
    }

}
