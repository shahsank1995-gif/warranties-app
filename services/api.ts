import { WarrantyItem } from '../types';

// Hardcoded API URL for production deployment
// Hardcoded API URL for production deployment
export const API_URL = 'https://warranties-api.onrender.com/api';

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

// Helper function to wake up backend (fixes Render cold starts)
const wakeUpBackend = async (): Promise<boolean> => {
    try {
        console.log('🔄 Waking up backend...');
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(30000) // 30 second timeout
        });
        const healthy = response.ok;
        console.log(healthy ? '✅ Backend is awake' : '⚠️ Backend health check failed');
        return healthy;
    } catch (error) {
        console.warn('⏳ Backend is starting up...', error);
        return false;
    }
};

// Helper function to retry fetch with exponential backoff
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries} to ${url}`);
            const response = await fetch(url, {
                ...options,
                signal: AbortSignal.timeout(attempt === 1 ? 10000 : 30000) // First try: 10s, retries: 30s
            });
            return response;
        } catch (error: any) {
            const isLastAttempt = attempt === maxRetries;

            if (isLastAttempt) {
                throw new Error('Backend is not responding. Please try again in a minute.');
            }

            // Exponential backoff: 2s, 4s
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Request failed, retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Max retries reached');
};

export const loginUser = async (email: string, password?: string) => {
    const url = `${API_URL}/auth/login`;
    console.log('Attempting login to:', url);

    try {
        // Wake up backend first (helps with Render cold starts)
        await wakeUpBackend();

        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response body preview:', text.substring(0, 200));

        try {
            const data = JSON.parse(text);
            if (!response.ok) {
                console.error('Login failed:', response.status, data);
                throw new Error(data.error || 'Login failed');
            }
            return data;
        } catch (e) {
            console.error('JSON Parse Error:', e);
            throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
        }
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
