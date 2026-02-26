'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import ChangePasswordModal from './Auth/ChangePasswordModal';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    forcePasswordChange?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true, logout: () => { } });

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);

    const { data: user, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (!res.ok) return null;

                const json = await res.json();
                const userData = json.data || json.user || json;

                if (!userData) return null;

                // Normalize _id to id
                return {
                    ...userData,
                    id: userData._id || userData.id || '',
                    name: userData.fullName || userData.name || 'User'
                };
            } catch (err) {
                return null;
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    useEffect(() => {
        if (user && user.forcePasswordChange) {
            setShowPasswordModal(true);
        } else {
            setShowPasswordModal(false);
        }
    }, [user]);

    const logout = () => {
        document.cookie = 'app_token=; path=/; max-age=0';
        localStorage.removeItem('app_token');
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user: user || null, isLoading, logout }}>
            {children}
            {showPasswordModal && <ChangePasswordModal force={true} />}
        </AuthContext.Provider>
    );
}
