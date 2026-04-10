import api from './api';
import { Hospital } from '../types';

const normalizeHospital = (hospital: Partial<Hospital>): Hospital => ({
    id: Number(hospital.id ?? 0),
    name: hospital.name ?? 'Unknown Hospital',
    city: hospital.city ?? 'Unknown City',
    phone: hospital.phone ?? undefined,
    email: hospital.email ?? undefined,
    address: hospital.address ?? undefined,
    total_beds: typeof hospital.total_beds === 'number' ? hospital.total_beds : undefined,
});

export const hospitalService = {
    async getAllHospitals(): Promise<Hospital[]> {
        const response = await api.get<Hospital[]>('/hospitals');
        return (response.data ?? []).map((hospital) => normalizeHospital(hospital));
    },
};
