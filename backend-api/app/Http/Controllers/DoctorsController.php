<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use Carbon\Carbon;
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
        // Validate incoming data
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'specialization' => 'required|string|max:255',
            'address' => 'nullable|string',
            'license_number' => 'required|string|unique:doctors,license_number',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        try {
            // Start transaction in case of failures
            \DB::beginTransaction();

            // Create the User first
            $user = User::create([
                'first_name' => $validatedData['first_name'],
                'last_name' => $validatedData['last_name'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'],
                'password' => bcrypt($validatedData['password']),
                'role' => 'doctor',
                'profile_photo' => $this->handleProfilePhoto($request)
            ]);

            // Create the Doctor profile
            $doctor = Doctor::create([
                'user_id' => $user->id,
                'specialization' => $validatedData['specialization'],
                'address' => $validatedData['address'],
                'license_number' => $validatedData['license_number']
            ]);

            // Commit transaction
            \DB::commit();

            // Return the created doctor with user data
            return response()->json([
                'id' => $doctor->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'specialization' => $doctor->specialization,
                'address' => $doctor->address,
                'license_number' => $doctor->license_number,
                'profile_photo' => $user->profile_photo
            ], 201);

        } catch (\Exception $e) {
            // Rollback transaction on error
            \DB::rollBack();

            return response()->json([
                'message' => 'Failed to create doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle profile photo upload
     */
    private function handleProfilePhoto(Request $request)
    {
        if (!$request->hasFile('profile_photo')) {
            return null;
        }

        $file = $request->file('profile_photo');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('profile_photos', $filename, 'public');

        return '/storage/' . $path;
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
