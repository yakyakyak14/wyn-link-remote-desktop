import React, {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from './AuthService';
import {useAuth} from './AuthService';

interface Session {
  id: string;
  session_code: string;
  pin: string;
  host_user_id: string;
  access_level: 'full' | 'partial';
  allowed_apps?: string[];
  allowed_paths?: string[];
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

interface SessionContextType {
  sessions: Session[];
  loading: boolean;
  createSession: (
    accessLevel: 'full' | 'partial',
    allowedApps?: string[],
    allowedPaths?: string[],
  ) => Promise<Session>;
  joinSession: (sessionCode: string, pin: string) => Promise<Session>;
  endSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {user} = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshSessions();
    } else {
      setSessions([]);
    }
  }, [user]);

  const generateSessionCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generatePin = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const createSession = async (
    accessLevel: 'full' | 'partial',
    allowedApps?: string[],
    allowedPaths?: string[],
  ): Promise<Session> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const sessionCode = generateSessionCode();
      const pin = generatePin();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      const sessionData = {
        session_code: sessionCode,
        pin,
        host_user_id: user.id,
        access_level: accessLevel,
        allowed_apps: allowedApps || null,
        allowed_paths: allowedPaths || null,
        is_active: true,
        expires_at: expiresAt.toISOString(),
      };

      const {data, error} = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newSession = data as Session;
      setSessions(prev => [newSession, ...prev]);

      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const joinSession = async (
    sessionCode: string,
    pin: string,
  ): Promise<Session> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Find the session
      const {data: sessionData, error: sessionError} = await supabase
        .from('sessions')
        .select('*')
        .eq('session_code', sessionCode.toUpperCase())
        .eq('pin', pin)
        .eq('is_active', true)
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Invalid session code or PIN');
      }

      // Check if session has expired
      const now = new Date();
      const expiresAt = new Date(sessionData.expires_at);
      if (now > expiresAt) {
        throw new Error('Session has expired');
      }

      // Record the join
      const {error: joinError} = await supabase
        .from('session_participants')
        .insert([
          {
            session_id: sessionData.id,
            user_id: user.id,
            joined_at: new Date().toISOString(),
          },
        ]);

      if (joinError) {
        console.error('Error recording session join:', joinError);
        // Don't throw here, as the session is still valid
      }

      return sessionData as Session;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  };

  const endSession = async (sessionId: string): Promise<void> => {
    try {
      const {error} = await supabase
        .from('sessions')
        .update({is_active: false})
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      // Update local state
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? {...session, is_active: false} : session,
        ),
      );
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  };

  const refreshSessions = async (): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      const {data, error} = await supabase
        .from('sessions')
        .select('*')
        .eq('host_user_id', user.id)
        .order('created_at', {ascending: false})
        .limit(50);

      if (error) {
        throw error;
      }

      setSessions(data as Session[]);
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: SessionContextType = {
    sessions,
    loading,
    createSession,
    joinSession,
    endSession,
    refreshSessions,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};