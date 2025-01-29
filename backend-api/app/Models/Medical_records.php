<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medical_records extends Model
{
    /** @use HasFactory<\Database\Factories\MedicalRecordsFactory> */
    use HasFactory;

    protected $table = 'medical_records';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'diagnosis',
        'prescription',
        'notes'
    ];

    public function patient(){
        return $this->belongsTo(Patients::class);
    }
    public function user(){
        return $this->belongsTo(User::class);
    }

}
