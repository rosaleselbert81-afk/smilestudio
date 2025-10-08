import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // Extract access_token from URL hash (e.g. #access_token=...)
    // If using web, you may have to parse window.location.hash manually
    // but expo-router provides searchParams for query params (not hash)
    // So we grab token from URL manually here:

    const hash = window.location.hash; // only works on web!
    const match = hash.match(/access_token=([^&]+)/);
    if (match && match[1]) {
      setToken(match[1]);
    } else {
      Alert.alert('Error', 'Missing or invalid reset token. Please use the link from your email.');
    }
  }, []);

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Supabase expects you to update the password **while logged in with the token**
    // So manually set the session with the token before updating password
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '', // no refresh token needed here
    });

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password updated successfully');
      router.replace('/'); // redirect after reset success
    }
  };

  if (!token) {
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
        style={styles.input}
        secureTextEntry
        placeholder="Enter new password"
        placeholderTextColor="#999"
        onChangeText={setNewPassword}
        value={newPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handlePasswordReset}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
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
    marginBottom: 16,
    color: '#000',
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
