import React, { useState, useEffect } from 'react';

interface Organization {
    id: string;
    name: string;
    role: string;
    slug: string;
}

interface OrgSwitcherProps {
    currentOrgId: string | null;
    onOrgChange: (orgId: string) => void;
    onCreateNew: () => void;
}

export const OrgSwitcher: React.FC<OrgSwitcherProps> = ({ currentOrgId, onOrgChange, onCreateNew }) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/organizations`, {
                headers: {
                    'x-user-id': localStorage.getItem('userEmail') || ''
                }
            });

            if (response.ok) {
                const result = await response.json();
                setOrganizations(result.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentOrg = organizations.find(org => org.id === currentOrgId);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-onyx-gray border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            >
                <div className="flex-shrink-0 w-8 h-8 bg-brand-purple/20 rounded-lg flex items-center justify-center">
                    <span className="text-brand-purple font-bold text-sm">
                        {currentOrg?.name.charAt(0).toUpperCase() || '?'}
                    </span>
                </div>
                <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-off-white">
                        {currentOrg?.name || 'Select Organization'}
                    </div>
                    <div className="text-xs text-muted-silver capitalize">
                        {currentOrg?.role || 'No organization'}
                    </div>
                </div>
                <svg className={`w-4 h-4 text-muted-silver transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full mt-2 w-64 bg-charcoal-gray border border-white/10 rounded-lg shadow-2xl z-50">
                        <div className="p-2 max-h-80 overflow-y-auto">
                            {loading ? (
                                <div className="px-4 py-3 text-center text-muted-silver">Loading...</div>
                            ) : organizations.length === 0 ? (
                                <div className="px-4 py-3 text-center text-muted-silver text-sm">
                                    No organizations found
                                </div>
                            ) : (
                                organizations.map(org => (
                                    <button
                                        key={org.id}
                                        onClick={() => {
                                            onOrgChange(org.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${org.id === currentOrgId
                                                ? 'bg-brand-purple/20 text-brand-purple'
                                                : 'hover:bg-white/5 text-off-white'
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${org.id === currentOrgId ? 'bg-brand-purple/30' : 'bg-white/5'
                                            }`}>
                                            <span className="font-bold text-sm">
                                                {org.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-medium">{org.name}</div>
                                            <div className="text-xs text-muted-silver capitalize">{org.role}</div>
                                        </div>
                                        {org.id === currentOrgId && (
                                            <svg className="w-5 h-5 text-brand-purple" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="border-t border-white/10 p-2">
                            <button
                                onClick={() => {
                                    onCreateNew();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Organization
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
