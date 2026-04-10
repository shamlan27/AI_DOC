<x-mail::message>
# Appointment Booking Confirmed

Hello {{ $appointment->user?->name ?? 'Patient' }},

Your appointment has been confirmed.

<x-mail::panel>
Booking ID: {{ $appointment->booking_id }}

Queue Number: {{ $appointment->queue_number }}

Estimated Arrival: {{ $appointment->estimated_arrival_time ? \Carbon\Carbon::parse($appointment->estimated_arrival_time)->format('Y-m-d h:i A') : 'Not available' }}

Doctor: {{ $appointment->doctor?->name ?? $appointment->doctor_name ?? 'Doctor' }}

Hospital: {{ $appointment->booked_hospital }}

Date: {{ $appointment->date }}

Time: {{ $appointment->time }}
</x-mail::panel>

<x-mail::button :url="config('app.url')">
Open Appointment Portal
</x-mail::button>

You can print your slip from the dashboard using the Booking ID above.

Thanks,<br>
{{ config('app.name') }} Team
</x-mail::message>
