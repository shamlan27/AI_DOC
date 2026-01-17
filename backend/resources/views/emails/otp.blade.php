<x-mail::message>
<div style="text-align: center; margin-bottom: 20px;">
    <img src="{{ config('app.frontend_url') }}/logo.jpg" alt="AI Doc" style="height: 60px; width: auto;">
</div>

# Verify Your Email Address

Hello,

Thank you for choosing **AI Doc**. Please use the following code to complete your registration:

<x-mail::panel>
<div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #2d3748;">
{{ $otp }}
</div>
</x-mail::panel>

**Note:** This code will expire in 10 minutes.

If you did not initiate this request, please verify your security settings.

Thanks,<br>
{{ config('app.name') }} Team
</x-mail::message>
