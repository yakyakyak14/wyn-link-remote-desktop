'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RemoteDesktop } from '@/components/remote/RemoteDesktop';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';
import { Session } from '@wyn-link/shared';

export default function SessionPage() {
  const params = useParams();
  const { user } = useAuth();
  const { sessions } = useSession();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = params.id as string;
    const foundSession = sessions.find(s => s.id === sessionId);
    
    if (foundSession) {
      setSession(foundSession);
    }
    
    setLoading(false);
  }, [params.id, sessions]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <p className="text-gray-400 mb-8">The session you're looking for doesn't exist or has expired.</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-8">Please sign in to access this session.</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const isHost = session.host_user_id === user.id;

  return (
    <RemoteDesktop
      isHost={isHost}
      sessionId={session.id}
    />
  );
}