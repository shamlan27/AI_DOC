"use client";

import { useEffect, useState } from 'react';
import DoctorCard from '../../components/DoctorCard';
import AppointmentModal from '../../components/AppointmentModal';
import { Doctor } from '../../types';
// import { mockDoctors } from '../../services/mockData'; // Removed mock data
import Link from 'next/link';
import { doctorService } from '../../services/doctorService';

export default function Recommendations() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // Ensure backend server is running on port 8000
                const data = await doctorService.getAllDoctors();
                setDoctors(data);
                setFilteredDoctors(data);
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
                // Fallback or error state could be added here
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = doctors.filter(doc =>
            doc.name.toLowerCase().includes(lowerTerm) ||
            doc.specialty.toLowerCase().includes(lowerTerm)
        );
        setFilteredDoctors(filtered);
    }, [searchTerm, doctors]);

    const handleBook = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#030712] text-gray-100 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10 pt-40 md:pt-48">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium mb-2 inline-block transition-colors">
                            ← Back to Home
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Find a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Specialist</span></h1>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full md:w-auto relative group mt-4 md:mt-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 group-focus-within:text-blue-400 transition-colors">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search doctors or specialties..."
                            className="w-full md:w-80 pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all shadow-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-card rounded-2xl h-48 animate-pulse bg-white/5 border border-white/10"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doctor) => (
                                <DoctorCard key={doctor.id} doctor={doctor} onBook={handleBook} />
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <p className="text-lg">No doctors found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AppointmentModal
                doctor={selectedDoctor}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
