'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useSession } from '@/contexts/SessionContext';
import { copyToClipboard } from '@/lib/utils';

export function CreateSessionForm() {
  const { createSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'full' | 'partial'>('full');
  const [allowedApps, setAllowedApps] = useState<string>('');
  const [allowedPaths, setAllowedPaths] = useState<string>('');
  const [createdSession, setCreatedSession] = useState<any>(null);

  const handleCreateSession = async () => {
    try {
      setLoading(true);
      const allowedAppsArray = allowedApps ? allowedApps.split(',').map(app => app.trim()) : undefined;
      const allowedPathsArray = allowedPaths ? allowedPaths.split(',').map(path => path.trim()) : undefined;
      
      const session = await createSession(accessLevel, allowedAppsArray, allowedPathsArray);
      setCreatedSession(session);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySessionCode = () => {
    if (createdSession) {
      copyToClipboard(createdSession.session_code);
    }
  };

  const handleCopyPin = () => {
    if (createdSession) {
      copyToClipboard(createdSession.pin);
    }
  };

  const handleCopyShareLink = () => {
    if (createdSession) {
      const shareLink = `${window.location.origin}/join?code=${createdSession.session_code}`;
      copyToClipboard(shareLink);
    }
  };

  if (createdSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Session Created Successfully!</CardTitle>
          <CardDescription>
            Share these details with the person you want to give access to your desktop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Code</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={createdSession.session_code}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button onClick={handleCopySessionCode} variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">PIN</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={createdSession.pin}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button onClick={handleCopyPin} variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Share Link</label>
            <div className="flex items-center space-x-2">
              <Input
                value={`${window.location.origin}/join?code=${createdSession.session_code}`}
                readOnly
                className="text-sm"
              />
              <Button onClick={handleCopyShareLink} variant="outline" size="sm">
                Copy Link
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Session Details</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Access Level: {createdSession.access_level === 'full' ? 'Full Access' : 'Partial Access'}</li>
              <li>• Expires: {new Date(createdSession.expires_at).toLocaleString()}</li>
              {createdSession.allowed_apps && (
                <li>• Allowed Apps: {createdSession.allowed_apps.join(', ')}</li>
              )}
              {createdSession.allowed_paths && (
                <li>• Allowed Paths: {createdSession.allowed_paths.join(', ')}</li>
              )}
            </ul>
          </div>
          
          <Button
            onClick={() => setCreatedSession(null)}
            variant="outline"
            className="w-full"
          >
            Create Another Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Desktop</CardTitle>
        <CardDescription>
          Create a secure session to allow someone to access your desktop remotely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Access Level</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="full"
                  checked={accessLevel === 'full'}
                  onChange={(e) => setAccessLevel(e.target.value as 'full' | 'partial')}
                  className="text-blue-600"
                />
                <span>Full Access - Complete control of your desktop</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="partial"
                  checked={accessLevel === 'partial'}
                  onChange={(e) => setAccessLevel(e.target.value as 'full' | 'partial')}
                  className="text-blue-600"
                />
                <span>Partial Access - Limited to specific apps and folders</span>
              </label>
            </div>
          </div>

          {accessLevel === 'partial' && (
            <>
              <Input
                label="Allowed Applications (comma-separated)"
                placeholder="e.g., notepad.exe, calculator.exe"
                value={allowedApps}
                onChange={(e) => setAllowedApps(e.target.value)}
              />
              
              <Input
                label="Allowed Folders (comma-separated)"
                placeholder="e.g., C:\Documents, C:\Pictures"
                value={allowedPaths}
                onChange={(e) => setAllowedPaths(e.target.value)}
              />
            </>
          )}
        </div>

        <Button
          onClick={handleCreateSession}
          loading={loading}
          className="w-full"
          size="lg"
        >
          Create Session
        </Button>
      </CardContent>
    </Card>
  );
}