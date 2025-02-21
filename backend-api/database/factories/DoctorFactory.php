<?php

namespace Database\Factories;
use App\Models\Doctor;
use App\Models\User;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Doctor>
 */
class DoctorFactory extends Factory
{
    protected $model = Doctor::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $specializations = [
            'Cardiology',
            'Dermatology',
            'Neurology',
            'Pediatrics',
            'Orthopedics',
            'General Practice',
            'Psychiatry',
            'Ophthalmology',
            'Anesthesiology',
            'Surgery'
        ];
        return [
            'user_id' => User::factory(),
            'specilization' => $this->faker->randomElement($specializations),
            'license_number' => $this->generateLicenseNumber(),
        ];

    }

    private function generateLicenseNumber()
    {
        return strtoupper($this->faker->lexify('???-####')); // Example format: ABC-1234
    }
}
