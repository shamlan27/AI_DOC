

"use client";

import { useState } from 'react';
import { Doctor } from '../types';

interface AppointmentModalProps {
    doctor: Doctor | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function AppointmentModal({ doctor, isOpen, onClose }: AppointmentModalProps) {
    const [step, setStep] = useState(1); // 1: Date/Time, 2: OTP, 3: Success
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [name, setName] = useState('');
    const [nic, setNic] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMode, setPaymentMode] = useState('counter');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isBooking, setIsBooking] = useState(false);

    if (!isOpen || !doctor) return null;

    const timeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2); // Go to OTP
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
        setIsBooking(true);
        // Simulate Verify & Book
        setTimeout(() => {
            setIsBooking(false);
            setStep(3); // Success
            setTimeout(() => {
                onClose();
                setStep(1);
                setDate('');
                setTime('');
                setName('');
                setNic('');
                setPhone('');
                setPaymentMode('counter');
                setOtp(['', '', '', '', '', '']);
            }, 3000);
        }, 2000);
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
                            {step === 1 ? 'Book Appointment' : step === 2 ? 'Verify Identity' : 'Confirmed!'}
                        </h3>
                        <p className="text-blue-400 text-sm font-medium">with {doctor.name}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {step === 1 && (
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
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 appearance-none scheme-dark"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Select Time</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setTime(slot)}
                                            className={`py-2 px-1 text-xs sm:text-sm border rounded-lg transition-all font-medium
                        ${time === slot ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50' : 'border-white/10 hover:border-white/30 text-gray-400 hover:text-white bg-white/5'}`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
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
                                disabled={!date || !time || !name || !phone || !nic}
                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-900/30"
                            >
                                Continue to Verification
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-8 py-4">
                            <div>
                                <p className="text-gray-300 mb-1">
                                    Enter code sent to <span className="text-blue-400 font-bold">{phone}</span>
                                </p>
                                <p className="text-xs text-gray-500">To confirm your appointment</p>
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
                            <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-white transition-colors">Back to Details</button>
                        </div>
                    )}

                    {step === 3 && (
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
