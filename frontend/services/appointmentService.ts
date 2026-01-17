import api from './api';

export interface Appointment {
    id: number;
    doctor_id: number;
    date: string;
    time: string;
    status: string;
    doctor?: {
        name: string;
        specialization: string;
    };
}

export const appointmentService = {
    async getAppointments(): Promise<Appointment[]> {
        const response = await api.get<Appointment[]>('/appointments');
        return response.data;
    },

    async createAppointment(data: any): Promise<Appointment> {
        const response = await api.post<Appointment>('/appointments', data);
        return response.data;
    }
};
