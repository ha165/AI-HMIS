<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create services first
        \App\Models\Service::factory(10)->create();

        // Create doctors with services
        \App\Models\Doctor::factory(5)
            ->withServices()
            ->create();

        // Create schedules for each doctor
        \App\Models\Doctor::all()->each(function ($doctor) {
            \App\Models\Schedules::factory(8)
                ->create(['doctor_id' => $doctor->id]);
        });

        // Create appointments
        \App\Models\Appointments::factory(20)->create();
    }
}