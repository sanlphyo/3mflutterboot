'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'mentor' | 'mentee';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check local storage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('3m_user_session');
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
    } catch (err) {
      console.error('Failed to load session from local storage', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login action: Queries Appwrite database Users collection
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!DATABASE_ID || !USERS_COLLECTION_ID) {
        throw new Error('Appwrite Database ID or Users Collection ID is not configured.');
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [
          Query.equal('email', [email]),
          Query.equal('password', [password])
        ]
      );

      if (response.documents && response.documents.length > 0) {
        const doc = response.documents[0];
        const loggedUser: User = {
          id: doc.$id,
          email: doc.email || '',
          username: doc.username || 'User',
          role: (doc.role === 'mentor' ? 'mentor' : 'mentee') as 'mentor' | 'mentee'
        };

        // Persist session
        localStorage.setItem('3m_user_session', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: 'Invalid email or password.' };
      }
    } catch (err: any) {
      console.error('Login database error:', err);
      setLoading(false);
      return { success: false, error: err.message || 'An unexpected error occurred during login.' };
    }
  };

  // Logout action: Clears state & session
  const logout = () => {
    localStorage.removeItem('3m_user_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
