'use client';

import { useEffect, useState } from 'react';
import { hospitalService } from '../../services/hospitalService';
import { Hospital } from '../../types';

export default function FeaturedHospitals() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const data = await hospitalService.getAllHospitals();
                setHospitals(data);
            } catch (error) {
                console.error('Failed to fetch hospitals:', error);
                setHospitals([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHospitals();
    }, []);

    return (
        <div className="w-full py-10 bg-black/20 backdrop-blur-sm border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-gray-400 font-medium mb-6 uppercase tracking-wider text-sm">
                    Trusted Hospital Partners
                </p>

                {loading ? (
                    <p className="text-gray-400">Loading hospitals...</p>
                ) : hospitals.length === 0 ? (
                    <p className="text-gray-500">No active hospitals available yet.</p>
                ) : (
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-90 transition-all duration-500">
                        {hospitals.map((hospital) => (
                            <div key={hospital.id} className="flex flex-col items-start gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:border-blue-400/50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🏥</span>
                                    <span className="text-base font-semibold text-gray-100">{hospital.name}</span>
                                </div>
                                <span className="text-sm text-gray-300">{hospital.city}</span>
                                {hospital.phone ? <span className="text-xs text-gray-400">{hospital.phone}</span> : null}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
