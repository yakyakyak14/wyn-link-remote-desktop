import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import JoinSessionScreen from './screens/JoinSessionScreen';
import RemoteControlScreen from './screens/RemoteControlScreen';
import SettingsScreen from './screens/SettingsScreen';

// Services
import {AuthProvider} from './services/AuthService';
import {SessionProvider} from './services/SessionService';

// Types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  JoinSession: {sessionCode?: string};
  RemoteControl: {sessionId: string; isHost: boolean};
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AuthProvider>
        <SessionProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#3b82f6',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}>
              <Stack.Screen
                name="Splash"
                component={SplashScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: 'WYN Link',
                  headerLeft: () => null,
                }}
              />
              <Stack.Screen
                name="JoinSession"
                component={JoinSessionScreen}
                options={{title: 'Join Session'}}
              />
              <Stack.Screen
                name="RemoteControl"
                component={RemoteControlScreen}
                options={{
                  title: 'Remote Control',
                  headerLeft: () => null,
                }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{title: 'Settings'}}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SessionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;