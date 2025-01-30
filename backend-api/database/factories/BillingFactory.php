<?php
namespace Database\Factories;

use App\Models\Billing;
use App\Models\Patients;
use Illuminate\Database\Eloquent\Factories\Factory;

class BillingFactory extends Factory
{
    protected $model = Billing::class;


    public function definition()
    {
        return [
            'patient_id' => Patients::factory(),
            'amount' => $this->faker->randomFloat(2, 1000, 10000),
            'status' => $this->faker->randomElement(['pending', 'paid', 'canceled']),
            'due_date' => $this->faker->dateTimeBetween('now', '+1 year'),
        ];
    }
}
