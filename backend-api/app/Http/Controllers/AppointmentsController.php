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

        $query = Appointments::with([
            'patient.user:id,first_name,last_name,phone',
            'doctor.user:id,first_name,last_name,phone',
            'doctor:id,specialization',
            'services:id,name'
        ]);

        // Role-based filtering
        if ($user->role === 'patient') {
            $query->whereHas('patient', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role === 'doctor') {
            $query->whereHas('doctor', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Add pagination
        $appointments = $query->paginate(15); // Adjust per page as needed

        if ($appointments->isEmpty()) {
            return response()->json(['message' => 'No appointments found'], 404);
        }

        $formattedData = $appointments->getCollection()->map(function ($appointment) {
            return [
                "id" => $appointment->id,
                "patient_name" => $this->formatName($appointment->patient->user ?? null),
                "service_name" => $appointment->services->name ?? 'N/A',
                "doctor_name" => $this->formatName($appointment->doctor->user ?? null),
                "patient_phone" => $appointment->patient->user->phone ?? 'N/A',
                "doctor_phone" => $appointment->doctor->user->phone ?? 'N/A',
                "specialization" => $appointment->doctor->specialization ?? 'N/A',
                "appointment_date" => $appointment->appointment_date?->format('Y-m-d') ?? 'N/A',
                "status" => ucfirst($appointment->status ?? 'pending')
            ];
        });

        return response()->json([
            'data' => $formattedData,
            'pagination' => [
                'total' => $appointments->total(),
                'per_page' => $appointments->perPage(),
                'current_page' => $appointments->currentPage(),
                'last_page' => $appointments->lastPage(),
            ]
        ]);
    }

    private function formatName($user)
    {
        return $user ? trim($user->first_name . ' ' . $user->last_name) : 'N/A';
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
}
