<x-mail::message>
<div style="text-align: center; margin-bottom: 20px;">
    <img src="{{ config('app.frontend_url') }}/logo.jpg" alt="AI Doc" style="height: 60px; width: auto;">
</div>

# Reset Your Password

Hello,

You are receiving this email because we received a password reset request for your account.

<x-mail::button :url="$url" color="primary">
Reset Password
</x-mail::button>

This password reset link will expire in 60 minutes.

If you did not request a password reset, no further action is required.

Regards,<br>
{{ config('app.name') }} Team

<x-mail::subcopy>
If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
{{ $url }}
</x-mail::subcopy>
</x-mail::message>
