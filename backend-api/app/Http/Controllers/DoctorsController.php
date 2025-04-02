<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Service;
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
        $doctors = Doctor::with(['user', 'services'])->get();

        $formatdata = $doctors->map(function ($doctor) {
            return [
                "id" => $doctor->id,
                "first_name" => $doctor->user->first_name,
                "last_name" => $doctor->user->last_name,
                "email" => $doctor->user->email,
                "phone" => $doctor->user->phone,
                "specialization" => $doctor->specialization,
                "address" => $doctor->address,
                "license_number" => $doctor->license_number,
                "services" => $doctor->services->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'name' => $service->name,
                        'description' => $service->description,
                        'price' => $service->price,
                        'duration_minutes' => $service->duration_minutes
                    ];
                })
            ];
        });

        return response()->json($formatdata);
    }

    public function create()
    {
        $services = Service::all();
        return response()->json(['services' => $services]);
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
            'services' => 'nullable|array',
            'services.*' => 'exists:services,id'
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

        // Attach services if provided
        if (!empty($validatedData['services'])) {
            $doctor->services()->attach($validatedData['services']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Doctor created successfully',
            'doctor' => $doctor->load('services'),
        ], 201);
    }

    public function show(string $id)
    {
        $doctor = Doctor::with(['user', 'services'])->find($id);

        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        return response()->json([
            'id' => $doctor->id,
            'first_name' => $doctor->user->first_name,
            'last_name' => $doctor->user->last_name,
            'email' => $doctor->user->email,
            'phone' => $doctor->user->phone,
            'specialization' => $doctor->specialization,
            'address' => $doctor->address,
            'license_number' => $doctor->license_number,
            'services' => $doctor->services
        ]);
    }

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
            'email' => 'required|email|unique:users,email,' . $doctor->user_id,
            'phone' => 'required|string',
            'specialization' => 'nullable|string',
            'address' => 'nullable|string',
            'license_number' => 'nullable|string|unique:doctors,license_number,' . $doctor->id,
            'services' => 'nullable|array',
            'services.*' => 'exists:services,id'
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

        // Sync services if provided
        if (isset($validatedData['services'])) {
            $doctor->services()->sync($validatedData['services']);
        }

        // Return updated doctor data
        return response()->json([
            'id' => $doctor->id,
            'first_name' => $doctor->user->first_name,
            'last_name' => $doctor->user->last_name,
            'email' => $doctor->user->email,
            'phone' => $doctor->user->phone,
            'specialization' => $doctor->specialization,
            'address' => $doctor->address,
            'license_number' => $doctor->license_number,
            'services' => $doctor->services
        ]);
    }

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

            $doctor->services()->detach();
            $user = $doctor->user;
            $doctor->delete();
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