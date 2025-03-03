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
        'appointment_date',
        'reason',
        'status',
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
}
