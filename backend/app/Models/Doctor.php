<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    /** @use HasFactory<\Database\Factories\DoctorFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'specialty',
        'availability',
        'hospitals',
        'hospital_schedules',
        'image',
        'rating',
        'consultation_fee',
    ];

    protected $casts = [
        'hospitals' => 'array',
        'hospital_schedules' => 'array',
        'rating' => 'float',
        'consultation_fee' => 'decimal:2',
    ];

    public function hospitalRecords()
    {
        return $this->belongsToMany(Hospital::class, 'doctor_hospital');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function reviews()
    {
        return $this->hasMany(DoctorReview::class);
    }
}
