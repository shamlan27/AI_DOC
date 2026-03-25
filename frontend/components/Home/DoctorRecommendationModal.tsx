"use client";

import { Doctor } from '../../types';

interface DoctorRecommendationModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctors: Doctor[];
    onBook: (doctor: Doctor) => void;
}

export default function DoctorRecommendationModal({ isOpen, onClose, doctors, onBook }: DoctorRecommendationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/5">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-2xl">✨</span> AI Analysis Complete
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">Based on your symptoms, we recommend these specialists.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2 transition">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                    {doctors.map((doctor) => (
                        <div key={doctor.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all group flex flex-col sm:flex-row gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg shadow-blue-900/40">
                                {doctor.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{doctor.name}</h4>
                                        <p className="text-blue-400 text-sm font-medium">{doctor.specialty}</p>
                                    </div>
                                    {doctor.rating && (
                                        <div className="flex items-center text-xs font-bold bg-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-full border border-yellow-500/20">
                                            ⭐ {doctor.rating}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs">
                                    <span className={`px-2.5 py-1 rounded-full border ${String(doctor.availability ?? '').includes('Available') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {doctor.availability ?? 'Availability not provided'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={() => onBook(doctor)}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-900/30"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
