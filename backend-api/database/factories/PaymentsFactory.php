<?php

namespace Database\Factories;

use App\Models\Payments;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentsFactory extends Factory
{
    protected $model = Payments::class;

    public function definition()
    {
        $statuses = [
            Payments::STATUS_PENDING,
            Payments::STATUS_PROCESSING,
            Payments::STATUS_COMPLETED,
            Payments::STATUS_FAILED,
            Payments::STATUS_CANCELLED,
            Payments::STATUS_REVERSED,
        ];

        return [
            'service_id' => \App\Models\Service::factory(),
            'patient_id' => \App\Models\Patients::factory(),
            'appointment_id' => \App\Models\Appointments::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'phone_number' => $this->faker->phoneNumber,
            'payment_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'transaction_id' => $this->faker->unique()->uuid,
            'mpesa_receipt' => $this->faker->unique()->numerify('REC#######'),
            'payment_status' => $this->faker->randomElement($statuses),
            'merchant_request_id' => $this->faker->uuid,
            'checkout_request_id' => $this->faker->uuid,
            'result_code' => $this->faker->numberBetween(0, 1),
            'result_desc' => $this->faker->sentence,
        ];
    }
}