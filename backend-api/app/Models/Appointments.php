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
        return $this->belongsTo(Patients::class);
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
}
