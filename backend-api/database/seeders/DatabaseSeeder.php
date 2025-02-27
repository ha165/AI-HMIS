<?php
namespace Database\Seeders;

use App\Models\Departments;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patients;
use App\Models\Appointments;
use App\Models\Billing;
use App\Models\Doctor;

class DatabaseSeeder extends Seeder
{
    public function run()
    {

        User::factory(200)->create();


        Patients::factory(200)->create();


        Appointments::factory(200)->create();


        Billing::factory(200)->create();


        Doctor::factory(200)->create();

        Departments::factory(200)->create();
    }
}
