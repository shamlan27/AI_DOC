<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_minutes_per_patient',
    ];

    protected $casts = [
        'consultation_minutes_per_patient' => 'integer',
    ];

    public static function consultationMinutesPerPatient(): int
    {
        $settings = static::query()->first();

        return max(1, (int) ($settings->consultation_minutes_per_patient ?? 20));
    }
}
