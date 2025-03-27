<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;
    protected $table = 'Doctors';

    protected $fillable = [
        'user_id',
        'specialization',
        'address',
        'license_number',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function services()
    {
        return $this->belongsToMany(Service::class);
    }
    public function schedules()
    {
        return $this->hasMany(Schedules::class);
    }
    public function appointments()
    {
        return $this->hasMany(Appointments::class);
    }
    public function medical_records()
    {
        return $this->hasMany(Medical_records::class);
    }
}
