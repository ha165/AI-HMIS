<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Departments>
 */
class DepartmentsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $departments = [
            'Human Resources',
            'Marketing',
            'Finance',
            'Information Technology',
            'Operations',
            'Sales',
            'Customer Support',
            'Research and Development',
            'Legal',
            'Administration',
            'Production',
            'Quality Assurance',
            'Public Relations',
            'Procurement',
            'Accounting'
        ];
        return [
            'name' => $this->faker->randomElement($departments),
            'description' => $this->faker->sentence
        ];
    }
}
