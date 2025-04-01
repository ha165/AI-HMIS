<?php

namespace App\Http\Controllers;

use App\Models\Patients;
use App\Models\Appointments;
use App\Models\Medical_Records;
use App\Models\Payments;
use Illuminate\Http\Request;

class PatientDashboardController extends Controller
{
    public function index(Request $request)
    {
        $patient = Patients::with('user')
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'patient' => $patient,
            'upcomingAppointments' => Appointments::with(['doctor.user', 'services'])
                ->where('patient_id', $patient->id)
                ->where('status', '!=', 'Completed')
                ->where('appointment_date', '>=', now())
                ->orderBy('appointment_date')
                ->limit(5)
                ->get(),
            'recentMedicalRecords' => Medical_Records::with('doctor.user')
                ->where('patient_id', $patient->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
            'activePrescriptions' => $this->getActivePrescriptions($patient->id),
            'paymentHistory' => Payments::with('service')
                ->where('patient_id', $patient->id)
                ->orderBy('payment_date', 'desc')
                ->limit(5)
                ->get(),
            'healthMetrics' => $this->getHealthMetrics($patient->id)
        ]);
    }

    private function getActivePrescriptions($patientId)
    {
        return Medical_Records::where('patient_id', $patientId)
            ->whereNotNull('prescription')
            ->where(function ($query) {
                $query->where('prescription->status', 'active')
                    ->orWhereNull('prescription->status');
            })
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($record) {
                $prescription = json_decode($record->prescription, true);
                return [
                    'id' => $record->id,
                    'medication' => $prescription['medication'] ?? 'Unknown',
                    'dosage' => $prescription['dosage'] ?? 'N/A',
                    'refills_left' => $prescription['refills_left'] ?? 0,
                    'status' => $prescription['status'] ?? 'active'
                ];
            });
    }

    private function getHealthMetrics($patientId)
    {
        $records = Medical_Records::where('patient_id', $patientId)
            ->whereNotNull('vital_signs')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $metrics = [];

        foreach ($records as $record) {
            $vitals = json_decode($record->vital_signs, true);
            foreach ($vitals as $key => $value) {
                if (!isset($metrics[$key])) {
                    $metrics[$key] = [
                        'value' => $value,
                        'unit' => $this->getUnitForMetric($key),
                        'date' => $record->created_at
                    ];
                }
            }
        }

        // Add trend analysis
        if (count($records) > 1) {
            $current = json_decode($records[0]->vital_signs, true);
            $previous = json_decode($records[1]->vital_signs, true);

            foreach ($current as $key => $value) {
                if (isset($previous[$key])) {
                    $change = $value - $previous[$key];
                    $metrics[$key]['change'] = abs($change);
                    $metrics[$key]['trend'] = $change > 0 ? 'up' : ($change < 0 ? 'down' : 'stable');
                }
            }
        }

        return $metrics;
    }

    private function getUnitForMetric($metric)
    {
        $units = [
            'blood_pressure' => 'mmHg',
            'heart_rate' => 'bpm',
            'temperature' => '°C',
            'weight' => 'kg',
            'height' => 'cm'
        ];

        return $units[$metric] ?? '';
    }
}