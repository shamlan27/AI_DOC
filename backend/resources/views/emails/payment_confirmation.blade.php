<x-mail::message>
# Payment Confirmed

Hello {{ $payment->user?->name ?? 'Patient' }},

Your online payment has been completed successfully.

<x-mail::panel>
Reference #: {{ $payment->reference_number }}

Transaction ID: {{ $payment->transaction_id ?? 'N/A' }}

Amount: LKR {{ number_format((float) $payment->amount, 2) }}

Method: {{ ucfirst($payment->payment_method) }}

Booking ID: {{ $payment->appointment?->booking_id ?? 'N/A' }}

Queue Number: {{ $payment->appointment?->queue_number ?? 'N/A' }}
</x-mail::panel>

<x-mail::button :url="config('app.url')">
View Dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }} Team
</x-mail::message>
