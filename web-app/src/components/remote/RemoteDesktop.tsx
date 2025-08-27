'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSession } from '@/contexts/SessionContext';

interface RemoteDesktopProps {
  isHost: boolean;
  sessionId: string;
}

export function RemoteDesktop({ isHost, sessionId }: RemoteDesktopProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const { endSession } = useSession();

  useEffect(() => {
    if (isHost) {
      initializeHost();
    } else {
      initializeClient();
    }

    return () => {
      cleanup();
    };
  }, [isHost, sessionId]);

  const initializeHost = async () => {
    try {
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Create data channel for remote control events
      const dc = pc.createDataChannel('remoteControl', {
        ordered: true
      });

      dc.onopen = () => {
        console.log('Data channel opened');
        setIsConnected(true);
      };

      dc.onmessage = (event) => {
        handleRemoteControlEvent(JSON.parse(event.data));
      };

      setDataChannel(dc);
      setPeerConnection(pc);

      // Start screen sharing
      await startScreenShare(pc);
    } catch (error) {
      console.error('Error initializing host:', error);
    }
  };

  const initializeClient = async () => {
    try {
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Handle incoming data channel
      pc.ondatachannel = (event) => {
        const dc = event.channel;
        dc.onopen = () => {
          console.log('Data channel opened');
          setIsConnected(true);
        };
        setDataChannel(dc);
      };

      // Handle incoming video stream
      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      setPeerConnection(pc);
    } catch (error) {
      console.error('Error initializing client:', error);
    }
  };

  const startScreenShare = async (pc: RTCPeerConnection) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsScreenSharing(true);

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        handleEndSession();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const handleRemoteControlEvent = (event: any) => {
    // This would typically send the event to a native application
    // that can simulate mouse/keyboard events on the host system
    console.log('Remote control event:', event);
    
    // For web implementation, we can only simulate basic events
    // A full implementation would require a native desktop application
    switch (event.type) {
      case 'mouse_move':
        // Simulate mouse move (limited in web browsers)
        break;
      case 'mouse_click':
        // Simulate mouse click (limited in web browsers)
        break;
      case 'key_press':
        // Simulate key press (limited in web browsers)
        break;
      default:
        break;
    }
  };

  const sendRemoteControlEvent = (event: any) => {
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(event));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isHost && isConnected) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        sendRemoteControlEvent({
          type: 'mouse_move',
          data: { x, y },
          timestamp: Date.now()
        });
      }
    }
  };

  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isHost && isConnected) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        sendRemoteControlEvent({
          type: 'mouse_click',
          data: { 
            x, 
            y, 
            button: e.button === 0 ? 'left' : e.button === 1 ? 'middle' : 'right'
          },
          timestamp: Date.now()
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!isHost && isConnected) {
      sendRemoteControlEvent({
        type: 'key_press',
        data: { key: e.key },
        timestamp: Date.now()
      });
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession(sessionId);
      cleanup();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const cleanup = () => {
    if (peerConnection) {
      peerConnection.close();
    }
    if (dataChannel) {
      dataChannel.close();
    }
    setIsConnected(false);
    setIsScreenSharing(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">WYN Link Remote Desktop</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isHost && (
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isScreenSharing ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
              <span className="text-sm">
                {isScreenSharing ? 'Sharing Screen' : 'Not Sharing'}
              </span>
            </div>
          )}
          
          <Button
            onClick={handleEndSession}
            variant="destructive"
            size="sm"
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {isHost ? (
          <div className="h-full flex items-center justify-center">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Sharing Your Desktop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  {isScreenSharing ? (
                    <p>Your screen is being shared. The remote user can now control your desktop.</p>
                  ) : (
                    <p>Click "Share Screen" to start sharing your desktop.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full relative">
            <video
              ref={videoRef}
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
            
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onClick={handleMouseClick}
              onKeyDown={handleKeyPress}
              tabIndex={0}
            />
            
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-lg">Connecting to remote desktop...</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white p-2 text-center text-sm">
        <p>WYN Link Remote Desktop - Secure remote access solution</p>
      </div>
    </div>
  );
}