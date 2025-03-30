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
        'patient_id',
        'appointment_id',
        'amount',
        'phone_number',
        'payment_date',
        'transaction_id',
        'mpesa_receipt',
        'payment_status',
        'merchant_request_id',
        'checkout_request_id',
        'result_code',
        'result_desc'

    ];
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REVERSED = 'reversed';

    protected $casts = [
        'payment_date' => 'datetime',
    ];

    public function isPending()
    {
        return $this->payment_status === self::STATUS_PENDING;
    }
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

    // Helper method
    public function isSuccessful()
    {
        return $this->payment_status === self::STATUS_COMPLETED;
    }
}
