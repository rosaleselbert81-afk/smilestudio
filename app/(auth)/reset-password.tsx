import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const extractTokensFromHash = async () => {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Password reset only works in the browser.');
        return;
      }

      const hash = window.location.hash;
      if (!hash) {
        Alert.alert('Error', 'No token found in URL.');
        return;
      }

      const params = new URLSearchParams(hash.slice(1)); // remove '#'
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          Alert.alert('Error', error.message);
        } else {
          setTokenReady(true);
        }
      } else {
        Alert.alert('Error', 'Missing access or refresh token.');
      }
    };

    extractTokensFromHash();
  }, []);

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
    }
    return '';
  };

  const handlePasswordReset = async () => {
    const errorMsg = validatePassword(newPassword);
    setPasswordError(errorMsg);
    if (errorMsg) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password updated successfully');
      router.replace('/'); // Go to login or home
    }
  };

  if (!tokenReady) {
    return (
      <LinearGradient colors={['#80c4c4ff', '#009b84ff']} style={styles.container}>
        <Text style={styles.title}>Verifying reset link...</Text>
        <ActivityIndicator size="large" color="#ffffffff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#80c4c4ff', '#009b84ff']} style={styles.container}>
      <View style={{ width: '100%', maxWidth: 500, marginHorizontal: 'auto' }}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.label}>NEW PASSWORD</Text>
        <View
          style={[
            styles.verticallySpacedRow,
            passwordError ? { borderColor: '#b32020ff' } : undefined,
          ]}
        >
          <MaterialIcons name="lock" size={24} color="white" />
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            placeholder="Enter new password"
            placeholderTextColor="rgba(218, 218, 218, 1)"
            onChangeText={(text) => {
              setNewPassword(text);
              if (passwordError) setPasswordError('');
            }}
            value={newPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {passwordError !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Invalid Password</Text>
            <Text style={styles.errorMessage}>{passwordError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handlePasswordReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffffff',
    alignSelf: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: 10,
    letterSpacing: 1,
  },
  verticallySpacedRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffffff',
    marginBottom: 16,
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    gap: 5,
  },
  input: {
    backgroundColor: 'transparent',
    outlineWidth: 0,
    width: '80%',
    height: 40,
    color: 'rgba(255, 255, 255, 1)',
  },
  button: {
    backgroundColor: '#ffffffff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#00505cff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#ffd0d0ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  errorTitle: {
    color: '#b32020ff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#b32020ff',
    fontSize: 14,
    textAlign: 'center',
  },
});
