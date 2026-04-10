<?php

namespace Database\Seeders;

use App\Models\Hospital;
use App\Models\Doctor;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class AdminDashboardSeeder extends Seeder
{
    public function run(): void
    {
        // Create hospitals
        $hospitals = Hospital::factory(5)->create();

        // Create doctors
        $doctors = Doctor::factory(10)->create();

        // Attach doctors to hospitals
        foreach ($doctors as $doctor) {
            $doctor->hospitalRecords()
                ->attach($hospitals->random(rand(1, 3))->pluck('id'));
        }

        // Create patients
        $patients = User::factory(15)->create();

        // Create appointments
        foreach ($patients->take(10) as $patient) {
            $appointment = Appointment::factory()
                ->for($patient)
                ->for($doctors->random())
                ->create([
                    'hospital' => $hospitals->random()->name,
                    'phone' => fake()->phoneNumber(),
                ]);

            // Create payments for some appointments
            if (rand(0, 1)) {
                Payment::factory()
                    ->for($patient)
                    ->for($appointment)
                    ->create([
                        'payment_method' => rand(0, 1) ? 'online' : 'counter',
                        'status' => rand(0, 1) ? 'completed' : 'pending',
                    ]);
            }
        }

        $this->command->info('Admin Dashboard sample data created successfully!');
    }
}
