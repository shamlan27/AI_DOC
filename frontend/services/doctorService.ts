import api from './api';
import { Doctor } from '../types';

interface SymptomRecommendationResponse {
    doctors: Doctor[];
    matched_specialties: Array<{
        specialty: string;
        confidence: number;
    }>;
    fallback?: boolean;
}

const normalizeDoctor = (doctor: Partial<Doctor>): Doctor => ({
    id: Number(doctor.id ?? 0),
    name: doctor.name ?? 'Unknown Doctor',
    specialty: doctor.specialty ?? 'General Physician',
    availability: doctor.availability ?? 'Availability not provided',
    image: doctor.image,
    rating: typeof doctor.rating === 'number' ? doctor.rating : undefined,
});

export const doctorService = {
    async getAllDoctors(): Promise<Doctor[]> {
        const response = await api.get<Doctor[]>('/doctors');
        return (response.data ?? []).map((doctor) => normalizeDoctor(doctor));
    },

    async getDoctorById(id: number | string): Promise<Doctor> {
        const response = await api.get<Doctor>(`/doctors/${id}`);
        return normalizeDoctor(response.data ?? {});
    },

    async getRecommendedDoctors(symptoms: string, topK = 3): Promise<Doctor[]> {
        const response = await api.post<SymptomRecommendationResponse>('/symptom-recommendations', {
            symptoms,
            top_k: topK,
        });

        return (response.data?.doctors ?? []).map((doctor) => normalizeDoctor(doctor));
    }
};
