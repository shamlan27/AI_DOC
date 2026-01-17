import api from './api';

export interface MedicalReport {
    id: number;
    doctor_name: string;
    report_type: string;
    report_date: string;
    file_path: string;
    created_at: string;
}

export const reportService = {
    async getReports(): Promise<MedicalReport[]> {
        const response = await api.get<MedicalReport[]>('/reports');
        return response.data;
    },

    async uploadReport(data: FormData): Promise<MedicalReport> {
        const response = await api.post<MedicalReport>('/reports', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
