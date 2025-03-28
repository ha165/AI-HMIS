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
        'service_id',
        'patient_id', // patient that initiated the appointment
        'appointment_id', // linked appointment to this transaction
        'amount',
        'phone_number', //phone used to pay
        'payment_date',//mpesa date
        'transaction_id', //mpesa transaction
        ''

    ];

    public function patient()
    {
        return $this->belongsTo(Patients::class);
    }
    public function service()
    {
        return $this->belongsTo(Service::class);
    }
    public function appointment()
    {
        return $this->belongsTo(Appointments::class);
    }
}
