import api from './api';
import { Doctor } from '../types';

export const doctorService = {
    async getAllDoctors(): Promise<Doctor[]> {
        const response = await api.get<Doctor[]>('/doctors');
        return response.data;
    },

    async getDoctorById(id: number | string): Promise<Doctor> {
        const response = await api.get<Doctor>(`/doctors/${id}`);
        return response.data;
    }
};
