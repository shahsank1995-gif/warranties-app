import React, { useState } from 'react';

interface InviteModalProps {
    organizationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ organizationId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        role: 'member' as 'admin' | 'manager' | 'member' | 'viewer',
        department: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || ''}/api/organizations/${organizationId}/invite`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': localStorage.getItem('userEmail') || ''
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error?.message || 'Failed to send invitation');
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
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
                    <h2 className="text-2xl font-bold text-off-white">Invite Team Member</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-silver hover:text-off-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-fresh-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-fresh-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-off-white mb-2">Invitation Sent!</h3>
                        <p className="text-muted-silver text-sm">
                            An invitation email has been sent to {formData.email}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-silver mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 bg-onyx-gray border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-brand-purple transition-colors"
                                placeholder="colleague@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-silver mb-2">
                                Role *
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full px-4 py-2 bg-onyx-gray border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-brand-purple transition-colors"
                            >
                                <option value="viewer">Viewer - Can view warranties</option>
                                <option value="member">Member - Can add and edit warranties</option>
                                <option value="manager">Manager - Member + can manage team</option>
                                <option value="admin">Admin - Full access except billing</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-silver mb-2">
                                Department (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2 bg-onyx-gray border border-white/10 rounded-lg text-off-white focus:outline-none focus:border-brand-purple transition-colors"
                                placeholder="IT, Finance, Operations..."
                            />
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
                                {loading ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
