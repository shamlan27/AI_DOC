import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface GoogleRedirectResponse {
    url: string;
}

export const authService = {
    async sendRegistrationOtp(email: string): Promise<any> {
        const response = await api.post('/send-registration-otp', { email });
        return response.data;
    },

    async register(data: any, otp: string): Promise<AuthResponse> {
        const payload = { ...data, password_confirmation: data.password, otp };
        const response = await api.post<AuthResponse>('/register', payload);
        return response.data;
    },

    async socialLogin(provider: string): Promise<void> {
        const response = await api.get<GoogleRedirectResponse>(`/auth/${provider}/redirect`);
        window.location.href = response.data.url;
    },

    async login(data: any): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/login', data);
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/logout');
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/user');
        return response.data;
    },

    async forgotPassword(email: string): Promise<any> {
        const response = await api.post('/forgot-password', { email });
        return response.data;
    },

    async resetPassword(data: any): Promise<any> {
        const response = await api.post('/reset-password', data);
        return response.data;
    },

    async sendDeleteOtp(): Promise<any> {
        const response = await api.post('/send-delete-otp');
        return response.data;
    },

    async deleteAccount(otp: string): Promise<void> {
        await api.delete('/user', { data: { otp } });
    }
};
