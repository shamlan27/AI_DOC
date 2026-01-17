import { Doctor } from '../types';

export const mockDoctors: Doctor[] = [
    {
        id: 1,
        name: 'Dr. Sarah Smith',
        specialty: 'Cardiologist',
        availability: 'Available Today',
        rating: 4.8,
    },
    {
        id: 2,
        name: 'Dr. James Johnson',
        specialty: 'Dermatologist',
        availability: 'Next Available: Tomorrow',
        rating: 4.5,
    },
    {
        id: 3,
        name: 'Dr. Emily Brown',
        specialty: 'General Practitioner',
        availability: 'Available Today',
        rating: 4.9,
    },
    {
        id: 4,
        name: 'Dr. Michael Wilson',
        specialty: 'Neurologist',
        availability: 'Fully Booked',
        rating: 4.7,
    },
];

export const mockAnalysisResult = (symptoms: string): Promise<Doctor[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simple mock logic: filter randomly or just return all for demo
            // In a real app, this would use the backend AI analysis
            resolve(mockDoctors);
        }, 1500);
    });
};
