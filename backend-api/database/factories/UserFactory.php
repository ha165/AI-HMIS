<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;
    protected static bool $adminCreated = false;

    public function definition(): array
    {
        // Default role is patient
        $role = 'patient';

        // Create admin only if not already created (5% chance)
        if (!static::$adminCreated && $this->faker->boolean(5)) {
            $role = 'admin';
            static::$adminCreated = true;
        }
        // 30% chance for doctor (if not admin)
        elseif ($this->faker->boolean(30)) {
            $role = 'doctor';
        }

        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'role' => $role,
            'profile_photo' => fake()->imageUrl(200, 200, 'people', true, 'user'),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    // State method for admin (ensures only one)
    public function admin(): static
    {
        return $this->state(function (array $attributes) {
            static::$adminCreated = true;
            return [
                'role' => 'admin',
                'email' => 'admin@example.com', // Fixed email for easy access
                'first_name' => 'System',
                'last_name' => 'Admin',
            ];
        });
    }

    // State method for doctor
    public function doctor(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'doctor',
        ]);
    }

    // State method for patient
    public function patient(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'patient',
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}