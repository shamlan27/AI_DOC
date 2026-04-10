<x-mail::message>
# Your AI Doc Account Has Been Created

Hello {{ $name }},

An account has been created for you by the admin team.

<x-mail::panel>
Email: {{ $email }}

Temporary Password: {{ $password }}
</x-mail::panel>

<x-mail::button :url="env('FRONTEND_URL', 'http://localhost:3000') . '/auth/login'">
Login to Dashboard
</x-mail::button>

Please change your password after your first login.

Thanks,<br>
{{ config('app.name') }} Team
</x-mail::message>
