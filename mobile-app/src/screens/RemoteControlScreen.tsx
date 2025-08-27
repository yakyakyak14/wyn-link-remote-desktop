import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  PanGestureHandler,
  State,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import {useSession} from '../services/SessionService';

type RemoteControlScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RemoteControl'
>;

type RemoteControlScreenRouteProp = RouteProp<
  RootStackParamList,
  'RemoteControl'
>;

interface Props {
  navigation: RemoteControlScreenNavigationProp;
  route: RemoteControlScreenRouteProp;
}

const {width, height} = Dimensions.get('window');

const RemoteControlScreen: React.FC<Props> = ({navigation, route}) => {
  const {endSession} = useSession();
  const {sessionId, isHost} = route.params;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [sessionDuration, setSessionDuration] = useState('00:00:00');
  const sessionStartTime = useRef<Date>(new Date());

  useEffect(() => {
    // Simulate connection process
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setConnectionStatus('Connected');
    }, 2000);

    // Start session timer
    const timer = setInterval(() => {
      updateSessionDuration();
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(timer);
    };
  }, []);

  const updateSessionDuration = () => {
    const now = new Date();
    const elapsed = now.getTime() - sessionStartTime.current.getTime();
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    const duration = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    setSessionDuration(duration);
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await endSession(sessionId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to end session');
            }
          },
        },
      ],
    );
  };

  const handleGesture = (event: any) => {
    if (!isConnected) return;

    const {translationX, translationY, state} = event.nativeEvent;

    if (state === State.ACTIVE) {
      // Handle mouse movement
      console.log('Mouse move:', {x: translationX, y: translationY});
      // In a real implementation, this would send WebRTC data channel messages
    }
  };

  const handleTap = (event: any) => {
    if (!isConnected) return;

    const {x, y} = event.nativeEvent;
    console.log('Mouse click:', {x, y});
    // In a real implementation, this would send click events via WebRTC
  };

  const sendKeyboardInput = (key: string) => {
    if (!isConnected) return;

    console.log('Key press:', key);
    // In a real implementation, this would send keyboard events via WebRTC
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              isConnected ? styles.statusConnected : styles.statusConnecting,
            ]}
          />
          <Text style={styles.statusText}>{connectionStatus}</Text>
        </View>

        <View style={styles.sessionInfo}>
          <Text style={styles.sessionDuration}>{sessionDuration}</Text>
        </View>

        <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Remote Desktop View */}
      <View style={styles.desktopContainer}>
        {!isConnected ? (
          <View style={styles.connectingContainer}>
            <View style={styles.connectingContent}>
              <Text style={styles.connectingText}>Connecting to desktop...</Text>
              <Text style={styles.connectingSubtext}>
                Please wait while we establish a secure connection
              </Text>
            </View>
          </View>
        ) : (
          <PanGestureHandler onGestureEvent={handleGesture}>
            <View style={styles.desktopView}>
              <TouchableOpacity
                style={styles.desktopTouchArea}
                onPress={handleTap}
                activeOpacity={1}>
                <View style={styles.desktopPlaceholder}>
                  <Text style={styles.desktopPlaceholderText}>
                    Remote Desktop View
                  </Text>
                  <Text style={styles.desktopPlaceholderSubtext}>
                    {isHost ? 'Sharing your screen' : 'Controlling remote desktop'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </PanGestureHandler>
        )}
      </View>

      {/* Control Panel */}
      {isConnected && !isHost && (
        <View style={styles.controlPanel}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => sendKeyboardInput('Ctrl+C')}>
              <Text style={styles.controlButtonText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => sendKeyboardInput('Ctrl+V')}>
              <Text style={styles.controlButtonText}>Paste</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => sendKeyboardInput('Alt+Tab')}>
              <Text style={styles.controlButtonText}>Alt+Tab</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => sendKeyboardInput('Ctrl+Alt+Del')}>
              <Text style={styles.controlButtonText}>Ctrl+Alt+Del</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => sendKeyboardInput('Windows')}>
              <Text style={styles.controlButtonText}>⊞ Win</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => sendKeyboardInput('Escape')}>
              <Text style={styles.controlButtonText}>Esc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => sendKeyboardInput('Enter')}>
              <Text style={styles.controlButtonText}>Enter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => sendKeyboardInput('Backspace')}>
              <Text style={styles.controlButtonText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Host Info Panel */}
      {isHost && (
        <View style={styles.hostPanel}>
          <Text style={styles.hostPanelTitle}>Sharing Your Screen</Text>
          <Text style={styles.hostPanelText}>
            Your desktop is being shared. The remote user can now control your
            computer.
          </Text>
          <Text style={styles.hostPanelWarning}>
            ⚠️ Only share with people you trust
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: '#10b981',
  },
  statusConnecting: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  sessionInfo: {
    alignItems: 'center',
  },
  sessionDuration: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  endButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  endButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  desktopContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  connectingContent: {
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  connectingSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  desktopView: {
    flex: 1,
  },
  desktopTouchArea: {
    flex: 1,
  },
  desktopPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
    margin: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6b7280',
    borderStyle: 'dashed',
  },
  desktopPlaceholderText: {
    fontSize: 18,
    color: '#d1d5db',
    fontWeight: '600',
    marginBottom: 8,
  },
  desktopPlaceholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  controlPanel: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  hostPanel: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  hostPanelTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  hostPanelText: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  hostPanelWarning: {
    fontSize: 12,
    color: '#fbbf24',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RemoteControlScreen;