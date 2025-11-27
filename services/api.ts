import { WarrantyItem } from '../types';

// Hardcoded API URL for production deployment
const API_URL = 'https://warranties-api.onrender.com/api';

export const fetchWarranties = async (): Promise<WarrantyItem[]> => {
    try {
        const response = await fetch(`${API_URL}/warranties`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', response.status, errorText);
            throw new Error(`Failed to fetch warranties: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Invalid content type:', contentType);
            throw new Error('API returned non-JSON response');
        }
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching warranties:', error);
        throw error;
    }
};

export const createWarranty = async (warranty: WarrantyItem): Promise<WarrantyItem> => {
    try {
        const response = await fetch(`${API_URL}/warranties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(warranty),
        });
        if (!response.ok) {
            throw new Error('Failed to create warranty');
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error creating warranty:', error);
        throw error;
    }
};

export const deleteWarranty = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/warranties/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete warranty');
        }
    } catch (error) {
        console.error('Error deleting warranty:', error);
        throw error;
    }
};

// Authentication APIs

export const registerUser = async (email: string, name: string, password?: string) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Registration failed:', response.status, data);
            throw new Error(data.error || 'Registration failed');
        }

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const loginUser = async (email: string, password?: string) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Login failed:', response.status, data);
            throw new Error(data.error || 'Login failed');
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const verifyCode = async (email: string, code: string, name?: string) => {
    try {
        const response = await fetch(`${API_URL}/auth/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, name }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Verification failed:', response.status, data);
            throw new Error(data.error || 'Verification failed');
        }

        return data;
    } catch (error) {
        console.error('Verification error:', error);
        throw error;
    }
};

export const resendCode = async (email: string) => {
    try {
        const response = await fetch(`${API_URL}/auth/resend-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend code failed:', response.status, data);
            throw new Error(data.error || 'Resend failed');
        }

        return data;
    } catch (error) {
        console.error('Resend code error:', error);
        throw error;
    }
};
