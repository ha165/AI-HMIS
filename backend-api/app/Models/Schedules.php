<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedules extends Model
{
    /** @use HasFactory<\Database\Factories\SchedulesFactory> */
    use HasFactory;

    protected $table = 'schedules';

    protected $fillable = [
        'user_id',
        'start_time',
        'end_time',
        'notes',       
    ];
}
