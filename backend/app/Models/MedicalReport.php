<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class MedicalReport extends Model
{
    /** @use HasFactory<\Database\Factories\MedicalReportFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'doctor_name',
        'file_path',
        'report_type',
        'report_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
