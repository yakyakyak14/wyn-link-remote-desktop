import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import {useSession} from '../services/SessionService';

type JoinSessionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'JoinSession'
>;

type JoinSessionScreenRouteProp = RouteProp<RootStackParamList, 'JoinSession'>;

interface Props {
  navigation: JoinSessionScreenNavigationProp;
  route: JoinSessionScreenRouteProp;
}

const {width} = Dimensions.get('window');

const JoinSessionScreen: React.FC<Props> = ({navigation, route}) => {
  const {joinSession} = useSession();
  const [sessionCode, setSessionCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.sessionCode) {
      setSessionCode(route.params.sessionCode);
    }
  }, [route.params]);

  const handleJoinSession = async () => {
    if (!sessionCode.trim() || !pin.trim()) {
      Alert.alert('Error', 'Please enter both session code and PIN');
      return;
    }

    if (sessionCode.length !== 8) {
      Alert.alert('Error', 'Session code must be 8 characters');
      return;
    }

    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    try {
      setLoading(true);
      const session = await joinSession(sessionCode.toUpperCase(), pin);

      Alert.alert(
        'Success',
        'Connected to session successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('RemoteControl', {
                sessionId: session.id,
                isHost: false,
              });
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Connection Failed',
        error.message || 'Failed to join session',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatSessionCode = (text: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = text.replace(/[^A-Z0-9]/g, '').toUpperCase();
    return cleaned.substring(0, 8);
  };

  const formatPin = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    return cleaned.substring(0, 4);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Connect to Desktop</Text>
        <Text style={styles.subtitle}>
          Enter the session code and PIN provided by the host
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Session Code</Text>
          <TextInput
            style={styles.input}
            value={sessionCode}
            onChangeText={text => setSessionCode(formatSessionCode(text))}
            placeholder="Enter 8-character code"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            editable={!loading}
          />
          <Text style={styles.inputHint}>
            8-character code provided by the host
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>PIN</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={text => setPin(formatPin(text))}
            placeholder="Enter 4-digit PIN"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            editable={!loading}
          />
          <Text style={styles.inputHint}>4-digit PIN for session access</Text>
        </View>

        <TouchableOpacity
          style={[styles.connectButton, loading && styles.buttonDisabled]}
          onPress={handleJoinSession}
          disabled={loading}>
          <Text style={styles.connectButtonText}>
            {loading ? 'Connecting...' : 'Connect to Desktop'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Connect</Text>
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Ask the host to share their session code and PIN
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Enter the 8-character session code above
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Enter the 4-digit PIN to authenticate
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>4</Text>
            </View>
            <Text style={styles.instructionText}>
              Tap "Connect" to start controlling the desktop
            </Text>
          </View>
        </View>
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <View style={styles.securityIcon}>
          <Text style={styles.securityIconText}>🔒</Text>
        </View>
        <View style={styles.securityContent}>
          <Text style={styles.securityTitle}>Security Notice</Text>
          <Text style={styles.securityText}>
            Only connect to computers you trust. All sessions are encrypted and
            require explicit permission from the host.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  instructions: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  securityIcon: {
    marginRight: 12,
  },
  securityIconText: {
    fontSize: 20,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
  },
});

export default JoinSessionScreen;