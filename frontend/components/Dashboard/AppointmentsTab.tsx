"use client";

import { useState, useEffect } from 'react';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';

export default function AppointmentsTab() {
    const [filter, setFilter] = useState<'current' | 'previous'>('current');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [isLoadingRescheduleSlots, setIsLoadingRescheduleSlots] = useState(false);
    const [rescheduleSlotAvailability, setRescheduleSlotAvailability] = useState<Record<string, {
        remaining: number;
        is_available: boolean;
    }>>({});
    const [reviewAppointment, setReviewAppointment] = useState<Appointment | null>(null);
    const [reviewRating, setReviewRating] = useState<number>(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const DEFAULT_TIME_SLOTS = [
        '09:00 AM',
        '09:30 AM',
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '11:30 AM',
        '02:00 PM',
        '02:30 PM',
        '03:00 PM',
        '03:30 PM',
        '04:00 PM',
        '04:30 PM',
    ];

    const handlePrintSlip = (appointment: Appointment) => {
        const slipWindow = window.open('', '_blank', 'width=900,height=1200');

        if (!slipWindow) {
            alert('Popup blocked. Please allow popups to print the slip.');
            return;
        }

        const eta = appointment.estimated_arrival_time
            ? new Date(appointment.estimated_arrival_time).toLocaleString()
            : 'Not available';

        slipWindow.document.write(`
            <html>
                <head>
                    <title>Appointment Slip</title>
                    <style>
                        body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; margin: 0; padding: 32px; }
                        .card { max-width: 820px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,.08); border-radius: 24px; padding: 24px; }
                        .top { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,.08); padding-bottom: 16px; margin-bottom: 20px; }
                        .title { font-size: 24px; font-weight: 700; color: white; }
                        .badge { padding: 10px 14px; border-radius: 999px; background: rgba(37,99,235,.16); border: 1px solid rgba(37,99,235,.35); color: #93c5fd; font-weight: 700; }
                        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
                        .item { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 14px 16px; }
                        .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 6px; }
                        .value { font-size: 16px; font-weight: 700; color: white; }
                        .footer { margin-top: 18px; color: #94a3b8; font-size: 14px; }
                        @media print { body { background: white; color: black; padding: 0; } .card { border: 0; border-radius: 0; } }
                        @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="top">
                            <div>
                                <div class="title">AI Doc Appointment Slip</div>
                                <div style="color:#94a3b8; margin-top:6px;">Printable booking summary</div>
                            </div>
                            <div class="badge">Booking ID: ${appointment.booking_id || `BK-${appointment.id}`}</div>
                        </div>
                        <div class="grid">
                            <div class="item"><div class="label">Patient</div><div class="value">${appointment.name || 'Patient'}</div></div>
                            <div class="item"><div class="label">Queue Number</div><div class="value">${appointment.queue_number || 1}</div></div>
                            <div class="item"><div class="label">Doctor</div><div class="value">${appointment.doctor?.name || 'Doctor'}</div></div>
                            <div class="item"><div class="label">Estimated Arrival</div><div class="value">${eta}</div></div>
                            <div class="item"><div class="label">Hospital</div><div class="value">${appointment.hospital || 'Not specified'}</div></div>
                            <div class="item"><div class="label">Date</div><div class="value">${appointment.date}</div></div>
                            <div class="item"><div class="label">Time</div><div class="value">${appointment.time}</div></div>
                            <div class="item"><div class="label">Payment Status</div><div class="value">${appointment.status}</div></div>
                        </div>
                        <div class="footer">Please arrive on time and keep this slip for check-in.</div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); };
                    </script>
                </body>
            </html>
        `);
        slipWindow.document.close();
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const data = await appointmentService.getAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Failed to load appointments", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const minRescheduleDate = formatDateForInput(new Date());
    const maxRescheduleDate = formatDateForInput(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
    const rescheduleDateOptions = Array.from({ length: 4 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);

        return {
            value: formatDateForInput(date),
            label: date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
            }),
        };
    });
    const selectedRescheduleDateLabel = rescheduleDate
        ? new Date(`${rescheduleDate}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : null;

    const openRescheduleModal = (appointment: Appointment) => {
        setRescheduleAppointment(appointment);
        setRescheduleDate(appointment.date);
        setRescheduleTime(appointment.time);
    };

    const rescheduleTimeSlots = (() => {
        if (!rescheduleAppointment) return DEFAULT_TIME_SLOTS;

        const parseTimeToMinutes = (value: string): number | null => {
            const raw = value.trim().toUpperCase();
            const match = raw.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
            if (!match) {
                return null;
            }

            const hour = Number(match[1]);
            const minute = Number(match[2]);
            const meridiem = match[3];

            if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
                return null;
            }

            const hour24 = (hour % 12) + (meridiem === 'PM' ? 12 : 0);
            return hour24 * 60 + minute;
        };

        const selectedHospital = (rescheduleAppointment.hospital || '').trim();
        const selectedDate = rescheduleDate || null;
        const selectedDay = rescheduleDate
            ? new Date(`${rescheduleDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' })
            : null;
        const schedules = Array.isArray(rescheduleAppointment.doctor?.hospital_schedules)
            ? rescheduleAppointment.doctor.hospital_schedules
            : [];

        const matched = schedules.find((schedule) => (schedule.hospital || '').trim() === selectedHospital);
        const availableDays = Array.isArray(matched?.available_days)
            ? matched.available_days.filter((day) => typeof day === 'string' && day.trim().length > 0)
            : [];
        const specificDates = Array.isArray(matched?.specific_dates)
            ? matched.specific_dates.filter((date) => typeof date === 'string' && date.trim().length > 0)
            : [];

        if (selectedDate && specificDates.length > 0 && !specificDates.includes(selectedDate)) {
            return [];
        }

        if (selectedDay && availableDays.length > 0 && !availableDays.includes(selectedDay)) {
            return [];
        }

        let slots = Array.isArray(matched?.time_slots)
            ? matched.time_slots.filter((slot) => typeof slot === 'string' && slot.trim().length > 0)
            : [];

        const endTime = typeof matched?.consultation_end_time === 'string' ? matched.consultation_end_time.trim() : '';
        if (endTime) {
            const endMinutes = parseTimeToMinutes(endTime);
            if (endMinutes !== null) {
                slots = slots.filter((slot) => {
                    const slotMinutes = parseTimeToMinutes(slot);
                    return slotMinutes !== null && slotMinutes <= endMinutes;
                });
            }
        }

        return slots.length > 0 ? slots : DEFAULT_TIME_SLOTS;
    })();

    useEffect(() => {
        let isActive = true;

        if (!rescheduleAppointment || !rescheduleDate || !rescheduleAppointment.hospital) {
            setRescheduleSlotAvailability({});
            return () => {
                isActive = false;
            };
        }

        setIsLoadingRescheduleSlots(true);
        doctorService
            .getSlotAvailability(rescheduleAppointment.doctor_id, rescheduleAppointment.hospital, rescheduleDate)
            .then((response) => {
                if (!isActive) return;

                const map = (response.slots || []).reduce((acc, slot) => {
                    acc[slot.time] = {
                        remaining: slot.remaining,
                        is_available: slot.is_available,
                    };
                    return acc;
                }, {} as Record<string, { remaining: number; is_available: boolean }>);

                setRescheduleSlotAvailability(map);
            })
            .catch(() => {
                if (!isActive) return;
                setRescheduleSlotAvailability({});
            })
            .finally(() => {
                if (!isActive) return;
                setIsLoadingRescheduleSlots(false);
            });

        return () => {
            isActive = false;
        };
    }, [rescheduleAppointment, rescheduleDate]);

    const handleReschedule = async () => {
        if (!rescheduleAppointment || !rescheduleDate || !rescheduleTime) return;

        const normalizeTimeForApi = (value: string): string | null => {
            const raw = value.trim();
            if (!raw) return null;

            const amPmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (amPmMatch) {
                const hour = Number(amPmMatch[1]);
                const minute = Number(amPmMatch[2]);
                const meridiem = amPmMatch[3].toUpperCase();

                if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
                    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${meridiem}`;
                }
                return null;
            }

            const hhmmMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
            if (hhmmMatch) {
                const hour24 = Number(hhmmMatch[1]);
                const minute = Number(hhmmMatch[2]);
                if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) {
                    return null;
                }

                const meridiem = hour24 >= 12 ? 'PM' : 'AM';
                const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
                return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${meridiem}`;
            }

            return null;
        };

        const normalizedTime = normalizeTimeForApi(rescheduleTime);
        if (!normalizedTime) {
            alert('Please enter a valid time like 10:30 AM or 22:30.');
            return;
        }

        const selectedSlot = rescheduleSlotAvailability[normalizedTime];
        if (selectedSlot && !selectedSlot.is_available) {
            alert('Selected time slot is full. Please choose another slot.');
            return;
        }

        setIsRescheduling(true);
        try {
            await appointmentService.rescheduleAppointment(rescheduleAppointment.id, rescheduleDate, normalizedTime);
            await loadAppointments();
            setRescheduleAppointment(null);
            setRescheduleDate('');
            setRescheduleTime('');
            alert('Appointment rescheduled successfully.');
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to reschedule appointment.';
            alert(message);
        } finally {
            setIsRescheduling(false);
        }
    };

    const openReviewModal = (appointment: Appointment) => {
        setReviewAppointment(appointment);
        setReviewRating(5);
        setReviewComment('');
    };

    const handleSubmitReview = async () => {
        if (!reviewAppointment) return;

        setIsSubmittingReview(true);
        try {
            await appointmentService.submitReview(reviewAppointment.id, {
                rating: reviewRating,
                comment: reviewComment.trim(),
            });

            await loadAppointments();
            setReviewAppointment(null);
            setReviewComment('');
            alert('Thank you! Your review has been submitted.');
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to submit review.';
            alert(message);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const isSelectedRescheduleSlotFull = Boolean(
        rescheduleTime &&
        rescheduleSlotAvailability[rescheduleTime] &&
        !rescheduleSlotAvailability[rescheduleTime].is_available
    );

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const now = new Date();
        // Simple logic: if date is today or future, it's "current/upcoming"
        // If date is past, it's "previous/completed"
        // Adjust logic as needed based on exact requirements.
        if (filter === 'current') {
            return aptDate >= new Date(now.setHours(0, 0, 0, 0));
        } else {
            return aptDate < new Date(now.setHours(0, 0, 0, 0));
        }
    });

    if (isLoading) {
        return <div className="text-center py-10 text-gray-400">Loading appointments...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">My Appointments</h2>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setFilter('current')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'current' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Current
                    </button>
                    <button
                        onClick={() => setFilter('previous')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'previous' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Previous
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((apt) => (
                        <div key={apt.id} className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6 group hover:border-blue-500/30 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl border border-white/10">
                                👨‍⚕️
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-bold text-white">{apt.doctor?.name || 'Doctor'}</h3>
                                <p className="text-blue-400 text-sm font-medium">{apt.doctor?.specialization || 'Specialist'}</p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">📅 {apt.date}</span>
                                    <span className="flex items-center gap-1">⏰ {apt.time}</span>
                                    <span className="flex items-center gap-1">📹 {apt.status === 'pending' ? 'Pending' : 'Confirmed'}</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-xs text-gray-300">
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Booking ID: {apt.booking_id || `BK-${apt.id}`}</span>
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Queue #: {apt.queue_number || 1}</span>
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">ETA: {apt.estimated_arrival_time ? new Date(apt.estimated_arrival_time).toLocaleString() : 'Calculating...'}</span>
                                </div>
                            </div>
                            {filter === 'current' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handlePrintSlip(apt)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-blue-400 rounded-xl font-medium transition-colors border border-white/10"
                                    >
                                        Print Slip
                                    </button>
                                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20">
                                        Join
                                    </button>
                                    <button
                                        onClick={() => openRescheduleModal(apt)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-colors border border-white/10"
                                    >
                                        Reschedule
                                    </button>
                                </div>
                            )}
                            {filter === 'previous' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedAppointment(apt)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-blue-400 rounded-xl font-medium transition-colors border border-white/10"
                                    >
                                        View Consultation
                                    </button>
                                    {apt.review ? (
                                        <button
                                            disabled
                                            className="px-4 py-2 bg-green-600/20 text-green-300 rounded-xl font-medium border border-green-500/30 cursor-not-allowed"
                                            title={`Already reviewed: ${apt.review.rating}/5`}
                                        >
                                            Reviewed ({apt.review.rating}/5)
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => openReviewModal(apt)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-yellow-300 rounded-xl font-medium transition-colors border border-white/10"
                                        >
                                            Add Review
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <p className="text-gray-500">No {filter} appointments found.</p>
                    </div>
                )}
            </div>

            {selectedAppointment && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-[#0b1220] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">Consultation Details</h3>
                                <p className="text-sm text-gray-400">
                                    {selectedAppointment.doctor?.name || 'Doctor'} • {selectedAppointment.date}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="px-3 py-1 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 mb-1">Summary</p>
                                <p className="text-white">
                                    {selectedAppointment.consultation_summary || 'No summary provided by admin yet.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 mb-1">Notes</p>
                                <p className="text-white whitespace-pre-line">
                                    {selectedAppointment.consultation_notes || 'No consultation notes available yet.'}
                                </p>
                            </div>

                            {selectedAppointment.consulted_at && (
                                <p className="text-xs text-gray-500">
                                    Consulted on {new Date(selectedAppointment.consulted_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {rescheduleAppointment && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#0b1220] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-white">Reschedule Appointment</h3>
                                <p className="text-sm text-gray-400">You can reschedule within 3 days from today. Hospital cannot be changed.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setRescheduleAppointment(null);
                                    setRescheduleDate('');
                                    setRescheduleTime('');
                                }}
                                className="px-3 py-1 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Hospital (Fixed)</label>
                                <input
                                    type="text"
                                    value={rescheduleAppointment.hospital || 'Not specified'}
                                    readOnly
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">New Date</label>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {rescheduleDateOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setRescheduleDate(option.value)}
                                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${rescheduleDate === option.value ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/30'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="date"
                                    min={minRescheduleDate}
                                    max={maxRescheduleDate}
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                />
                                {selectedRescheduleDateLabel && (
                                    <p className="text-xs text-blue-300 mt-2">Selected date: {selectedRescheduleDateLabel}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">New Time</label>
                                {rescheduleTimeSlots.length > 0 ? (
                                    <>
                                    <input
                                        type="text"
                                        value={rescheduleTime}
                                        onChange={(e) => setRescheduleTime(e.target.value)}
                                        list="reschedule-time-options"
                                        placeholder="e.g. 10:30 AM"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                    />
                                    <datalist id="reschedule-time-options">
                                        {rescheduleTimeSlots
                                            .filter((slot) => {
                                                const availability = rescheduleSlotAvailability[slot];
                                                return !availability || availability.is_available;
                                            })
                                            .map((slot) => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </datalist>
                                    <p className="text-xs text-gray-400 mt-2">You can type manually (e.g. 10:30 AM) or choose from suggestions.</p>
                                    {isSelectedRescheduleSlotFull && (
                                        <p className="text-xs text-red-300 mt-2">Selected slot is full. Choose another time.</p>
                                    )}
                                    {isLoadingRescheduleSlots && (
                                        <p className="text-xs text-blue-300 mt-2">Checking seat availability...</p>
                                    )}
                                    </>
                                ) : (
                                    <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
                                        Doctor is not available at this hospital on the selected date/day. Choose another date.
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleReschedule}
                                disabled={isRescheduling || !rescheduleDate || !rescheduleTime || rescheduleTimeSlots.length === 0 || isSelectedRescheduleSlotFull}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {reviewAppointment && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-xl bg-[#0b1220] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-white">Review Doctor</h3>
                                <p className="text-sm text-gray-400">Share your feedback for {reviewAppointment.doctor?.name || 'Doctor'}.</p>
                            </div>
                            <button
                                onClick={() => setReviewAppointment(null)}
                                className="px-3 py-1 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setReviewRating(value)}
                                            className={`px-3 py-2 rounded-lg border text-sm font-bold ${reviewRating === value ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' : 'bg-white/5 border-white/10 text-gray-300'}`}
                                        >
                                            {value}★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Comment (Optional)</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="How was your consultation experience?"
                                />
                            </div>

                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
