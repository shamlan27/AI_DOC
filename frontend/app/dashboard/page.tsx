"use client";

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SettingsTab from '../../components/Dashboard/SettingsTab';
import AppointmentsTab from '../../components/Dashboard/AppointmentsTab';
import ReportsTab from '../../components/Dashboard/ReportsTab';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { reportService, MedicalReport } from '../../services/reportService';

export default function Dashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (user) {
            fetchData();
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        try {
            const [apptData, reportData] = await Promise.all([
                appointmentService.getAppointments(),
                reportService.getReports()
            ]);
            setAppointments(apptData);
            setReports(reportData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    // Calculate Stats
    const upcomingCount = appointments.filter(a => new Date(a.date) >= new Date()).length;
    const completedCount = appointments.filter(a => new Date(a.date) < new Date()).length; // Simplistic "completed" logic
    const reportsCount = reports.length;

    // Loading state
    if (authLoading || (user && isLoadingData)) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="animate-pulse text-blue-400">Loading AI Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030712] text-gray-100 flex relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Sidebar */}
            <aside className="hidden md:block w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 min-h-screen pt-28 md:pt-32 relative z-10 transition-all">
                <div className="px-6 space-y-10">
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
                            <span className="font-bold">AI</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Dashboard</span>
                    </div>

                    <div>
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Main Menu</h2>
                        <nav className="space-y-2">
                            {[
                                { id: 'dashboard', label: 'Overview', icon: '📊' },
                                { id: 'appointments', label: 'Appointments', icon: '📅' },
                                { id: 'reports', label: 'Medical Reports', icon: 'fyp' },
                                { id: 'settings', label: 'Settings', icon: '⚙️' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === item.id
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span>{item.icon === 'fyp' ? '📂' : item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="px-4 py-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20">
                        <h3 className="text-sm font-bold text-white mb-1">Premium Plan</h3>
                        <p className="text-xs text-blue-200 mb-3">Get unlimited AI analysis.</p>
                        <button className="w-full py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 pt-28 md:pt-32 relative z-10 overflow-y-auto max-h-screen custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    {/* Header - Common for all tabs */}
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || 'User'} 👋</h1>
                            <p className="text-gray-400">
                                {activeTab === 'dashboard' && "Here's your health overview."}
                                {activeTab === 'appointments' && "Manage your scheduled consultations."}
                                {activeTab === 'reports' && "Access and analyze your medical records."}
                                {activeTab === 'settings' && "Manage your account preferences."}
                            </p>
                        </div>
                        <div className="hidden sm:block text-right">
                            <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'settings' && <SettingsTab />}
                    {activeTab === 'appointments' && <AppointmentsTab />}
                    {activeTab === 'reports' && <ReportsTab />}

                    {/* Default Dashboard Overview */}
                    {activeTab === 'dashboard' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                {[
                                    { label: 'Upcoming', value: upcomingCount, icon: '📅', color: 'from-blue-500 to-blue-600' },
                                    { label: 'Completed', value: completedCount, icon: '✅', color: 'from-green-500 to-green-600' },
                                    { label: 'Reports', value: reportsCount, icon: '📝', color: 'from-yellow-500 to-yellow-600' },
                                    { label: 'Prescriptions', value: '0', icon: '💊', color: 'from-purple-500 to-purple-600' },
                                ].map((stat, i) => (
                                    <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg text-white`}>
                                                <span className="text-xl">{stat.icon}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                                            <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column */}
                                {/* Upcoming Appointments */}
                                <div className="glass-card p-6 rounded-2xl border border-white/10">
                                    <h2 className="text-lg font-bold text-white mb-6 flex justify-between items-center">
                                        Upcoming Appointment
                                        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors" onClick={() => setActiveTab('appointments')}>View All</button>
                                    </h2>

                                    {appointments.length > 0 ? (
                                        appointments.slice(0, 3).map(apt => (
                                            <div key={apt.id} className="flex items-center p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl border border-blue-500/20 relative overflow-hidden group mb-4">
                                                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/10 mr-5 text-center min-w-[4.5rem] relative z-10 text-white">
                                                    <span className="block text-[10px] uppercase font-bold text-blue-400 tracking-wider font-mono">
                                                        {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                                                    </span>
                                                    <span className="block text-2xl font-bold">
                                                        {new Date(apt.date).getDate()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 relative z-10">
                                                    <h3 className="font-bold text-white text-lg">{apt.doctor?.name || 'Doctor'}</h3>
                                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        {apt.doctor?.specialization || 'General'} • {apt.time}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-300">
                                                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Booking ID: {apt.booking_id || `BK-${apt.id}`}</span>
                                                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Queue #: {apt.queue_number || 1}</span>
                                                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                                            ETA: {apt.estimated_arrival_time ? new Date(apt.estimated_arrival_time).toLocaleString() : 'Calculating...'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No upcoming appointments.</p>
                                            <button onClick={() => router.push('/#symptom-analyzer')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm">Book one now &rarr;</button>
                                        </div>
                                    )}

                                </div>
                                {/* Right Column */}
                                <div className="space-y-8">
                                    <div className="glass-card p-6 rounded-2xl border border-white/10">
                                        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                                        <div className="space-y-3">
                                            <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 transition-colors text-left group">
                                                <span className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">💊</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-white">Order Medicines</p>
                                                    <p className="text-xs text-gray-400">Refill your prescription</p>
                                                </div>
                                            </button>
                                            <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 transition-colors text-left group">
                                                <span className="p-2 rounded-lg bg-green-500/20 text-green-400 group-hover:scale-110 transition-transform">📞</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-white">Emergency</p>
                                                    <p className="text-xs text-gray-400">Call ambulance</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
