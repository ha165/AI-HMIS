<?php

namespace Database\Factories;
use App\Models\Appointments;
use App\Models\Patients;
use App\Models\User;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointments>
 */
class AppointmentsFactory extends Factory
{
    protected  $model = Appointments::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => Patients::factory(),
            'doctor_id' => User::factory(),
            'appointment_date' => $this->faker->dateTimeBetween('now', '+1 year'),
            'reason' => $this->faker->sentence,
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'canceled']),
        ];
    }
}
