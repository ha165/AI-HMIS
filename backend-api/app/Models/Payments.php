<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payments extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentsFactory> */
    use HasFactory;

    protected $table = 'payments';

    protected $fillable = [
        'bill_id',
        'patient_id',
        'amount',
        'payment_date',
        'transaction_id',
        'payment_method',

    ];

    public function patient()
    {
        return $this->belongsTo(Patients::class);
    }
    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }
}
