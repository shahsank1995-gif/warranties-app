import React, { useState } from 'react';

interface CreateOrgModalProps {
    onClose: () => void;
    onSuccess: (org: any) => void;
}

export const CreateOrgModal: React.FC<CreateOrgModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        size: 'small' as 'small' | 'medium' | 'large' | 'enterprise'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/organizations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': localStorage.getItem('userEmail') || ''
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create organization');
            }

            const result = await response.json();
            onSuccess(result.data);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-charcoal-gray rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-off-white">Create Organization</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-silver hover:text-off-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-silver mb-2">
                            Organization Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-onyx-gray border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-brand-purple transition-colors"
                            placeholder="Acme Corporation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-silver mb-2">
                            Industry
                        </label>
                        <input
                            type="text"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className="w-full px-4 py-2 bg-onyx-gray border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-brand-purple transition-colors"
                            placeholder="Technology, Healthcare, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-silver mb-2">
                            Company Size
                        </label>
                        <select
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value as any })}
                            className="w-full px-4 py-2 bg-onyx-gray border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-brand-purple transition-colors"
                        >
                            <option value="small">Small (1-50 employees)</option>
                            <option value="medium">Medium (51-500 employees)</option>
                            <option value="large">Large (501-5000 employees)</option>
                            <option value="enterprise">Enterprise (5000+ employees)</option>
                        </select>
                    </div>

                    {error && (
                        <div className="p-3 bg-alert-red/10 border border-alert-red/20 rounded-lg text-alert-red text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-onyx-gray border border-white/20 hover:bg-white/5 text-off-white rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Organization'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
