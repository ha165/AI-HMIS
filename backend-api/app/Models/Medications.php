<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medications extends Model
{
    /** @use HasFactory<\Database\Factories\MedicationsFactory> */
    use HasFactory;

    protected $fillable = [
        'medication_name',
        'dosage',
        'side_effects',
        'manufacturer',
        'price',
        'stock_quantity',
        'expiration_date',
        'requires_prescription',
        'category',
        'batch_number',
    ];
}
