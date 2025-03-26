<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medical_Records extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'medical_records';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_id',
        'diagnosis',
        'prescription',
        'medical_history',
        'medications',
        'allergies',
        'vital_signs',
        'treatment_plan',
        'lab_results',
        'notes',
        'status',
    ];

    // Cast JSON fields to arrays
    protected $casts = [
        'vital_signs' => 'array',
        'lab_results' => 'array',
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patients::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    public function appointment()
    {
        return $this->belongsTo(Appointments::class, 'appointment_id');
    }
}