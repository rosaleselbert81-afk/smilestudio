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

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
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
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)
    ) {
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
    }
    return null;
  };

  const handlePasswordReset = async () => {
    const errorMsg = validatePassword(newPassword);

    if (errorMsg) {
      setPasswordError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    setPasswordError(null);
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

  const onChangePassword = (text: string) => {
    setNewPassword(text);
    // Validate on every input change for live feedback
    const errorMsg = validatePassword(text);
    setPasswordError(errorMsg);
  };

  if (!tokenReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verifying reset link...</Text>
        <ActivityIndicator size="large" color="#00505cff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set New Password</Text>
      <TextInput
        style={[
          styles.input,
          passwordError && { borderColor: 'red' }, // red border if error
        ]}
        secureTextEntry
        placeholder="Enter new password"
        placeholderTextColor="#999"
        onChangeText={onChangePassword}
        value={newPassword}
      />
      {passwordError && (
        <Text style={styles.errorText}>{passwordError}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#003f30ff',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    color: '#000',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#00505cff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
