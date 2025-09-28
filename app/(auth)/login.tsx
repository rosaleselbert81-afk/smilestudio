import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useSession } from '@/lib/SessionContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialIcons1 from '@expo/vector-icons/MaterialIcons';

import {
  AppState,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  useWindowDimensions,
} from 'react-native';

// Handle Supabase auth refresh on app active/inactive
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn } = useSession();
  const { width } = useWindowDimensions();
  const isMobile = width < 480;
  const [modalVisible, setModalVisible] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);


  // The new login handler
  const handleLogin = async () => {
    if (!email || !password) return;
    //setLoading(true);

    signIn(email, password);
    //setLoading(false);
    //if (!role) return;

    //setIsRedirecting(true);
  };

  if (isRedirecting) {
    return null; // or <ActivityIndicator /> if you want a loading spinner here
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    // You can handle errors or alerts here
    setLoading(false);
  }

  return (
    <LinearGradient colors={['#009b9bff', '#559255ff']} style={[styles.container]}>
      <ScrollView style={{ flex: 1 }} automaticallyAdjustKeyboardInsets>
        <View
          style={{
            width: '100%',
            maxWidth: 500,
            marginHorizontal: 'auto',
          }}
        >
          <Image source={require('../../assets/favicon.ico.png')} style={styles.logo} />

          <Text style={styles.welcome}>SMILE STUDIO</Text>
          <Text
            style={{
              ...styles.welcome,
              fontSize: 15,
              marginTop: -10,
              fontWeight: '300',
              marginBottom: -15,
            }}
          >
            Grin Creators
          </Text>

          <View style={{ ...styles.container }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#ffffffff',
                alignSelf: 'flex-start',
                marginBottom: 10,
                letterSpacing: 1,
              }}
            >
              EMAIL
            </Text>
            <View
              style={{
                ...styles.verticallySpaced,
                flexDirection: 'row',
                height: 60,
                alignItems: 'center',
                gap: 5,
              }}
            >
              <MaterialIcons name="email" size={24} color={'white'} />
              <TextInput
                style={{
                  backgroundColor: '#00000000',
                  outlineWidth: 0,
                  width: '100%',
                  height: 40,
                  color: 'rgba(255, 255, 255, 1)',
                }}
                onChangeText={(text) => setEmail(text)}
                placeholder="JuanDelaCruz@address.com"
                autoCapitalize={'none'}
                placeholderTextColor={'rgba(192, 192, 192, 1)'}
              />
            </View>

            <Text
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#ffffffff',
                alignSelf: 'flex-start',
                marginBottom: 10,
                letterSpacing: 1,
              }}
            >
              PASSWORD
            </Text>
            <View
              style={{
                ...styles.verticallySpaced,
                flexDirection: 'row',
                height: 60,
                alignItems: 'center',
                gap: 5,
              }}
            >
              <MaterialIcons1 name="password" size={24} color="white" />

              <TextInput
                style={{
                  backgroundColor: '#00000000',
                  outlineWidth: 0,
                  width: '80%',
                  height: 40,
                  color: 'rgba(255, 255, 255, 1)',
                }}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={!showPassword}
                placeholder="Password"
                autoCapitalize="none"
                placeholderTextColor='rgba(192, 192, 192, 1)'
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.verticallySpaced}>
              <TouchableOpacity
                style={{
                  backgroundColor:
                    email === '' || password === ''
                      ? 'rgba(143, 143, 143, 0)'
                      : 'rgba(25, 58, 119, 1)',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 15,
                  shadowColor: '#00000045',
                  shadowRadius: 6,
                  shadowOffset: { width: 4, height: 4 },
                }}
                disabled={loading || email === '' || password === ''}
                onPress={handleLogin}
              >
                <Text style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 1)' }}>
                  {loading ? 'Signing In...' : 'SIGN IN'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                color: '#ffffffff',
                fontWeight: 'bold',
                marginBottom: 1,
              }}
            >
              Do you have an Account (Patient/Clinic)?
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                color: '#ffffffff',
                fontWeight: 'bold',
                marginBottom: 10,
              }}
            >
              Sign up here!
            </Text>
            <View style={styles.verticallySpaced}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(25, 58, 119, 1)',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 15,
                  shadowColor: '#00000045',
                  shadowRadius: 6,
                  shadowOffset: { width: 4, height: 4 },
                }}
                disabled={loading}
                onPress={() => setModalVisible(true)}
              >
                <Text style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 1)' }}>
                  SIGN UP
                </Text>
              </TouchableOpacity>
              <Modal
                transparent
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={{ ...styles.modalBox, width: !isMobile ? 550 : 280 }}>
                    <Text
                      style={{ ...styles.optionText, fontSize: 20, marginBottom: 20, color: "#003f30ff" }}
                    >
                      Patient or Clinic?
                    </Text>

                    {/* PATIENT BUTTON */}
                    <TouchableOpacity
                      style={{ ...styles.optionButton, backgroundColor: '#86ffc7ff' }}
                      onPress={() => {
                        router.push('/signupPatient');
                        setModalVisible(false);
                      }}
                    >
                      <Fontisto name="bed-patient" size={64} color="#498d6dff" />
                      <Text style={{ ...styles.optionText, color: '#498d6dff' }}>PATIENT</Text>
                    </TouchableOpacity>

                    {/* CLINIC BUTTON */}
                    <TouchableOpacity
                      style={{ ...styles.optionButton, backgroundColor: '#86f7ffff' }}
                      onPress={() => {
                        router.push('/signupClinic');
                        setModalVisible(false);
                      }}
                    >
                      <FontAwesome5 name="clinic-medical" size={64} color="#4a878bff" />
                      <Text style={{ ...styles.optionText, color: '#4a878bff' }}>CLINIC</Text>
                    </TouchableOpacity>

                    {/* CLOSE BUTTON */}
                    <TouchableOpacity
                      style={{ ...styles.closeButton, backgroundColor: '#b32020ff' }}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>CLOSE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                color: '#ffffffff',
                textDecorationLine: 'underline',
                fontWeight: 'bold',
              }}
            >
              Forgot Password?
            </Text>
          </View>
          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 100,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffffff',
    alignSelf: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  verticallySpaced: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffffff',
    color: '#fff',
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 280,
    alignItems: 'center',
  },
  optionButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: '#00000045',
    shadowRadius: 6,
    shadowOffset: { width: 4, height: 4 },
    borderColor: 'black',
    marginBottom: 15,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: 'rgba(25, 58, 119, 1)',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    shadowColor: '#00000045',
    shadowRadius: 6,
    shadowOffset: { width: 4, height: 4 },
  },
});
