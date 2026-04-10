import api from './api';

export interface Appointment {
    id: number;
    booking_id?: string;
    doctor_id: number;
    hospital?: string;
    date: string;
    time: string;
    name?: string;
    status: string;
    queue_number?: number;
    estimated_arrival_time?: string | null;
    consultation_summary?: string | null;
    consultation_notes?: string | null;
    consulted_at?: string | null;
    review?: {
        id: number;
        rating: number;
        comment?: string | null;
    } | null;
    doctor?: {
        name: string;
        specialization: string;
        hospital_schedules?: {
            hospital: string;
            time_slots: string[];
            available_days?: string[];
            specific_dates?: string[];
            consultation_end_time?: string;
            max_patients_per_slot?: number;
        }[];
    };
}

export interface ReviewPayload {
    rating: number;
    comment?: string;
}
export interface CreateAppointmentPayload {
    doctor_id: number;
    hospital: string;
    date: string;
    time: string;
    name: string;
    phone: string;
    nic: string;
    payment_mode: 'online' | 'counter';
    card_type?: 'visa' | 'mastercard';
    card_holder_name?: string;
    card_number?: string;
    expiry_month?: number;
    expiry_year?: number;
    cvv?: string;
}

export const appointmentService = {
    async getAppointments(): Promise<Appointment[]> {
        const response = await api.get<Appointment[]>('/appointments');
        return response.data;
    },

    async createAppointment(data: CreateAppointmentPayload): Promise<Appointment> {
        const response = await api.post<Appointment>('/appointments', data);
        return response.data;
    },

    async rescheduleAppointment(appointmentId: number, date: string, time: string): Promise<Appointment> {
        const response = await api.patch<Appointment>(`/appointments/${appointmentId}/reschedule`, { date, time });
        return response.data;
    },

    async submitReview(appointmentId: number, payload: ReviewPayload) {
        const response = await api.post(`/appointments/${appointmentId}/review`, payload);
        return response.data;
    }
};
