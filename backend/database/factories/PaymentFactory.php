<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'amount' => fake()->numerify('####.##'),
            'payment_method' => fake()->randomElement(['online', 'counter']),
            'status' => fake()->randomElement(['pending', 'completed', 'failed']),
            'transaction_id' => fake()->uuid(),
            'reference_number' => fake()->unique()->numerify('PAY-###########'),
            'notes' => fake()->sentence(),
            'payment_date' => fake()->dateTimeBetween('-30 days'),
        ];
    }
}
