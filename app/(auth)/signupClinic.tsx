import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, useWindowDimensions, Image, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useSession } from '../../lib/SessionContext';  // Adjust path accordingly

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [clinicPhoto, setClinicPhoto] = useState<string | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 480;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUpClinic } = useSession();
  const [modalVisible, setModalVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const pickClinicPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setClinicPhoto(result.assets[0].uri);
    }
  };

  const pickLicensePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setLicensePhoto(result.assets[0].uri);
    }
  };

  const signUpHandler = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!clinicName || !mobileNumber || !email || !password || !address) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Upload photos first and get URLs
      let clinicPhotoUrl = null;
      let licensePhotoUrl = null;

      if (clinicPhoto) {
        clinicPhotoUrl = await uploadPhoto(clinicPhoto, 'clinic-photos');
      }
      if (licensePhoto) {
        licensePhotoUrl = await uploadPhoto(licensePhoto, 'license-photos');
      }

      // Prepare clinic profile with photo URLs
      const clinicProfile = {
        clinic_name: clinicName,
        mobile_number: mobileNumber,
        address: address,
        clinic_photo_url: clinicPhotoUrl || undefined,
        license_photo_url: licensePhotoUrl || undefined,
      };

      // Call signUpClinic from context
      await signUpClinic(email, password, clinicProfile);

      alert("Clinic account created. Please verify your email. If you did not receive a verification, try to use other email.");
      router.push('/login');
    } catch (error: any) {
      Alert.alert('Signup failed', error.message || 'Unknown error');
    }
  };

  // Upload image to Supabase Storage and return public URL
  const uploadPhoto = async (uri: string, folder: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Get file extension (default to jpg if not found)
      const match = /\.(\w+)$/.exec(uri);
      const fileExt = match ? match[1] : 'jpg';

      // Unique filename in specified folder
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      // Upload to the correct folder
      const { data, error } = await supabase.storage.from('clinic-photos').upload(fileName, blob, {
        upsert: false,
      });

      if (error) {
        console.error('Photo upload error:', error);
        Alert.alert('Upload failed', 'Could not upload photo.');
        return null;
      }

      // Get public URL for uploaded file
      const { data: publicUrlData } = supabase.storage.from('clinic-photos').getPublicUrl(fileName);
      return publicUrlData.publicUrl || null;
    } catch (error) {
      console.error('Upload exception:', error);
      return null;
    }
  };

  const termsText = `
SmileStudio- Terms of Use
Last Updated: May 8, 2025
Effective Immediately
By accessing or using SmileStudio, owned and operated by Scuba Scripter and Pixel
Cowboy Team, User agree to be legally bound by these Terms of Use. These Terms
govern your use of SmileStudio, a Web-Based Dental Appointment System with
Automated Messaging Follow-Up Reminders via AI Chatbot in San Jose Del Monte
Bulacan.
If you do not agree with any part of these Terms, you must immediately cease all
use of the Platform. Continued access constitutes unconditional acceptance of these
Terms and any future modifications.

1. Definitions
"Appointment"– A scheduled medical consultation booked through SmileStudio.
"No-Show"– Failure to attend a booked Appointment without prior cancellation.
"Grace Period"– A 15-minute window after a scheduled Appointment time during
which a late arrival may still be accommodated.
"Malicious Activity"– Any action that disrupts, exploits, or harms the Platform,
its users, or affiliated clinics (e.g., hacking, fake bookings, harassment).

2. Eligibility & Account Registration
2.1 Age Requirement
The Platform is accessible to users of all ages but is currently intended for non
commercial, academic/capstone project use only.
Minors (under 18) must obtain parental/guardian consent before booking Appointments.
2.2 Account Responsibility
Users must provide accurate, current, and complete information during registration.
You are solely responsible for:
- Maintaining the confidentiality of your login credentials.
- All activities conducted under your account.
- Immediately notify us of any unauthorized account use.

3. Permitted & Prohibited Use
3.1 Acceptable Use
You may use SmileStudio only for lawful purposes, including:
Booking legitimate medical Appointments at partner clinics in San Jose Del Monte,
Bulacan.
Accessing clinic information, availability, Location, Pricing,Services and AI
chatbot reminder assistance.

3.2 Strictly Prohibited Conduct
Violations will result in immediate account suspension or termination. You agree
NOT to:
- Create fake or duplicate Appointments (e.g., under false names).
- Engage in hacking, phishing, or data scraping (automated or manual).
- Harass clinic staff or other users (e.g., trolling, abusive messages).
- Upload malicious software (viruses, spyware) or disrupt server operations.
- Misrepresent your identity or medical needs.
- Circumvent appointment limits (e.g., creating multiple accounts).

4. Appointment Policies
4.1 Booking & Cancellation
Appointments operate on a "First-Appoint, First-Served" basis.
No downpayment is required ("Appoint Now, Pay Later").
Cancellations must be made at least 24 hours in advance via the Platform.

4.2 No-Show & Late Arrival Policy
AI Chatbot Reminder: Users receive 2 automated alerts:
- 2 hours before the Appointment.
Grace Period: A 15-minute late arrival window is permitted. After this:
- The Appointment is automatically forfeited.
- The slot is released to other patients.
- The User must reschedule.
Strike System:
5 No-Shows = 1-month account suspension.
Suspended accounts cannot book new Appointments but may view clinic information.

5. Intellectual Property Rights
5.1 Ownership
All text, graphics, logos, clinic data, and AI chatbot software APIs are the
exclusive property of SmileStudio and its partner clinics.
No commercial use (e.g., reselling clinic slots, redistributing data) is permitted.

5.2 Limited License
Users are granted a revocable, non-exclusive license to:
Access the Platform for personal, non-commercial healthcare purposes.

6. Privacy & Data Security
Our Privacy Policy (Will be added Soon) details how we collect, store, and protect
your data.
Clinic Confidentiality: All medical information shared during Appointments is
protected under HIPAA-equivalent Philippine laws.

7. Disclaimers & Limitation of Liability
7.1 No Medical Guarantees
SmileStudio is not a healthcare provider.
We do not guarantee diagnosis accuracy, treatment outcomes, or clinic availability.

7.2 Platform "As Is"
The Platform may experience downtime, bugs, or delays.

7.3 No Financial Liability
We do not charge users and do not handle payments, medical services, or clinic
operations.
We are not liable for:
- User misconduct (e.g., no-shows, fake bookings).
- Clinic errors (e.g., overbooking, misdiagnosis).
- Indirect damages (e.g., lost time, travel costs).

8. Termination & Enforcement
8.1 By SmileStudio
We may suspend or terminate accounts for:
- Breach of these Terms (e.g., fake Appointments, harassment).
- Malicious Activity (e.g., hacking attempts).
- Excessive No-Shows (per Section 4.2).

8.2 By Users
You may deactivate your account at any time by contacting:
(+63) 921-888-1835

9. Governing Law & Dispute Resolution
These Terms are governed by Philippine law (Republic Act No. 10173, Data Privacy
Act).
Disputes must first undergo mediation in San Jose Del Monte, Bulacan.
Unresolved disputes will be settled in Philippine courts.

10. Contact Information
For inquiries or violations, contact:
Scuba Scripter and Pixel Cowboy Team
(+63) 921-888-1835
San Jose Del Monte, Bulacan, Philippine
`;

  return (
    <LinearGradient colors={['#003a3aff', '#2f4f2fff']} style={styles.container}>
      <View style={styles.container}>
        <Text style={{ ...styles.title, fontSize: 22, color: 'white' }}>SIGN UP</Text>
        <View style={{ ...styles.formBox, width: isMobile ? 350 : 600, height: isMobile ? 700 : 720 }}>
          <ScrollView style={{ flex: 1 }} automaticallyAdjustKeyboardInsets>
            <Text style={styles.title}>(CLINIC)</Text>

            <Text style={styles.label}>Clinic's Name</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. Smile Studio Dental Clinic"
              placeholderTextColor="#555"
              value={clinicName}
              onChangeText={setClinicName}
            />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. 09123456789"
              placeholderTextColor="#555"
              value={mobileNumber}
              keyboardType="phone-pad"
              maxLength={11}
              autoComplete="tel"
              onChangeText={text => {
                const digitsOnly = text.replace(/[^0-9]/g, '');
                setMobileNumber(digitsOnly);
              }}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. SmileStudio@gmail.com"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                placeholderTextColor="#555"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Confirm Password"
                placeholderTextColor="#555"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#555"
              value={address}
              onChangeText={setAddress}
            />

            {/* <Text style={styles.label}>Clinic's Photo</Text>
            <TouchableOpacity style={styles.photoBox} onPress={pickClinicPhoto}>
              {clinicPhoto ? (
                <Image source={{ uri: clinicPhoto }} style={styles.photo} />
              ) : (
                <Text style={{ color: '#777' }}>
                  {Platform.OS === 'web' ? 'Click or drag a photo here' : 'Tap to select a photo'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>DOH License</Text>
            <TouchableOpacity style={styles.photoBox} onPress={pickLicensePhoto}>
              {licensePhoto ? (
                <Image source={{ uri: licensePhoto }} style={styles.photo} />
              ) : (
                <Text style={{ color: '#777' }}>
                  {Platform.OS === 'web' ? 'Click or drag a photo here' : 'Tap to select a photo'}
                </Text>
              )}
            </TouchableOpacity> */}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity style={{ ...styles.button, backgroundColor: '#b32020ff' }} onPress={() => router.push('/login')}>
                <Text style={styles.buttonText}>BACK</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, { backgroundColor: 'rgba(16, 82, 51, 1)' }]} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>SIGN UP</Text>
              </TouchableOpacity>
              <Modal visible={modalVisible} animationType="fade" transparent={true}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'white',
                      marginHorizontal: 20,
                      borderRadius: 10,
                      maxHeight: '80%',
                      padding: 15,
                      width: isMobile ? '80%' : '30%',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 10,
                        textAlign: 'center',
                      }}
                    >
                      Terms of Use
                    </Text>

                    <ScrollView style={{ marginBottom: 15 }}>
                      <Text style={{ fontSize: 14, lineHeight: 20 }}>{termsText}</Text>
                    </ScrollView>

                    {/* ✅ Checkbox */}
                    <TouchableOpacity
                      onPress={() => setTermsAccepted((prev) => !prev)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
                    >
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#888',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 10,
                          backgroundColor: termsAccepted ? '#4CAF50' : '#fff',
                        }}
                      >
                        {termsAccepted && (
                          <View style={{ width: 10, height: 10, backgroundColor: '#fff' }} />
                        )}
                      </View>
                      <Text>I agree to the terms of use</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 5,
                          marginHorizontal: 5,
                          alignItems: 'center',
                          backgroundColor: '#b32020ff',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                          Reject Terms and Close
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          if (termsAccepted) {
                            signUpHandler();
                            setModalVisible(false);
                          }
                        }}
                        disabled={!termsAccepted}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 5,
                          marginHorizontal: 5,
                          alignItems: 'center',
                          backgroundColor: termsAccepted ? '#4CAF50' : '#ccc',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                          Proceed and SignUp
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  formBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    height: 600,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    marginLeft: 4,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f5474ff',
    marginTop: 6,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  photoBox: {
    borderWidth: 1.5,
    borderColor: 'black',
    borderRadius: 8,
    height: 150,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: 'rgba(16, 82, 51, 1)',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
  },
});
