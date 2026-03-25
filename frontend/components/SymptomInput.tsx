"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DoctorRecommendationModal from './Home/DoctorRecommendationModal';
import { Doctor } from '../types';
import { doctorService } from '../services/doctorService';

interface SymptomInputProps {
    onAnalyze?: (symptoms: string) => void;
}

export default function SymptomInput() {
    const [symptoms, setSymptoms] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    // Import AppointmentModal if needed or handle booking via parent
    // For this refactor, we are focusing on the Analysis -> Recommendation flow.
    // Ideally, the Appointment logic should be lifted up or handled by a context/provider, 
    // but we will simply log the booking action for now or redirect.
    const router = useRouter();

    const handleAnalyze = async () => {
        if (!symptoms.trim()) return;
        setIsAnalyzing(true);

        try {
            const recommendedDoctors = await doctorService.getRecommendedDoctors(symptoms, 3);
            setDoctors(recommendedDoctors);
            setShowModal(true);
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleBook = (doctor: Doctor) => {
        // In a real app, this would open the booking modal
        // For now, we will navigate to the recommendations page with the doctor pre-selected via query params
        // OR better yet, let's keep it simple and just redirect to recommendations
        router.push(`/recommendations?doctor=${doctor.id}`);
    };

    return (
        <>
            <div className="w-full max-w-3xl mx-auto relative z-20">
                <div className="glass-card rounded-2xl p-1">
                    <div className="p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            AI Symptom Analyzer
                        </h2>
                        <p className="text-gray-400 mb-6 text-sm">
                            Describe your condition in detail. Our advanced AI models will analyze your inputs and recommend the best specialists instantly.
                        </p>

                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-60 transition duration-500 blur"></div>
                            <textarea
                                className="relative w-full h-32 p-4 bg-black/40 text-gray-100 border border-white/10 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-gray-600 text-lg"
                                placeholder="I have been experiencing a sharp pain in my left temple..."
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                disabled={isAnalyzing}
                            />
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <div className="text-xs text-gray-500 flex gap-4">
                                <span>🔒 Private & Secure</span>
                                <span>⚡ 24/7 AI Support</span>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !symptoms.trim()}
                                className={`px-8 py-3 rounded-full text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]
                  ${isAnalyzing ? 'bg-indigo-900 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'}`}
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
                            </button>
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-yellow-500/60 text-[10px] sm:text-xs">
                            <span className="shrink-0 text-base">⚠️</span>
                            <p>
                                <strong>Disclaimer:</strong> This tool is for informational purposes only and is AI-generated.
                                It is not a substitute for professional medical advice. Always consult your doctor.
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar (Visual only) */}
                    {isAnalyzing && (
                        <div className="h-1 w-full bg-black/50 rounded-b-2xl overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-progress"></div>
                        </div>
                    )}
                </div>
            </div>

            <DoctorRecommendationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                doctors={doctors}
                onBook={handleBook}
            />
        </>
    );
}
