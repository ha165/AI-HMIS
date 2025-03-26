<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointments extends Model
{
    /** @use HasFactory<\Database\Factories\AppointmentsFactory> */
    use HasFactory;

    protected $table = 'appointments';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'schedule_id',
        'service_id',
        'appointment_date',
        'reason',
        'status',
    ];

    protected $casts = [
        'appointment_date' => 'datetime',
    ];


    public function patient()
    {
        return $this->belongsTo(Patients::class,'patient_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function schedules()
    {
        return $this->belongsTo(Schedules::class, 'schedule_id');
    }
    public function services()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
    public function medical_records()
    {
        return $this->hasOne(Medical_Records::class);
    }

    public function completed(array $medicalData = []): Medical_Records
    {
        if ($this->status == 'completed') {
            throw new \Exception('Appointment already completed');
        }
        $this->update(['status' => 'completed']);

        //create a medical record linked to this appointment
        return Medical_Records::create([
            'patient_id' => $this->patient_id,
            'doctor_id' => $this->doctor_id,
            'appointment_id' => $this->id,
            'diagnosis' => $medicalData['diagnosis'] ?? null,
            'prescription' => $medicalData['prescription'] ?? null,
            'vital_signs' => $medicalData['vital_signs'] ?? null,
        ]);
    }
}
