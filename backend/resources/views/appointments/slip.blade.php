<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Slip</title>
    <style>
        :root {
            color-scheme: dark;
        }
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #0f172a;
            color: #e5e7eb;
        }
        .page {
            max-width: 820px;
            margin: 32px auto;
            padding: 24px;
        }
        .card {
            background: linear-gradient(180deg, rgba(15,23,42,.98), rgba(17,24,39,.98));
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 24px 80px rgba(0,0,0,.35);
        }
        .header {
            padding: 24px;
            border-bottom: 1px solid rgba(255,255,255,.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
        }
        .brand {
            font-size: 20px;
            font-weight: 700;
            color: white;
        }
        .badge {
            display: inline-block;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(59,130,246,.15);
            border: 1px solid rgba(59,130,246,.35);
            color: #93c5fd;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: .04em;
        }
        .content {
            padding: 24px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
        }
        .field {
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 18px;
            padding: 14px 16px;
        }
        .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .12em;
            color: #94a3b8;
            margin-bottom: 8px;
        }
        .value {
            font-size: 16px;
            font-weight: 700;
            color: white;
            word-break: break-word;
        }
        .footer {
            padding: 20px 24px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        .actions button {
            border: 0;
            border-radius: 12px;
            padding: 12px 16px;
            font-weight: 700;
            cursor: pointer;
        }
        .print-btn {
            background: #2563eb;
            color: white;
        }
        .close-btn {
            background: rgba(255,255,255,.08);
            color: #e5e7eb;
        }
        .muted {
            color: #94a3b8;
            font-size: 14px;
        }
        @media print {
            body { background: white; color: black; }
            .page { margin: 0; padding: 0; max-width: none; }
            .card { box-shadow: none; border: 0; border-radius: 0; }
            .actions { display: none; }
        }
        @media (max-width: 640px) {
            .grid { grid-template-columns: 1fr; }
            .header, .footer { flex-direction: column; align-items: flex-start; }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="card">
            <div class="header">
                <div>
                    <div class="brand">AI Doc Appointment Slip</div>
                    <div class="muted">Printable booking summary</div>
                </div>
                <div class="badge">Booking ID: {{ $appointment->booking_id }}</div>
            </div>

            <div class="content">
                <div class="grid">
                    <div class="field">
                        <div class="label">Patient</div>
                        <div class="value">{{ $appointment->user?->name ?? $appointment->name }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Booking ID</div>
                        <div class="value">{{ $appointment->booking_id }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Doctor</div>
                        <div class="value">{{ $appointment->doctor?->name ?? 'Doctor' }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Queue Number</div>
                        <div class="value">{{ $appointment->queue_number }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Hospital</div>
                        <div class="value">{{ $appointment->booked_hospital }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Estimated Arrival</div>
                        <div class="value">{{ $appointment->estimated_arrival_time ? \Carbon\Carbon::parse($appointment->estimated_arrival_time)->format('Y-m-d h:i A') : 'Not available' }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Date</div>
                        <div class="value">{{ $appointment->date }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Time</div>
                        <div class="value">{{ $appointment->time }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Payment Method</div>
                        <div class="value">{{ ucfirst($appointment->payment_mode) }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Payment Status</div>
                        <div class="value">{{ ucfirst($appointment->payment?->status ?? $appointment->status) }}</div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <div class="muted">Please arrive on time. Keep this slip for check-in.</div>
                <div class="actions">
                    <button class="print-btn" onclick="window.print()">Print Slip</button>
                    <button class="close-btn" onclick="window.close()">Close</button>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
