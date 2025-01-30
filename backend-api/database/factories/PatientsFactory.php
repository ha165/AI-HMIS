<?php
namespace Database\Factories;

use App\Models\Patients;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientsFactory extends Factory
{
    protected $model = Patients::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'dob' => $this->faker->date,
            'gender' => $this->faker->randomElement(['male', 'female']),
            'address' => $this->faker->address,
            'emergency_contact' => $this->faker->phoneNumber,
        ];
    }
}
