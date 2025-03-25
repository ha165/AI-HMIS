<?php
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Doctor;
class DoctorFactory extends Factory
{
    public function definition()
    {
        return [
            'user_id' => User::factory()->create(['role' => 'doctor'])->id,
            'specialization' => $this->faker->randomElement([
                'Cardiology',
                'Dermatology',
                'Neurology',
                'Pediatrics',
                'Orthopedics'
            ]),
            'address' => $this->faker->address,
            'license_number' => 'MD-' . $this->faker->unique()->numberBetween(10000, 99999),
        ];
    }

    // Attach services to doctor after creation
    public function withServices()
    {
        return $this->afterCreating(function (Doctor $doctor) {
            $services = \App\Models\Service::inRandomOrder()
                ->limit(rand(2, 5))
                ->pluck('id');
            $doctor->services()->attach($services);
        });
    }
}