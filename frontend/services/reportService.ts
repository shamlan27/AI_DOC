import api from './api';

export interface MedicalReport {
    id: number;
    doctor_name: string;
    report_type: string;
    report_date: string;
    file_path: string;
    created_at: string;
    appointment?: {
        id: number;
        booking_id?: string;
        queue_number?: number;
        estimated_arrival_time?: string | null;
        date?: string;
        time?: string;
        hospital?: string;
    };
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
    },

    async downloadReport(reportId: number, fallbackFilename = 'medical-report'): Promise<void> {
        const downloadWithUrl = async (url: string) => api.get(url, { responseType: 'blob' });
        const backendBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

        let response;

        try {
            response = await downloadWithUrl(`/reports/${reportId}/download`);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                response = await downloadWithUrl(`${backendBaseUrl}/reports/${reportId}/download`);
            } else {
                throw error;
            }
        }

        const contentDisposition = response.headers['content-disposition'] as string | undefined;
        const filenameMatch = contentDisposition?.match(/filename="?([^";]+)"?/i);
        const filename = filenameMatch?.[1] ?? `${fallbackFilename}.pdf`;

        const blob = new Blob([response.data]);
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = blobUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(blobUrl);
    }
};
