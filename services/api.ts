import { WarrantyItem } from '../types';

// For local development, use relative path to use Vite proxy.
// For mobile/production, this should be the full URL of your backend.
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const fetchWarranties = async (): Promise<WarrantyItem[]> => {
    try {
        const response = await fetch(`${API_URL}/warranties`);
        if (!response.ok) {
            throw new Error('Failed to fetch warranties');
        }
        const result = await response.json();
        return result.data;
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
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
};

export const loginUser = async (email: string, password?: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data;
};

export const verifyCode = async (email: string, code: string, name?: string) => {
    const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Verification failed');
    return data;
};

export const resendCode = async (email: string) => {
    const response = await fetch(`${API_URL}/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Resend failed');
    return data;
};
