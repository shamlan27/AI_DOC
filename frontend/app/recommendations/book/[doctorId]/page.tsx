"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppointmentModal from '../../../../components/AppointmentModal';
import { Doctor } from '../../../../types';
import { doctorService } from '../../../../services/doctorService';

export default function DoctorBookingPage() {
    const params = useParams<{ doctorId: string }>();
    const router = useRouter();

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctor = async () => {
            const doctorId = Number(params?.doctorId);

            if (!doctorId || Number.isNaN(doctorId)) {
                setError('Invalid doctor selected.');
                setIsLoading(false);
                return;
            }

            try {
                const data = await doctorService.getDoctorById(doctorId);
                setDoctor(data);
            } catch (fetchError) {
                console.error('Failed to load doctor:', fetchError);
                setError('Could not load the selected doctor.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctor();
    }, [params?.doctorId]);

    const handleClose = () => {
        router.push('/recommendations');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
                Loading booking details...
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-4 text-white">
                <p>{error || 'Doctor not found.'}</p>
                <button
                    onClick={() => router.push('/recommendations')}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                    Back to Recommendations
                </button>
            </div>
        );
    }

    return <AppointmentModal doctor={doctor} isOpen={true} onClose={handleClose} />;
}
