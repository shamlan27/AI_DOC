"use client";

import { useState, useEffect } from 'react';
import { appointmentService, Appointment } from '../../services/appointmentService';

export default function AppointmentsTab() {
    const [filter, setFilter] = useState<'current' | 'previous'>('current');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                            </div>
                            {filter === 'current' && (
                                <div className="flex gap-3">
                                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20">
                                        Join
                                    </button>
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-colors border border-white/10">
                                        Reschedule
                                    </button>
                                </div>
                            )}
                            {filter === 'previous' && (
                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-blue-400 rounded-xl font-medium transition-colors border border-white/10">
                                    View Report
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <p className="text-gray-500">No {filter} appointments found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
