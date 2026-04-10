export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    availability: string;
    hospitals?: string[];
    hospital_schedules?: {
        hospital: string;
        time_slots: string[];
        available_days?: string[];
        specific_dates?: string[];
        consultation_end_time?: string;
        max_patients_per_slot?: number;
    }[];
    image?: string;
    rating?: number;
    consultation_fee?: number;
}

export interface Hospital {
    id: number;
    name: string;
    city: string;
    phone?: string;
    email?: string;
    address?: string;
    total_beds?: number;
}

export interface Appointment {
    id: number;
    moduleId: number; // Doctor ID
    date: string;
    time: string;
    patientName?: string;
    symptoms?: string;
}
