'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useSession } from '@/contexts/SessionContext';

export function JoinSessionForm() {
  const searchParams = useSearchParams();
  const { joinSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setSessionCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode || !pin) {
      setError('Please enter both session code and PIN');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await joinSession(sessionCode.toUpperCase(), pin);
      // Redirect will be handled by the session context
    } catch (error: any) {
      setError(error.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WYN Link</h1>
          <p className="text-gray-600">Join Remote Desktop Session</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Connect to Desktop</CardTitle>
            <CardDescription>
              Enter the session code and PIN provided by the host
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinSession} className="space-y-4">
              <Input
                label="Session Code"
                placeholder="Enter 8-character code"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="font-mono text-lg text-center"
                required
              />
              
              <Input
                label="PIN"
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                className="font-mono text-lg text-center"
                required
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                Connect to Desktop
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-500">
          <p>Make sure you trust the person sharing their desktop with you</p>
        </div>
      </div>
    </div>
  );
}