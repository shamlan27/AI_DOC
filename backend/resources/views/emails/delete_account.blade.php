<x-mail::message>
# Account Deletion Request

**Warning:** You have requested to delete your AI Doc account. This action is **permanent** and cannot be undone. All your data will be erased.

To confirm deletion, please use the code below:

<x-mail::panel>
<div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #e53e3e;">
{{ $otp }}
</div>
</x-mail::panel>

If you did not request this, please change your password immediately.

Regards,<br>
{{ config('app.name') }} Security Team
</x-mail::message>
