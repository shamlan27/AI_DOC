import api from './api';
import { Doctor } from '../types';

export interface DoctorSlotAvailabilityResponse {
    doctor_id: number;
    hospital: string;
    date: string;
    consultation_end_time?: string | null;
    max_patients_per_slot: number;
    slots: Array<{
        time: string;
        booked: number;
        max_patients: number;
        remaining: number;
        is_available: boolean;
    }>;
}

export interface TriageQuestion {
    id: string;
    question: string;
    expected_type: 'number' | 'text';
}

export interface RecommendationRequestContext {
    duration_days?: number;
    associated_symptoms?: string;
    meal_relation?: string;
}

export interface SymptomRecommendationResponse {
    doctors: Doctor[];
    matched_specialties: Array<{
        specialty: string;
        confidence: number;
    }>;
    fallback?: boolean;
    follow_up_required?: boolean;
    follow_up_questions?: TriageQuestion[];
    triage_summary?: string;
    urgency_level?: 'low' | 'moderate' | 'high' | 'emergency';
    urgency_reason?: string | null;
    emergency_advice?: string | null;
}

const normalizeDoctor = (doctor: Partial<Doctor>): Doctor => ({
    id: Number(doctor.id ?? 0),
    name: doctor.name ?? 'Unknown Doctor',
    specialty: doctor.specialty ?? 'General Physician',
    availability:
        doctor.availability ??
        (Array.isArray(doctor.hospital_schedules) && doctor.hospital_schedules.length > 0
            ? 'Available by hospital schedule'
            : 'Availability not provided'),
    hospitals: Array.isArray(doctor.hospitals)
        ? doctor.hospitals.filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
        : Array.isArray(doctor.hospital_schedules)
            ? doctor.hospital_schedules
                .map((schedule) => schedule?.hospital)
                .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
            : [],
    hospital_schedules: Array.isArray(doctor.hospital_schedules)
        ? doctor.hospital_schedules
            .filter((schedule): schedule is {
                hospital: string;
                time_slots: string[];
                available_days?: string[];
                specific_dates?: string[];
                consultation_end_time?: string;
                max_patients_per_slot?: number;
            } =>
                typeof schedule?.hospital === 'string' && Array.isArray(schedule?.time_slots)
            )
            .map((schedule) => ({
                hospital: schedule.hospital,
                time_slots: schedule.time_slots.filter((slot): slot is string => typeof slot === 'string' && slot.trim().length > 0),
                available_days: Array.isArray(schedule.available_days)
                    ? schedule.available_days.filter((day): day is string => typeof day === 'string' && day.trim().length > 0)
                    : [],
                specific_dates: Array.isArray(schedule.specific_dates)
                    ? schedule.specific_dates.filter((date): date is string => typeof date === 'string' && date.trim().length > 0)
                    : [],
                consultation_end_time:
                    typeof schedule.consultation_end_time === 'string' && schedule.consultation_end_time.trim().length > 0
                        ? schedule.consultation_end_time.trim()
                        : undefined,
                max_patients_per_slot:
                    typeof schedule.max_patients_per_slot === 'number'
                        ? Math.max(1, schedule.max_patients_per_slot)
                        : (typeof schedule.max_patients_per_slot === 'string' && !isNaN(Number(schedule.max_patients_per_slot))
                            ? Math.max(1, Number(schedule.max_patients_per_slot))
                            : 1),
            }))
        : [],
    image: doctor.image,
    rating: typeof doctor.rating === 'number' ? doctor.rating : undefined,
    consultation_fee:
        typeof doctor.consultation_fee === 'number'
            ? doctor.consultation_fee
            : (typeof doctor.consultation_fee === 'string' && !isNaN(Number(doctor.consultation_fee))
                ? Number(doctor.consultation_fee)
                : undefined),
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

    async getSlotAvailability(doctorId: number | string, hospital: string, date: string): Promise<DoctorSlotAvailabilityResponse> {
        const response = await api.get<DoctorSlotAvailabilityResponse>(`/doctors/${doctorId}/slot-availability`, {
            params: {
                hospital,
                date,
            },
        });

        return response.data;
    },

    async getRecommendedDoctors(symptoms: string, topK = 3, context: RecommendationRequestContext = {}): Promise<SymptomRecommendationResponse> {
        const response = await api.post<SymptomRecommendationResponse>('/symptom-recommendations', {
            symptoms,
            top_k: topK,
            ...context,
        });

        return {
            ...response.data,
            doctors: (response.data?.doctors ?? []).map((doctor) => normalizeDoctor(doctor)),
            matched_specialties: response.data?.matched_specialties ?? [],
            follow_up_required: Boolean(response.data?.follow_up_required),
            follow_up_questions: response.data?.follow_up_questions ?? [],
        };
    }
};
