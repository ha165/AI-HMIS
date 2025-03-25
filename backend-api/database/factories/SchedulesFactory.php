<?php
namespace Database\Factories;

use App\Models\Doctor;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class SchedulesFactory extends Factory
{
    public function definition()
    {
        $startTime = $this->faker->dateTimeBetween('+1 day', '+1 month');
        $startTime->setTime(
            $this->faker->numberBetween(8, 16), // Hours (8AM-4PM)
            0, // Minutes
            0  // Seconds
        );

        $doctor = Doctor::inRandomOrder()->first() ?? Doctor::factory()->create();

        return [
            'doctor_id' => $doctor->id,
            'start_time' => $startTime,
            'end_time' => Carbon::instance($startTime)->addMinutes(30), // Default 30-min slots
            'notes' => $this->faker->optional()->sentence
        ];
    }

    public function available()
    {
        return $this->state(function (array $attributes) {
            return [
                'start_time' => now()->addDays(rand(1, 30))
            ];
        });
    }
}