<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppSetting;
use App\Models\Doctor;
use App\Models\DoctorReview;
use App\Models\Payment;
use App\Models\User;
use App\Mail\AppointmentBookingMail;
use App\Mail\PaymentConfirmationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $appointments = $request->user()->appointments()->with('doctor', 'payment', 'review')->latest()->get();
        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'hospital' => 'required|string|max:255',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|string',
            'name' => 'required|string',
            'phone' => 'required|string',
            'nic' => 'required|string', // Requested NIC field
            'payment_mode' => 'required|in:online,counter',
            'card_type' => 'required_if:payment_mode,online|in:visa,mastercard',
            'card_holder_name' => 'required_if:payment_mode,online|string|max:255',
            'card_number' => 'required_if:payment_mode,online|digits:16',
            'expiry_month' => 'required_if:payment_mode,online|integer|min:1|max:12',
            'expiry_year' => 'required_if:payment_mode,online|integer|min:2026|max:2100',
            'cvv' => 'required_if:payment_mode,online|digits_between:3,4',
            'email' => 'nullable|email|max:255',
        ]);

        $doctor = Doctor::findOrFail($request->doctor_id);
        $hospitalSchedules = collect($doctor->hospital_schedules ?? [])
            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
            ->values();

        if ($hospitalSchedules->isNotEmpty()) {
            $this->validateDoctorScheduleByHospitalDayAndTime(
                doctor: $doctor,
                hospital: (string) $request->hospital,
                date: (string) $request->date,
                time: (string) $request->time,
            );
        } else {
            $availableHospitals = collect($doctor->hospitals ?? [])->filter()->map(fn ($name) => (string) $name)->values();

            if ($availableHospitals->isNotEmpty() && ! $availableHospitals->contains($request->hospital)) {
                throw ValidationException::withMessages([
                    'hospital' => 'Selected hospital is not available for this doctor.',
                ]);
            }
        }

        $normalizedTime = $this->normalizeTimeSlot((string) $request->time);
        if ($normalizedTime === '') {
            throw ValidationException::withMessages([
                'time' => 'Invalid time format.',
            ]);
        }

        $createdUser = null;

        if (! Auth::check() && $request->filled('email')) {
            $createdUser = User::firstOrCreate(
                ['email' => $request->email],
                [
                    'name' => $request->name,
                    'password' => Hash::make(Str::random(12)),
                ]
            );
        }

        $appointment = DB::transaction(function () use ($request, $doctor, $createdUser, $normalizedTime) {
            $paymentMode = (string) $request->payment_mode;
            $isOnline = $paymentMode === 'online';
            $userId = Auth::id() ?: $createdUser?->id;

            $appointment = Appointment::create([
                'user_id' => $userId,
                'doctor_id' => $request->doctor_id,
                'hospital' => $request->hospital,
                'date' => $request->date,
                'time' => $normalizedTime,
                'name' => $request->name,
                'phone' => $request->phone,
                'nic' => $request->nic,
                'payment_mode' => $paymentMode,
                'status' => $isOnline ? 'confirmed' : 'pending',
            ]);

            $amount = (float) ($doctor->consultation_fee ?? 1500);
            $referenceNumber = 'PAY-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(6));

            Payment::create([
                'user_id' => $userId,
                'appointment_id' => $appointment->id,
                'amount' => $amount,
                'payment_method' => $paymentMode,
                'status' => $isOnline ? 'completed' : 'pending',
                'transaction_id' => $isOnline ? 'MOCK-TXN-' . strtoupper(Str::random(10)) : null,
                'reference_number' => $referenceNumber,
                'notes' => $isOnline
                    ? sprintf(
                        'Mock online payment via %s ending %s',
                        ucfirst((string) $request->card_type),
                        substr((string) $request->card_number, -4)
                    )
                    : 'Pending counter payment',
                'payment_date' => $isOnline ? now() : null,
            ]);

            return $appointment;
        });

        $appointment->loadMissing(['user', 'doctor', 'payment']);

        try {
            if ($appointment->user?->email) {
                Mail::to($appointment->user->email)->send(new AppointmentBookingMail($appointment));

                if ($appointment->payment?->payment_method === 'online' && $appointment->payment?->status === 'completed') {
                    Mail::to($appointment->user->email)->send(new PaymentConfirmationMail($appointment->payment));
                }
            }
        } catch (\Throwable $e) {
            // Do not block booking if email delivery fails.
        }

        return response()->json($appointment, 201);
    }

    public function reschedule(Request $request, Appointment $appointment)
    {
        $user = $request->user();

        if (! $user || $appointment->user_id !== $user->id) {
            abort(403, 'You are not authorized to reschedule this appointment.');
        }

        if (in_array($appointment->status, ['completed', 'cancelled'], true)) {
            return response()->json([
                'message' => 'Only ongoing appointments can be rescheduled.',
            ], 422);
        }

        $request->validate([
            'date' => [
                'required',
                'date',
                'after_or_equal:today',
                'before_or_equal:' . now()->addDays(3)->toDateString(),
            ],
            'time' => ['required', 'string'],
        ]);

        if ((string) $request->date === (string) $appointment->date && (string) $request->time === (string) $appointment->time) {
            return response()->json([
                'message' => 'Please select a different date or time to reschedule.',
            ], 422);
        }

        $doctor = Doctor::findOrFail($appointment->doctor_id);

        $normalizedTime = $this->normalizeTimeSlot((string) $request->time);
        if ($normalizedTime === '') {
            return response()->json([
                'message' => 'Invalid time format.',
            ], 422);
        }

        try {
            $this->validateDoctorScheduleByHospitalDayAndTime(
                doctor: $doctor,
                hospital: (string) $appointment->hospital,
                date: (string) $request->date,
                time: $normalizedTime,
                ignoreAppointmentId: $appointment->id,
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => collect($e->errors())->flatten()->first() ?? 'Selected date/time is not available for this doctor at the booked hospital.',
            ], 422);
        }

        $appointment->update([
            'date' => $request->date,
            'time' => $normalizedTime,
            'status' => 'confirmed',
        ]);

        $appointment->refresh()->loadMissing(['user', 'doctor', 'payment']);

        try {
            if ($appointment->user?->email) {
                Mail::to($appointment->user->email)->send(new AppointmentBookingMail($appointment));
            }
        } catch (\Throwable $e) {
            // Ignore email errors during reschedule.
        }

        return response()->json($appointment);
    }

    public function submitReview(Request $request, Appointment $appointment)
    {
        $user = $request->user();

        if (! $user || $appointment->user_id !== $user->id) {
            abort(403, 'You are not authorized to review this appointment.');
        }

        $isConsulted = $appointment->status === 'completed'
            || ! is_null($appointment->consulted_at)
            || now()->greaterThanOrEqualTo(now()->parse((string) $appointment->date . ' ' . (string) $appointment->time));

        if (! $isConsulted) {
            return response()->json([
                'message' => 'You can review only after consultation is completed.',
            ], 422);
        }

        if ($appointment->review()->exists()) {
            return response()->json([
                'message' => 'You have already reviewed this consultation.',
            ], 422);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = DoctorReview::create([
            'user_id' => $user->id,
            'doctor_id' => $appointment->doctor_id,
            'appointment_id' => $appointment->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        $avgRating = DoctorReview::query()
            ->where('doctor_id', $appointment->doctor_id)
            ->avg('rating');

        if (! is_null($avgRating)) {
            $appointment->doctor()->update([
                'rating' => round((float) $avgRating, 1),
            ]);
        }

        return response()->json($review->load(['doctor', 'user']), 201);
    }

    private function validateDoctorScheduleByHospitalDayAndTime(Doctor $doctor, string $hospital, string $date, string $time, ?int $ignoreAppointmentId = null): void
    {
        $hospitalSchedules = collect($doctor->hospital_schedules ?? [])
            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
            ->values();

        if ($hospitalSchedules->isEmpty()) {
            return;
        }

        $selectedHospital = $hospitalSchedules->first(
            fn ($schedule) => (string) ($schedule['hospital'] ?? '') === $hospital
        );

        if (! $selectedHospital) {
            throw ValidationException::withMessages([
                'hospital' => 'Selected hospital is not available for this doctor.',
            ]);
        }

        $selectedDay = Carbon::parse($date)->format('l');
        $availableDays = collect($selectedHospital['available_days'] ?? [])
            ->filter(fn ($day) => is_string($day) && trim($day) !== '')
            ->map(fn ($day) => trim((string) $day))
            ->values();

        $specificDates = collect($selectedHospital['specific_dates'] ?? [])
            ->filter(fn ($dateItem) => is_string($dateItem) && trim($dateItem) !== '')
            ->map(fn ($dateItem) => trim((string) $dateItem))
            ->values();

        $selectedDate = Carbon::parse($date)->toDateString();

        if ($specificDates->isNotEmpty() && ! $specificDates->contains($selectedDate)) {
            throw ValidationException::withMessages([
                'date' => "Doctor is not available at {$hospital} on {$selectedDate}.",
            ]);
        }

        if ($availableDays->isNotEmpty() && ! $availableDays->contains($selectedDay)) {
            throw ValidationException::withMessages([
                'date' => "Doctor is not available at {$hospital} on {$selectedDay}.",
            ]);
        }

        $allowedTimeSlots = collect($selectedHospital['time_slots'] ?? [])
            ->filter(fn ($slot) => is_string($slot) && trim($slot) !== '')
            ->map(fn ($slot) => $this->normalizeTimeSlot((string) $slot))
            ->filter(fn ($slot) => $slot !== '')
            ->values();

        $selectedTime = $this->normalizeTimeSlot($time);
        if ($selectedTime === '') {
            throw ValidationException::withMessages([
                'time' => 'Invalid time format.',
            ]);
        }

        if ($allowedTimeSlots->isNotEmpty() && ! $allowedTimeSlots->contains($selectedTime)) {
            throw ValidationException::withMessages([
                'time' => 'Selected time is not available for this hospital.',
            ]);
        }

        $maxPatientsPerSlot = max(1, (int) ($selectedHospital['max_patients_per_slot'] ?? 1));

        $consultationEndTime = $this->resolveConsultationEndTime($selectedHospital, $allowedTimeSlots, $maxPatientsPerSlot);
        if ($consultationEndTime !== '') {
            $selectedMinutes = $this->timeToMinutes($selectedTime);
            $endMinutes = $this->timeToMinutes($consultationEndTime);

            if (! is_null($selectedMinutes) && ! is_null($endMinutes) && $selectedMinutes > $endMinutes) {
                throw ValidationException::withMessages([
                    'time' => "Selected time is after the doctor's consultation end time ({$consultationEndTime}).",
                ]);
            }
        }

        $bookedQuery = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->where('hospital', $hospital)
            ->whereDate('date', Carbon::parse($date)->toDateString())
            ->where('time', $selectedTime)
            ->where('status', '!=', 'cancelled');

        if (! is_null($ignoreAppointmentId)) {
            $bookedQuery->where('id', '!=', $ignoreAppointmentId);
        }

        $bookedCount = $bookedQuery->count();
        if ($bookedCount >= $maxPatientsPerSlot) {
            throw ValidationException::withMessages([
                'time' => "All seats are filled for {$selectedTime}. Please choose another time slot.",
            ]);
        }
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

    private function resolveConsultationEndTime(array $schedule, $allowedTimeSlots, int $maxPatientsPerSlot): string
    {
        $manualEndTime = $this->normalizeTimeSlot((string) ($schedule['consultation_end_time'] ?? ''));
        if ($manualEndTime !== '') {
            return $manualEndTime;
        }

        $normalizedSlots = collect($allowedTimeSlots)
            ->filter(fn ($slot) => is_string($slot) && trim($slot) !== '')
            ->values();

        $firstSlot = $normalizedSlots->first();
        if (! is_string($firstSlot) || trim($firstSlot) === '') {
            return '';
        }

        $firstSlotMinutes = $this->timeToMinutes($firstSlot);
        if (is_null($firstSlotMinutes)) {
            return '';
        }

        $minutesPerPatient = AppSetting::consultationMinutesPerPatient();
        $slotCount = max(1, $normalizedSlots->count());
        $totalPatientCapacity = $slotCount * max(1, $maxPatientsPerSlot);
        $calculatedEndMinutes = $firstSlotMinutes + ($totalPatientCapacity * $minutesPerPatient);
        $hours = (int) floor($calculatedEndMinutes / 60) % 24;
        $minutes = $calculatedEndMinutes % 60;

        return Carbon::createFromTime($hours, $minutes)->format('h:i A');
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
}
