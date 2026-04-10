<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use App\Models\User;
use App\Models\Doctor;

class Appointment extends Model
{
    /** @use HasFactory<\Database\Factories\AppointmentFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'doctor_id',
        'hospital',
        'date',
        'time',
        'name',
        'phone',
        'nic',
        'payment_mode',
        'status',
        'consultation_summary',
        'consultation_notes',
        'consulted_at',
    ];

    protected $casts = [
        'consulted_at' => 'datetime',
    ];

    protected $appends = [
        'queue_number',
        'estimated_arrival_time',
    ];

    protected static function booted(): void
    {
        static::creating(function (Appointment $appointment): void {
            if (empty($appointment->booking_id)) {
                $appointment->booking_id = 'BK-' . now()->format('YmdHis') . '-' . strtoupper(substr((string) uniqid(), -4));
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function medicalReports()
    {
        return $this->hasMany(MedicalReport::class);
    }

    public function review()
    {
        return $this->hasOne(DoctorReview::class);
    }

    public function getBookedHospitalAttribute(): string
    {
        $selectedHospital = trim((string) ($this->hospital ?? ''));

        return $selectedHospital !== '' ? $selectedHospital : 'Not specified';
    }

    public function getQueueNumberAttribute(): int
    {
        if (! $this->doctor_id || ! $this->date) {
            return 0;
        }

        return static::query()
            ->where('doctor_id', $this->doctor_id)
            ->whereDate('date', $this->date)
            ->where('hospital', $this->hospital)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query): void {
                $query->where('created_at', '<', $this->created_at)
                    ->orWhere(function ($sameQuery): void {
                        $sameQuery->where('created_at', $this->created_at)
                            ->where('id', '<=', $this->id);
                    });
            })
            ->count();
    }

    public function getEstimatedArrivalTimeAttribute(): ?string
    {
        if (! $this->date || ! $this->time) {
            return null;
        }

        $queueNumber = $this->queue_number;
        if ($queueNumber <= 0) {
            $queueNumber = 1;
        }

        $minutesPerPatient = AppSetting::consultationMinutesPerPatient();

        $baseArrival = Carbon::parse($this->date . ' ' . $this->time)->addMinutes(($queueNumber - 1) * $minutesPerPatient);

        return $baseArrival->toIso8601String();
    }
}
