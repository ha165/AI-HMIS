<?php

namespace Database\Factories;
use App\Models\Doctor;
use App\Models\User;

use Illuminate\Database\Eloquent\Factories\Factory;


class DoctorFactory extends Factory
{
    protected $model = Doctor::class;
   
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
            'specialization' => $this->faker->randomElement($specializations),
            'license_number' => $this->generateLicenseNumber(),
        ];

    }

    private function generateLicenseNumber()
    {
        return strtoupper($this->faker->lexify('???-####')); /
    }
}
