<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment->loadMissing(['appointment.doctor', 'user']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Confirmation',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment_confirmation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
