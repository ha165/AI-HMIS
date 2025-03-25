<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    protected static $serviceNames = [
        'General Checkup',
        'Dental Cleaning',
        'Eye Examination',
        'Physical Therapy',
        'Vaccination',
        'Allergy Testing',
        'Blood Test',
        'X-Ray Scan',
        'Ultrasound',
        'MRI Scan',
        'ECG',
        'Colonoscopy',
        'Endoscopy',
        'Vaccination',
        'Chiropractic Adjustment'
    ];

    public function definition()
    {
        $durations = [15, 30, 45, 60];
        
        return [
            'name' => $this->faker->unique()->randomElement(self::$serviceNames),
            'description' => $this->faker->sentence(10),
            'price' => $this->faker->numberBetween(500, 5000),
            'duration_minutes' => $this->faker->randomElement($durations),
            'is_active' => true // Changed from random boolean to always active
        ];
    }
}