<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;
use Illuminate\Support\Facades\Schema;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hasAvailability = Schema::hasColumn('doctors', 'availability');
        $hasQualification = Schema::hasColumn('doctors', 'qualification');
        $hasExperienceYears = Schema::hasColumn('doctors', 'experience_years');
        $hasBio = Schema::hasColumn('doctors', 'bio');
        $hasConsultationFee = Schema::hasColumn('doctors', 'consultation_fee');
        $hasIsActive = Schema::hasColumn('doctors', 'is_active');

        $doctors = [
            [
                'name' => 'Dr. Sarah Smith',
                'specialty' => 'Neurologist',
                'availability' => 'Available Today',
                'hospitals' => ['City General Hospital', 'Sunrise Neuro Center'],
                'image' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.9,
            ],
            [
                'name' => 'Dr. James Wilson',
                'specialty' => 'Cardiologist',
                'availability' => 'Available Tomorrow',
                'hospitals' => ['Heart Care Institute', 'Metro Medical Hospital'],
                'image' => 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.8,
            ],
            [
                'name' => 'Dr. Emily Chen',
                'specialty' => 'Dermatologist',
                'availability' => 'Available Today',
                'hospitals' => ['Skin Wellness Clinic', 'City General Hospital'],
                'image' => 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.7,
            ],
            [
                'name' => 'Dr. Michael Brown',
                'specialty' => 'General Physician',
                'availability' => 'Available Today',
                'hospitals' => ['Metro Medical Hospital', 'Green Valley Hospital'],
                'image' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.6,
            ],
            [
                'name' => 'Dr. Lisa Patel',
                'specialty' => 'Pediatrician',
                'availability' => 'Next Available: Mon',
                'hospitals' => ['Children Care Hospital', 'Green Valley Hospital'],
                'image' => 'https://images.unsplash.com/photo-1623854764803-3dfbebc53a4e?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.9,
            ],
            [
                'name' => 'Dr. David Kim',
                'specialty' => 'Orthopedic Surgeon',
                'availability' => 'Available Tomorrow',
                'hospitals' => ['Ortho Plus Center', 'City General Hospital'],
                'image' => 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.8,
            ],
            [
                'name' => 'Dr. Rachel Green',
                'specialty' => 'Psychiatrist',
                'availability' => 'Available Today',
                'hospitals' => ['Mind Care Hospital', 'Sunrise Neuro Center'],
                'image' => 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.9,
            ],
            [
                'name' => 'Dr. Robert Stark',
                'specialty' => 'ENT Specialist',
                'availability' => 'Available Wed',
                'hospitals' => ['ENT Advanced Clinic', 'Metro Medical Hospital'],
                'image' => 'https://images.unsplash.com/photo-1582752948209-6dc8d260513e?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.5,
            ],
             [
                'name' => 'Dr. Amanda Lee',
                'specialty' => 'Gynecologist',
                'availability' => 'Available Today',
                'hospitals' => ['Women Wellness Hospital', 'City General Hospital'],
                'image' => 'https://images.unsplash.com/photo-1651008325506-71d345a6101c?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.8,
            ],
            [
                'name' => 'Dr. John Watson',
                'specialty' => 'Endocrinologist',
                'availability' => 'Available Tomorrow',
                'hospitals' => ['Endo Care Center', 'Heart Care Institute'],
                'image' => 'https://images.unsplash.com/photo-1582752948331-f05051314ae4?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.7,
            ],
            [
                'name' => 'Dr. Priya Menon',
                'specialty' => 'Dentist',
                'availability' => 'Available Today',
                'hospitals' => ['Smile Dental Clinic', 'City General Hospital'],
                'image' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
                'rating' => 4.8,
            ]
        ];

        foreach ($doctors as $doctor) {
            $payload = [
                'specialty' => $doctor['specialty'],
                'hospitals' => $doctor['hospitals'],
                'image' => $doctor['image'],
                'rating' => $doctor['rating'],
            ];

            if ($hasAvailability) {
                $payload['availability'] = $doctor['availability'];
            }

            if ($hasQualification) {
                $payload['qualification'] = 'MBBS, MD';
            }

            if ($hasExperienceYears) {
                $payload['experience_years'] = 8;
            }

            if ($hasBio) {
                $payload['bio'] = 'Experienced specialist committed to patient-centered care.';
            }

            if ($hasConsultationFee) {
                $payload['consultation_fee'] = 1500;
            }

            if ($hasIsActive) {
                $payload['is_active'] = true;
            }

            Doctor::updateOrCreate(
                ['name' => $doctor['name']],
                $payload
            );
        }
    }
}
