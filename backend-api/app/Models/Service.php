<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_minutes',
        'is_active'
    ];

    public function department()
    {
        return $this->belongsTo(Departments::class);
    }
    public function doctors()
    {
        return $this->belongsToMany(Doctor::class);
    }
}
