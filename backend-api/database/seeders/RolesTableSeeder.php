<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Roles::create(['name' => 'patient']);
        \App\Models\Roles::create(['name' => 'doctor']);
        \App\Models\Roles::create(['name' => 'admin']);
    }
}
