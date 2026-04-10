<?php

namespace App\Filament\Admin\Resources\MedicalReportResource\Pages;

use App\Filament\Admin\Resources\MedicalReportResource;
use App\Models\Appointment;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateMedicalReport extends CreateRecord
{
    protected static string $resource = MedicalReportResource::class;

    public function mount(): void
    {
        parent::mount();

        $appointmentId = (int) request()->query('appointment_id');
        if (! $appointmentId) {
            return;
        }

        $appointment = Appointment::with(['doctor'])->find($appointmentId);
        if (! $appointment) {
            return;
        }

        $this->form->fill([
            'appointment_id' => $appointment->id,
            'user_id' => $appointment->user_id,
            'doctor_name' => $appointment->doctor?->name,
            'report_date' => $appointment->date,
        ]);
    }
}
