<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentBookingMail extends Mailable
{
    use Queueable, SerializesModels;

    public Appointment $appointment;

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment->loadMissing(['doctor', 'payment', 'user']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Appointment Booking Confirmed',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.appointment_booking',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
