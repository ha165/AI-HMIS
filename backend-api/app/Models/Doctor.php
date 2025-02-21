<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $table = 'doctors';

    protected $fillable = [
        'user_id',
        'specialization',
        'contact_number',
        'address',
        'license_number',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
