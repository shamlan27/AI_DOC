<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppSetting;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = Doctor::query()->get()->map(function (Doctor $doctor) {
            $schedules = collect($doctor->hospital_schedules ?? [])
                ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
                ->values()
                ->all();

            $hospitals = collect($schedules)
                ->pluck('hospital')
                ->filter()
                ->unique()
                ->values()
                ->all();

            if (empty($hospitals)) {
                $hospitals = collect($doctor->hospitals ?? [])->filter()->values()->all();
            }

            return array_merge($doctor->toArray(), [
                'hospitals' => $hospitals,
                'hospital_schedules' => $schedules,
            ]);
        });

        return response()->json($doctors);
    }

    public function show($id)
    {
        $doctor = Doctor::findOrFail($id);

        $schedules = collect($doctor->hospital_schedules ?? [])
            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
            ->values()
            ->all();

        $hospitals = collect($schedules)
            ->pluck('hospital')
            ->filter()
            ->unique()
            ->values()
            ->all();

        if (empty($hospitals)) {
            $hospitals = collect($doctor->hospitals ?? [])->filter()->values()->all();
        }

        return response()->json(array_merge($doctor->toArray(), [
            'hospitals' => $hospitals,
            'hospital_schedules' => $schedules,
        ]));
    }

    public function slotAvailability(Request $request, $id)
    {
        $validated = $request->validate([
            'hospital' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $doctor = Doctor::findOrFail($id);
        $hospital = trim((string) $validated['hospital']);
        $date = Carbon::parse((string) $validated['date'])->toDateString();

        $schedule = $this->findScheduleForHospital($doctor, $hospital);
        if (! $schedule) {
            throw ValidationException::withMessages([
                'hospital' => 'Selected hospital is not configured for this doctor.',
            ]);
        }

        $rawSlots = collect($schedule['time_slots'] ?? [])
            ->filter(fn ($slot) => is_string($slot) && trim($slot) !== '')
            ->map(fn ($slot) => $this->normalizeTimeSlot((string) $slot))
            ->filter(fn ($slot) => $slot !== '')
            ->values();

        $maxPatientsPerSlot = max(1, (int) ($schedule['max_patients_per_slot'] ?? 1));
        $consultationEndTime = $this->resolveConsultationEndTime($schedule, $rawSlots, $maxPatientsPerSlot);
        if ($consultationEndTime !== '') {
            $endMinutes = $this->timeToMinutes($consultationEndTime);
            if (! is_null($endMinutes)) {
                $rawSlots = $rawSlots
                    ->filter(function (string $slot) use ($endMinutes): bool {
                        $slotMinutes = $this->timeToMinutes($slot);
                        return ! is_null($slotMinutes) && $slotMinutes <= $endMinutes;
                    })
                    ->values();
            }
        }

        $bookedByTime = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->where('hospital', $hospital)
            ->whereDate('date', $date)
            ->where('status', '!=', 'cancelled')
            ->select('time')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('time')
            ->get()
            ->mapWithKeys(function ($row) {
                $normalized = $this->normalizeTimeSlot((string) $row->time);
                return $normalized === '' ? [] : [$normalized => (int) $row->total];
            });

        $slots = $rawSlots->map(function (string $slot) use ($bookedByTime, $maxPatientsPerSlot) {
            $booked = (int) ($bookedByTime[$slot] ?? 0);
            $remaining = max(0, $maxPatientsPerSlot - $booked);

            return [
                'time' => $slot,
                'booked' => $booked,
                'max_patients' => $maxPatientsPerSlot,
                'remaining' => $remaining,
                'is_available' => $remaining > 0,
            ];
        })->values();

        return response()->json([
            'doctor_id' => $doctor->id,
            'hospital' => $hospital,
            'date' => $date,
            'consultation_end_time' => $consultationEndTime !== '' ? $consultationEndTime : null,
            'max_patients_per_slot' => $maxPatientsPerSlot,
            'slots' => $slots,
        ]);
    }

    private function findScheduleForHospital(Doctor $doctor, string $hospital): ?array
    {
        $schedules = collect($doctor->hospital_schedules ?? [])
            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
            ->values();

        $match = $schedules->first(
            fn ($schedule) => trim((string) ($schedule['hospital'] ?? '')) === $hospital
        );

        return is_array($match) ? $match : null;
    }

    private function normalizeTimeSlot(string $value): string
    {
        $time = trim($value);
        if ($time === '') {
            return '';
        }

        foreach (['g:i A', 'g:i a', 'h:i A', 'h:i a', 'H:i', 'H:i:s'] as $format) {
            try {
                return Carbon::createFromFormat($format, $time)->format('h:i A');
            } catch (\Throwable $e) {
                // Try next format.
            }
        }

        return strtoupper(preg_replace('/\s+/', ' ', $time) ?? $time);
    }

    private function timeToMinutes(string $time): ?int
    {
        try {
            $parsed = Carbon::createFromFormat('h:i A', $time);
            return ((int) $parsed->format('H')) * 60 + ((int) $parsed->format('i'));
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function resolveConsultationEndTime(array $schedule, $normalizedSlots, int $maxPatientsPerSlot): string
    {
        $manualEndTime = $this->normalizeTimeSlot((string) ($schedule['consultation_end_time'] ?? ''));
        if ($manualEndTime !== '') {
            return $manualEndTime;
        }

        $slots = collect($normalizedSlots)
            ->filter(fn ($slot) => is_string($slot) && trim($slot) !== '')
            ->values();

        $firstSlot = $slots->first();
        if (! is_string($firstSlot) || trim($firstSlot) === '') {
            return '';
        }

        $firstSlotMinutes = $this->timeToMinutes($firstSlot);
        if (is_null($firstSlotMinutes)) {
            return '';
        }

        $minutesPerPatient = AppSetting::consultationMinutesPerPatient();
        $slotCount = max(1, $slots->count());
        $totalPatientCapacity = $slotCount * max(1, $maxPatientsPerSlot);
        $calculatedEndMinutes = $firstSlotMinutes + ($totalPatientCapacity * $minutesPerPatient);
        $hours = (int) floor($calculatedEndMinutes / 60) % 24;
        $minutes = $calculatedEndMinutes % 60;

        return Carbon::createFromTime($hours, $minutes)->format('h:i A');
    }
}
