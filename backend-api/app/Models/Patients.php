<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patients extends Model
{
    /** @use HasFactory<\Database\Factories\PatientsFactory> */
    use HasFactory;

    protected $table = 'patients';
    protected $fillable = [
        'user_id',
        'dob',
        'gender',
        'address',
        'emergency_contact',
    ];
    protected $casts = [
        'dob' => 'date', 
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function appointments()
    {
        return $this->hasMany(Appointments::class, 'patient_id');
    }
    public function billing()
    {
        return $this->hasMany(Billing::class);
    }
    public function medical_records()
    {
        return $this->hasMany(Medical_records::class);
    }
}
