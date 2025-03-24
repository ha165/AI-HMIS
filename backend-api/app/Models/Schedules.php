<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedules extends Model
{
    use HasFactory;

    protected $table = 'schedules';

    protected $fillable = [
        'doctor_id',
        'start_time',
        'end_time',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    /**
     * Get the doctor this schedule belongs to
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get appointments for this schedule
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointments::class, 'schedule_id');
    }
}