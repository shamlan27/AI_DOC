<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Appointment;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $doctor_name
 * @property string|null $file_path
 * @property string|null $report_type
 * @property \Illuminate\Support\Carbon|null $report_date
 */
class MedicalReport extends Model
{
    /** @use HasFactory<\Database\Factories\MedicalReportFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'appointment_id',
        'doctor_name',
        'file_path',
        'report_type',
        'report_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
