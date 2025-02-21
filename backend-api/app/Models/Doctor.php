<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;
    protected $table = 'doctors';

    protected $fillable = [
        'user_id',
        'specialization',
        'address',
        'license_number',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
