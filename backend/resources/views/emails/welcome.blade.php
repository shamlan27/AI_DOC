<x-mail::message>
<div style="text-align: center; margin-bottom: 20px;">
    <img src="{{ config('app.frontend_url') }}/logo.jpg" alt="AI Doc" style="height: 60px; width: auto;">
</div>

# Welcome to AI Doc, {{ $name }}! 🎉

We are excited to have you start your journey with us. **AI Doc** provides you with cutting-edge health insights powered by AI.

<x-mail::button :url="$url" color="success">
Go to Dashboard
</x-mail::button>

### Here's what you can do:
- **🔍 Analyze Symptoms**: Get instant advice.
- **👨‍⚕️ Find Specialists**: Book appointments easily.
- **📂 Manage Records**: Securely store your reports.

If you have any questions, our support team is here to help.

Stay Healthy,<br>
{{ config('app.name') }} Team
</x-mail::message>
