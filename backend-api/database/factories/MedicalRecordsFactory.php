<?php

namespace Database\Factories;

use App\Models\Medical_Records;
use Illuminate\Database\Eloquent\Factories\Factory;

class MedicalRecordsFactory extends Factory
{
    protected $model = Medical_Records::class;

    public function definition()
    {
        return [
            'patient_id' => \App\Models\Patients::factory(),
            'doctor_id' => \App\Models\Doctor::factory(),
            'appointment_id' => \App\Models\Appointments::factory(),
            'diagnosis' => $this->faker->sentence,
            'prescription' => $this->faker->sentence,
            'medical_history' => $this->faker->paragraph,
            'medications' => $this->faker->words(3, true),
            'allergies' => $this->faker->words(2, true),
            'vital_signs' => [
                'blood_pressure' => $this->faker->numerify('###/##'),
                'heart_rate' => $this->faker->numberBetween(60, 100),
                'temperature' => $this->faker->randomFloat(1, 36, 38),
            ],
            'treatment_plan' => $this->faker->paragraph,
            'lab_results' => [
                'test1' => $this->faker->word,
                'result1' => $this->faker->word,
                'test2' => $this->faker->word,
                'result2' => $this->faker->word,
            ],
            'notes' => $this->faker->paragraph,
            'status' => $this->faker->randomElement(['active', 'archived', 'pending']),
        ];
    }
}