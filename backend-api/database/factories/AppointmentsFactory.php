<?php
namespace Database\Factories;

use App\Models\Patients;
use App\Models\Doctor;
use App\Models\Schedules;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentsFactory extends Factory
{
    public function definition()
    {
        $doctor = Doctor::inRandomOrder()->first() ?? Doctor::factory()->create();
        $service = $doctor->services()->inRandomOrder()->first() ?? Service::factory()->create();

        return [
            'patient_id' => Patients::factory(),
            'doctor_id' => $doctor->id,
            'service_id' => $service->id,
            'schedule_id' => Schedules::factory()->create(['doctor_id' => $doctor->id]),
            'appointment_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'reason' => $this->faker->sentence,
            'status' => $this->faker->randomElement(['pending', 'accepted', 'completed', 'cancelled'])
        ];
    }

    public function withSpecificDoctor($doctorId)
    {
        return $this->state(function (array $attributes) use ($doctorId) {
            return [
                'doctor_id' => $doctorId,
                'schedule_id' => Schedules::factory()->create(['doctor_id' => $doctorId])
            ];
        });
    }
}