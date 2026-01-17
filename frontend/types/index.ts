export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    availability: string;
    image?: string;
    rating?: number;
}

export interface Appointment {
    id: number;
    moduleId: number; // Doctor ID
    date: string;
    time: string;
    patientName?: string;
    symptoms?: string;
}
