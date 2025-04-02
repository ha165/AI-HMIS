<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use App\Models\Patients;
use App\Models\Payments;
use App\Models\Medical_Records;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashBoardController extends Controller
{
    public function getDashboardStats()
    {
        // Get counts for various metrics
        $totalPatients = Patients::count();
        $totalAppointments = Appointments::count();
        $todayAppointments = Appointments::whereDate('appointment_date', today())->count();
        $completedPayments = Payments::where('payment_status', Payments::STATUS_COMPLETED)->count();

        // Get recent appointments
        $recentAppointments = Appointments::with(['patient', 'doctor'])
            ->orderBy('appointment_date', 'desc')
            ->take(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient->user->first_name ?? 'N/A',
                    'doctor_name' => $appointment->doctor->user->first_name ?? 'N/A',
                    'date' => $appointment->appointment_date->format('Y-m-d H:i'),
                    'status' => $appointment->status,
                ];
            });

        // Get revenue data (last 12 months)
        $revenueData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->format('M Y');

            $revenue = Payments::where('payment_status', Payments::STATUS_COMPLETED)
                ->whereYear('payment_date', $date->year)
                ->whereMonth('payment_date', $date->month)
                ->sum('amount');

            $revenueData[] = [
                'month' => $month,
                'revenue' => $revenue,
            ];
        }

        // Get appointment status distribution
        $appointmentStatuses = Appointments::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Get payment status distribution
        $paymentStatuses = Payments::selectRaw('payment_status, count(*) as count')
            ->groupBy('payment_status')
            ->get()
            ->pluck('count', 'payment_status');

        return response()->json([
            'stats' => [
                'total_patients' => $totalPatients,
                'total_appointments' => $totalAppointments,
                'today_appointments' => $todayAppointments,
                'completed_payments' => $completedPayments,
                'monthly_revenue' => array_sum(array_column($revenueData, 'revenue')),
            ],
            'recent_appointments' => $recentAppointments,
            'revenue_data' => $revenueData,
            'appointment_statuses' => $appointmentStatuses,
            'payment_statuses' => $paymentStatuses,
        ]);
    }
}