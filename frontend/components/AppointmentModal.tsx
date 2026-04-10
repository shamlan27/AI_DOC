

"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Doctor } from '../types';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import { useAuth } from '../context/AuthContext';

const DEFAULT_TIME_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];

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

interface AppointmentModalProps {
    doctor: Doctor | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function AppointmentModal({ doctor, isOpen, onClose }: AppointmentModalProps) {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [step, setStep] = useState<'details' | 'payment' | 'otp' | 'success'>('details');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [name, setName] = useState('');
    const [nic, setNic] = useState('');
    const [phone, setPhone] = useState('');
    const [hospital, setHospital] = useState('');
    const [paymentMode, setPaymentMode] = useState('counter');
    const [cardType, setCardType] = useState<'visa' | 'mastercard'>('visa');
    const [cardHolderName, setCardHolderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingSlotAvailability, setIsLoadingSlotAvailability] = useState(false);
    const [scheduleEndTime, setScheduleEndTime] = useState<string | null>(null);
    const [slotAvailability, setSlotAvailability] = useState<Record<string, {
        booked: number;
        max_patients: number;
        remaining: number;
        is_available: boolean;
    }>>({});

    const minBookingDate = useMemo(() => {
        const now = new Date();
        const tzOffsetMs = now.getTimezoneOffset() * 60 * 1000;
        return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
    }, []);

    const selectedDateLabel = date
        ? new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : null;

    const formatCardNumberForDisplay = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const doctorHospitals = useMemo(
        () => (Array.isArray(doctor?.hospitals) ? doctor.hospitals : []),
        [doctor?.hospitals]
    );
    const hospitalSchedules = useMemo(
        () => (Array.isArray(doctor?.hospital_schedules) ? doctor.hospital_schedules : []),
        [doctor?.hospital_schedules]
    );

    const hospitalOptions = useMemo(() => {
        const hospitals = Array.isArray(doctorHospitals)
            ? doctorHospitals.filter((name) => typeof name === 'string' && name.trim().length > 0)
            : [];

        return hospitals.length > 0 ? hospitals : ['Main Hospital'];
    }, [doctorHospitals]);

    useEffect(() => {
        if (isOpen) {
            const nextHospital = hospitalOptions[0] || 'Main Hospital';
            setHospital((prev) => (prev === nextHospital ? prev : nextHospital));
        }
    }, [isOpen, hospitalOptions]);

    const timeSlots = useMemo(() => {
        const schedule = hospitalSchedules.find((item) => item.hospital === hospital);
        const selectedDate = date || null;
        const selectedDay = date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }) : null;
        const availableDays = Array.isArray(schedule?.available_days)
            ? schedule.available_days.filter((day) => typeof day === 'string' && day.trim().length > 0)
            : [];
        const specificDates = Array.isArray(schedule?.specific_dates)
            ? schedule.specific_dates.filter((d) => typeof d === 'string' && d.trim().length > 0)
            : [];

        if (selectedDate && specificDates.length > 0 && !specificDates.includes(selectedDate)) {
            return [];
        }

        if (selectedDay && availableDays.length > 0 && !availableDays.includes(selectedDay)) {
            return [];
        }

        let slots = Array.isArray(schedule?.time_slots)
            ? schedule.time_slots.filter((slot) => typeof slot === 'string' && slot.trim().length > 0)
            : [];

        const endTime = typeof schedule?.consultation_end_time === 'string' ? schedule.consultation_end_time.trim() : '';
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
    }, [date, hospital, hospitalSchedules]);

    useEffect(() => {
        let isActive = true;

        if (!isOpen || !doctor || !hospital || !date) {
            setSlotAvailability({});
            setScheduleEndTime(null);
            return () => {
                isActive = false;
            };
        }

        setIsLoadingSlotAvailability(true);
        doctorService
            .getSlotAvailability(doctor.id, hospital, date)
            .then((response) => {
                if (!isActive) return;

                const availabilityMap = (response.slots || []).reduce((acc, slot) => {
                    acc[slot.time] = {
                        booked: slot.booked,
                        max_patients: slot.max_patients,
                        remaining: slot.remaining,
                        is_available: slot.is_available,
                    };

                    return acc;
                }, {} as Record<string, { booked: number; max_patients: number; remaining: number; is_available: boolean }>);

                setSlotAvailability(availabilityMap);
                setScheduleEndTime(response.consultation_end_time ?? null);
            })
            .catch(() => {
                if (!isActive) return;
                setSlotAvailability({});
                const fallbackEnd = hospitalSchedules.find((item) => item.hospital === hospital)?.consultation_end_time;
                setScheduleEndTime(typeof fallbackEnd === 'string' && fallbackEnd.trim().length > 0 ? fallbackEnd.trim() : null);
            })
            .finally(() => {
                if (!isActive) return;
                setIsLoadingSlotAvailability(false);
            });

        return () => {
            isActive = false;
        };
    }, [date, doctor?.id, hospital, hospitalSchedules, isOpen]);

    useEffect(() => {
        if (time && !timeSlots.includes(time)) {
            setTime('');
        }
    }, [time, timeSlots]);

    if (!isOpen || !doctor) return null;

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="glass-card rounded-3xl w-full max-w-lg p-8 border border-white/10">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin">⏳</div>
                        <p className="ml-4 text-white">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!user) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="glass-card rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="p-6 border-b border-white/10 shrink-0 flex items-center gap-4 bg-white/5">
                        <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center text-2xl">
                            🔐
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Login Required</h3>
                            <p className="text-red-400 text-sm font-medium">Please sign in to book an appointment</p>
                        </div>
                        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white">✕</button>
                    </div>

                    <div className="p-8 text-center space-y-6">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
                        <p className="text-gray-400 mb-6">
                            You need to be logged in to book an appointment with {doctor.name}.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    onClose();
                                    router.push('/auth/login');
                                }}
                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-900/30"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    router.push('/auth/register');
                                }}
                                className="w-full py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const resetAndClose = () => {
        onClose();
        setStep('details');
        setDate('');
        setTime('');
        setName('');
        setNic('');
        setPhone('');
        setHospital(hospitalOptions[0] || 'Main Hospital');
        setPaymentMode('counter');
        setCardType('visa');
        setCardHolderName('');
        setCardNumber('');
        setExpiryMonth('');
        setExpiryYear('');
        setCvv('');
        setOtp(['', '', '', '', '', '']);
        setGeneratedOtp('');
        setErrorMessage('');
    };

    const createAppointmentRequest = async (payload: {
        card_type?: 'visa' | 'mastercard';
        card_holder_name?: string;
        card_number?: string;
        expiry_month?: number;
        expiry_year?: number;
        cvv?: string;
    } = {}) => {
        await appointmentService.createAppointment({
            doctor_id: doctor.id,
            hospital,
            date,
            time,
            name,
            phone,
            nic,
            payment_mode: paymentMode === 'online' ? 'online' : 'counter',
            ...payload,
        });
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (date && date < minBookingDate) {
            setErrorMessage('Please select today or a future date for booking.');
            return;
        }

        const selectedSlotAvailability = slotAvailability[time];
        if (selectedSlotAvailability && selectedSlotAvailability.remaining <= 0) {
            setErrorMessage('Selected slot is full. Please choose another available time.');
            return;
        }

        if (paymentMode === 'online') {
            setStep('payment');
            return;
        }

        const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(testOtp);
        setOtp(['', '', '', '', '', '']);
        setStep('otp');
    };

    const handlePayOnline = async () => {
        if (!doctor) return;

        const cleanedCardNumber = cardNumber.replace(/\D/g, '');
        if (cleanedCardNumber.length !== 16) {
            setErrorMessage('Card number must be exactly 16 digits.');
            return;
        }

        if (!cardHolderName.trim()) {
            setErrorMessage('Card holder name is required.');
            return;
        }

        if (!expiryMonth || !expiryYear) {
            setErrorMessage('Expiry month and year are required.');
            return;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            setErrorMessage('CVV must be 3 or 4 digits.');
            return;
        }

        setIsBooking(true);
        setErrorMessage('');

        try {
            await createAppointmentRequest({
                card_type: cardType,
                card_holder_name: cardHolderName.trim(),
                card_number: cleanedCardNumber,
                expiry_month: Number(expiryMonth),
                expiry_year: Number(expiryYear),
                cvv,
            });

            setIsBooking(false);
            setStep('success');
            setTimeout(() => {
                resetAndClose();
            }, 3000);
        } catch (error: any) {
            setIsBooking(false);

            const backendMessage =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.card_number?.[0] ||
                error?.response?.data?.errors?.card_holder_name?.[0] ||
                'Payment failed. Please try again.';

            setErrorMessage(backendMessage);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleConfirm = async () => {
        if (!doctor) return;

        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6 || enteredOtp !== generatedOtp) {
            setErrorMessage('Invalid OTP. Please enter the test OTP shown below.');
            return;
        }

        setIsBooking(true);
        setErrorMessage('');

        try {
            await appointmentService.createAppointment({
                doctor_id: doctor.id,
                hospital,
                date,
                time,
                name,
                phone,
                nic,
                payment_mode: paymentMode === 'online' ? 'online' : 'counter',
            });

            setIsBooking(false);
            setStep('success');
            setTimeout(() => {
                resetAndClose();
            }, 3000);
        } catch (error: any) {
            setIsBooking(false);

            // Handle different types of errors
            let backendMessage = 'Failed to book appointment. Please try again.';
            
            if (error?.response?.status === 401) {
                backendMessage = 'Your session expired. Please log in again.';
            } else if (error?.response?.status === 422) {
                // Validation errors
                backendMessage = 
                    error?.response?.data?.message ||
                    error?.response?.data?.errors?.hospital?.[0] ||
                    error?.response?.data?.errors?.time?.[0] ||
                    'Invalid appointment details. Please check and try again.';
            } else if (error?.response?.data?.message) {
                backendMessage = error.response.data.message;
            }

            setErrorMessage(backendMessage);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-card rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="p-6 border-b border-white/10 shrink-0 flex items-center gap-4 bg-white/5">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-2xl">
                        📅
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {step === 'details' ? 'Book Appointment' : step === 'payment' ? 'Mock Payment' : step === 'otp' ? 'Verify Identity' : 'Confirmed!'}
                        </h3>
                        <p className="text-blue-400 text-sm font-medium">with {doctor.name}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {step === 'details' && (
                        <form onSubmit={handleNext} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">NIC Number</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="123456789V"
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600"
                                            value={nic}
                                            onChange={(e) => setNic(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+1 234..."
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    required
                                    min={minBookingDate}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 appearance-none scheme-dark"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                                {selectedDateLabel && (
                                    <p className="text-xs text-blue-300 mt-2">Selected date: {selectedDateLabel}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Select Time</label>
                                {scheduleEndTime && (
                                    <p className="text-xs text-gray-400 mb-2">Consultation ends at {scheduleEndTime}</p>
                                )}
                                {timeSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlots.map((slot) => {
                                            const slotInfo = slotAvailability[slot];
                                            const isFull = slotInfo ? !slotInfo.is_available : false;

                                            return (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setTime(slot)}
                                                    disabled={isFull}
                                                    className={`py-2 px-1 text-xs sm:text-sm border rounded-lg transition-all font-medium
                        ${isFull
                            ? 'border-red-500/30 bg-red-500/10 text-red-300 cursor-not-allowed opacity-70'
                            : (time === slot
                                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50'
                                : 'border-white/10 hover:border-white/30 text-gray-400 hover:text-white bg-white/5')}`}
                                                >
                                                    <span className="block">{slot}</span>
                                                    {slotInfo && (
                                                        <span className="block text-[10px] mt-0.5">
                                                            {slotInfo.remaining} left
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
                                        Doctor is not available at this hospital on the selected date/day. Please choose another date.
                                    </div>
                                )}
                                {isLoadingSlotAvailability && (
                                    <p className="text-xs text-blue-300 mt-2">Checking slot seat availability...</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Choose Hospital</label>
                                <select
                                    required
                                    value={hospital}
                                    onChange={(e) => setHospital(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white"
                                >
                                    {hospitalOptions.map((hospitalName) => (
                                        <option key={hospitalName} value={hospitalName} className="bg-slate-900 text-white">
                                            {hospitalName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Payment Method</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`relative flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMode === 'online' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 hover:border-white/30 bg-white/5 text-gray-400'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="hidden"
                                            checked={paymentMode === 'online'}
                                            onChange={() => setPaymentMode('online')}
                                        />
                                        <div className="text-center">
                                            <span className="block text-2xl mb-1">💳</span>
                                            <span className="text-sm font-bold">Online</span>
                                        </div>
                                    </label>

                                    <label className={`relative flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMode === 'counter' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 hover:border-white/30 bg-white/5 text-gray-400'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="hidden"
                                            checked={paymentMode === 'counter'}
                                            onChange={() => setPaymentMode('counter')}
                                        />
                                        <div className="text-center">
                                            <span className="block text-2xl mb-1">🏥</span>
                                            <span className="text-sm font-bold">Counter</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!date || !time || !name || !phone || !nic || !hospital}
                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-900/30"
                            >
                                {paymentMode === 'online' ? 'Continue to Payment' : 'Continue to Verification'}
                            </button>
                        </form>
                    )}

                    {step === 'payment' && (
                        <div className="space-y-6 py-2">
                            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                                <p className="text-sm text-blue-200">Mock payment gateway</p>
                                <p className="text-xl font-bold text-white">Consultation Fee: LKR {(doctor.consultation_fee ?? 1500).toFixed(2)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Card Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCardType('visa')}
                                        className={`p-3 rounded-xl border text-sm font-bold ${cardType === 'visa' ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-white/10 bg-white/5 text-gray-300'}`}
                                    >
                                        VISA
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCardType('mastercard')}
                                        className={`p-3 rounded-xl border text-sm font-bold ${cardType === 'mastercard' ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-white/10 bg-white/5 text-gray-300'}`}
                                    >
                                        MASTERCARD
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-1">Card Holder Name</label>
                                <input
                                    type="text"
                                    value={cardHolderName}
                                    onChange={(e) => setCardHolderName(e.target.value)}
                                    placeholder="Name on card"
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-1">Card Number (16 digits)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={19}
                                    value={formatCardNumberForDisplay(cardNumber)}
                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                    placeholder="1234123412341234"
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-1">MM</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={expiryMonth}
                                        onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                        placeholder="08"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-1">YYYY</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={expiryYear}
                                        onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="2029"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-1">CVV</label>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="123"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('details')}
                                    className="py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePayOnline}
                                    disabled={isBooking}
                                    className="py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-60 transition"
                                >
                                    {isBooking ? 'Processing...' : 'Pay Now'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="text-center space-y-8 py-4">
                            <div>
                                <p className="text-gray-300 mb-1">
                                    Enter code sent to <span className="text-blue-400 font-bold">{phone}</span>
                                </p>
                                <p className="text-xs text-gray-500">To confirm your appointment</p>
                                <p className="text-xs text-amber-300 mt-2">
                                    Test mode OTP (no SMS API): <span className="font-bold tracking-widest">{generatedOtp}</span>
                                </p>
                            </div>

                            <div className="flex justify-center gap-2">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        className="w-12 h-14 bg-black/40 border border-white/20 rounded-xl text-center text-xl font-bold text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleConfirm}
                                disabled={isBooking || otp.join('').length < 6}
                                className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50 transition shadow-lg shadow-green-900/30"
                            >
                                {isBooking ? 'Verifying...' : 'Verify & Confirm Booking'}
                            </button>
                            {errorMessage && (
                                <p className="text-sm text-red-400">{errorMessage}</p>
                            )}
                            <button onClick={() => setStep('details')} className="text-sm text-gray-400 hover:text-white transition-colors">Back to Details</button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-500/20 mb-6 animate-bounce shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                            <p className="text-gray-400">
                                Your appointment is set for <span className="text-white font-bold">{date}</span> at <span className="text-white font-bold">{time}</span>.
                            </p>
                            <p className="text-gray-400 mt-2">
                                Hospital: <span className="text-white font-bold">{hospital}</span>
                            </p>
                            <p className="text-gray-400 mt-2">
                                Payment: <span className="text-white font-bold">{paymentMode === 'online' ? 'Paid Online' : 'Pending Counter Payment'}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
