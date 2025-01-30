<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patients;
use App\Models\Appointments;
use App\Models\Billing;

class DatabaseSeeder extends Seeder
{
    public function run()
    {

        User::factory(200)->create();


        Patients::factory(200)->create();


        Appointments::factory(200)->create();


        Billing::factory(200)->create();
    }
}
