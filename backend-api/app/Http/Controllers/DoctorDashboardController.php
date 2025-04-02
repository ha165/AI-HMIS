<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Appointments;
use App\Models\Patients;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DoctorDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $doctor = Doctor::with('user')
            ->where('user_id', $user->id)
            ->first();

        if (!$doctor) {
            return response()->json([
                'error' => 'Doctor profile not found',
                'message' => 'The authenticated user does not have a doctor profile'
            ], 404);
        }
        $todayStart = Carbon::today()->startOfDay();
        $todayEnd = Carbon::today()->endOfDay();

        return response()->json([
            'doctor' => $this->formatDoctorData($doctor),
            'todaysSchedule' => $this->getTodaysAppointments($doctor->id, $todayStart, $todayEnd),
            'upcomingAppointments' => $this->getUpcomingAppointments($doctor->id, $todayEnd),
            'recentPatients' => $this->getRecentPatients($doctor->id),
            'pendingTasks' => $this->getPendingTasks($doctor->id),
            'notifications' => [],
            'performanceMetrics' => $this->getPerformanceMetrics($doctor->id)
        ]);
    }

    private function formatDoctorData($doctor)
    {
        return [
            'id' => $doctor->id,
            'user' => [
                'id' => $doctor->user->id,
                'first_name' => $doctor->user->first_name,
                'email' => $doctor->user->email
            ],
            'specialization' => $doctor->specialization,
            'license_number' => $doctor->license_number
        ];
    }

    private function getTodaysAppointments($doctorId, $start, $end)
    {
        return Appointments::with(['patient.user', 'service'])
            ->where('doctor_id', $doctorId)
            ->whereBetween('appointment_date', [$start, $end])
            ->orderBy('appointment_date')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date,
                    'patient' => $appointment->patient ? [
                        'id' => $appointment->patient->id,
                        'name' => $appointment->patient->user->first_name
                    ] : null,
                    'service' => $appointment->service,
                    'reason' => $appointment->reason,
                    'status' => $appointment->status
                ];
            });
    }

    private function getUpcomingAppointments($doctorId, $afterDate)
    {
        return Appointments::with(['patient.user', 'service'])
            ->where('doctor_id', $doctorId)
            ->where('appointment_date', '>', $afterDate)
            ->orderBy('appointment_date')
            ->limit(10)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date,
                    'patient' => $appointment->patient ? [
                        'id' => $appointment->patient->id,
                        'name' => $appointment->patient->user->first_name
                    ] : null,
                    'service' => $appointment->service,
                    'status' => $appointment->status
                ];
            });
    }

    private function getRecentPatients($doctorId)
    {
        return Patients::with(['user', 'appointments'])
            ->whereHas('appointments', function ($q) use ($doctorId) {
                $q->where('doctor_id', $doctorId);
            })
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($patient) {
                return [
                    'id' => $patient->id,
                    'name' => $patient->user->name,
                    'avatar' => null,
                    'lastVisit' => $patient->appointments->max('appointment_date'),
                    'isNew' => $patient->created_at > now()->subDays(30),
                    'status' => 'Active'
                ];
            });
    }

    private function getPendingTasks($doctorId)
    {
        return [
            [
                'id' => 1,
                'title' => 'Review lab results',
                'patientName' => 'John Doe',
                'dueDate' => now()->addDays(1)->toDateTimeString(),
                'priority' => 'High'
            ],
            [
                'id' => 2,
                'title' => 'Complete patient report',
                'patientName' => 'Jane Smith',
                'dueDate' => now()->addDays(2)->toDateTimeString(),
                'priority' => 'Medium'
            ]
        ];
    }

    private function getPerformanceMetrics($doctorId)
    {
        return [
            'satisfaction' => rand(85, 98),
            'appointmentsCompleted' => rand(30, 50),
            'avgConsultationTime' => rand(10, 20),
            'prescriptionsIssued' => rand(20, 40)
        ];
    }
}