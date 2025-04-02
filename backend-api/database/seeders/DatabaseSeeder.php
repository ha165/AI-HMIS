<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create departments first
        \App\Models\Departments::factory(10)->create();

        // Create services with department relationships
        \App\Models\Service::factory(20)
            ->create();

        // Create users (assuming you have a User model)
        \App\Models\User::factory(200)->create();

        // Create doctors with services
        \App\Models\Doctor::factory(200)
            ->create()
            ->each(function ($doctor) {
                // Attach random services to each doctor
                $services = \App\Models\Service::inRandomOrder()
                    ->limit(rand(1, 5))
                    ->get();
                $doctor->services()->attach($services);
            });

        // Create schedules for each doctor
        \App\Models\Doctor::all()->each(function ($doctor) {
            \App\Models\Schedules::factory(rand(5, 10))
                ->create(['doctor_id' => $doctor->id]);
        });

        // Create patients
        \App\Models\Patients::factory(200)->create();

        // Create appointments
        \App\Models\Appointments::factory(200)
            ->create()
            ->each(function ($appointment) {
                // Create payment for each appointment
                \App\Models\Payments::factory()->create([
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'service_id' => $appointment->service_id,
                ]);
            });

        // Create medical records
        \App\Models\Medical_Records::factory(200)->create();

        // Create additional payments (some appointments may have multiple payments)
        \App\Models\Payments::factory(200)->create();
    }
}