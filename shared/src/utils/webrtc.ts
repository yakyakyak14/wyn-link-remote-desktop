export class WebRTCUtils {
  static getDefaultRTCConfiguration(): RTCConfiguration {
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };
  }

  static async getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen sharing is not supported in this browser');
    }

    const defaultConstraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 60 }
      },
      audio: true
    };

    return navigator.mediaDevices.getDisplayMedia(constraints || defaultConstraints);
  }

  static async getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Media access is not supported in this browser');
    }

    const defaultConstraints: MediaStreamConstraints = {
      video: true,
      audio: true
    };

    return navigator.mediaDevices.getUserMedia(constraints || defaultConstraints);
  }

  static createDataChannel(
    peerConnection: RTCPeerConnection,
    label: string,
    options?: RTCDataChannelInit
  ): RTCDataChannel {
    const defaultOptions: RTCDataChannelInit = {
      ordered: true,
      maxRetransmits: 3
    };

    return peerConnection.createDataChannel(label, { ...defaultOptions, ...options });
  }

  static handleIceCandidate(
    peerConnection: RTCPeerConnection,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ): void {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };
  }

  static handleConnectionStateChange(
    peerConnection: RTCPeerConnection,
    onStateChange: (state: RTCPeerConnectionState) => void
  ): void {
    peerConnection.onconnectionstatechange = () => {
      onStateChange(peerConnection.connectionState);
    };
  }

  static handleDataChannelMessage(
    dataChannel: RTCDataChannel,
    onMessage: (data: any) => void
  ): void {
    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };
  }

  static sendDataChannelMessage(dataChannel: RTCDataChannel, data: any): void {
    if (dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(data));
    } else {
      console.warn('Data channel is not open, message not sent');
    }
  }

  static async createOffer(peerConnection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  static async createAnswer(peerConnection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  }

  static async setRemoteDescription(
    peerConnection: RTCPeerConnection,
    description: RTCSessionDescriptionInit
  ): Promise<void> {
    await peerConnection.setRemoteDescription(description);
  }

  static async addIceCandidate(
    peerConnection: RTCPeerConnection,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    await peerConnection.addIceCandidate(candidate);
  }

  static getConnectionStats(peerConnection: RTCPeerConnection): Promise<RTCStatsReport> {
    return peerConnection.getStats();
  }

  static closePeerConnection(peerConnection: RTCPeerConnection): void {
    peerConnection.close();
  }
}