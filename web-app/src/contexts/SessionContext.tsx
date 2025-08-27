'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@wyn-link/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface SessionContextType {
  currentSession: Session | null;
  sessions: Session[];
  loading: boolean;
  createSession: (accessLevel: 'full' | 'partial', allowedApps?: string[], allowedPaths?: string[]) => Promise<Session>;
  joinSession: (sessionCode: string, pin: string) => Promise<Session>;
  endSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .or(`host_user_id.eq.${user.id},client_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (
    accessLevel: 'full' | 'partial',
    allowedApps?: string[],
    allowedPaths?: string[]
  ): Promise<Session> => {
    if (!user) throw new Error('User not authenticated');

    const sessionCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        host_user_id: user.id,
        session_code: sessionCode,
        pin,
        access_level: accessLevel,
        allowed_apps: allowedApps || null,
        allowed_paths: allowedPaths || null,
        expires_at: expiresAt,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    
    const session = data as Session;
    setCurrentSession(session);
    await refreshSessions();
    
    return session;
  };

  const joinSession = async (sessionCode: string, pin: string): Promise<Session> => {
    if (!user) throw new Error('User not authenticated');

    // First, find the session
    const { data: sessionData, error: findError } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_code', sessionCode)
      .eq('is_active', true)
      .single();

    if (findError || !sessionData) {
      throw new Error('Session not found or inactive');
    }

    // Verify PIN
    if (sessionData.pin !== pin) {
      throw new Error('Invalid PIN');
    }

    // Check if session is expired
    if (new Date(sessionData.expires_at) < new Date()) {
      throw new Error('Session has expired');
    }

    // Update session with client user
    const { data, error } = await supabase
      .from('sessions')
      .update({ client_user_id: user.id })
      .eq('id', sessionData.id)
      .select()
      .single();

    if (error) throw error;

    const session = data as Session;
    setCurrentSession(session);
    await refreshSessions();
    
    return session;
  };

  const endSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('id', sessionId);

    if (error) throw error;

    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
    
    await refreshSessions();
  };

  useEffect(() => {
    if (user) {
      refreshSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
    }
  }, [user]);

  const value = {
    currentSession,
    sessions,
    loading,
    createSession,
    joinSession,
    endSession,
    refreshSessions,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}