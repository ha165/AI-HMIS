<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    /** @use HasFactory<\Database\Factories\BillingFactory> */
    use HasFactory;

    protected $table = 'billings';

    protected $fillable = [
        'patient_id',
        'total_amount',
        'status',
        'due_date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patients::class);
    }
}
