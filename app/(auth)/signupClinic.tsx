import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, useWindowDimensions, Image, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useSession } from '../../lib/SessionContext';  // Adjust path accordingly


  type ErrorsType = {
    clinicName?: string;
    mobileNumber?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    street?: string;
    barangay?: string;
    zipCode?: string;
  };


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
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [cityProvince, setCityProvince] = useState('San Jose Del Monte, Bulacan');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState<ErrorsType>({});






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

const validateForm = (): boolean => {
  const newErrors: ErrorsType = {};

  if (!clinicName?.trim()) {
    newErrors.clinicName = "Clinic name is required";
  }

  if (!mobileNumber?.trim()) {
    newErrors.mobileNumber = "Mobile number is required";
  } else if (!/^09\d{9}$/.test(mobileNumber)) {
    newErrors.mobileNumber = "Mobile number must be exactly 11 digits and start with 09";
  }

  if (!email?.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    newErrors.email = "Invalid email format";
  }

  if (!street?.trim()) {
    newErrors.street = "Street is required";
  }

  if (!barangay?.trim()) {
    newErrors.barangay = "Barangay is required";
  }

  if (!zipCode?.trim()) {
    newErrors.zipCode = "Zip code is required";
  } else if (!/^\d{4}$/.test(zipCode)) {
    newErrors.zipCode = "Zip code must be exactly 4 digits";
  } else if (zipCode !== "3023" && zipCode !== "3024") {
    newErrors.zipCode = "Zip code must be 3023 or 3024";
  }

  if (!password) {
    newErrors.password = "Password is required";
  } else if (password.length < 8) {
    newErrors.password = "Password must be at least 8 characters";
  }

  if (!confirmPassword) {
    newErrors.confirmPassword = "Please confirm your password";
  } else if (confirmPassword !== password) {
    newErrors.confirmPassword = "Passwords do not match";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

const signUpHandler = async () => {
  if (!validateForm()) {
    // Validation failed, errors are set, so just return here
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

    alert(
      "Clinic account created. Please verify your email. If you did not receive a verification, try using another email."
    );
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

useEffect(() => {
  const fullAddress = `${street}, ${barangay}, ${cityProvince}, ${zipCode}`;
  setAddress(fullAddress);
}, [street, barangay, cityProvince, zipCode]);

return (
  <LinearGradient colors={['#80c4c4ff', '#009b84ff']} style={styles.container}>
    <View style={styles.container}>
      <View
        style={{
          ...styles.formBox,
          width: isMobile ? 360 : 900,
          height: isMobile ? 650 : 740,
          padding: 40,
        }}
      >
        <ScrollView style={{ flex: 1 }} automaticallyAdjustKeyboardInsets>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={{ position: 'absolute', top: 10, left: 0, zIndex: 10 }}
          >
            <Ionicons name="arrow-back" size={36} color="#003f30ff" />
          </TouchableOpacity>

          {/* Logo & Titles */}
          <Image
            source={require('../../assets/favicon.ico.png')}
            style={styles.logo}
          />
          <Text style={styles.welcome}>SMILE STUDIO</Text>
          <Text
            style={{
              ...styles.welcome,
              fontSize: 15,
              marginTop: -10,
              fontWeight: '300',
              marginBottom: 20,
            }}
          >
            Grin Creators
          </Text>

          {/* Main Form Title */}
          <Text
            style={{
              ...styles.sectionHeader,
              fontSize: 21,
              borderBottomWidth: 2,
              marginTop: 32,
              marginBottom: 36,
            }}
          >
            CLINIC SIGN UP
          </Text>

          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 0 : 24, // space between columns only on desktop
              marginBottom: 30,
            }}
          >
                      {/* Clinic Information Section */}
          <View style={{ marginBottom: 30, flex : 1 }}>
            <Text style={styles.sectionHeader}>Clinic Information</Text>

            {/* Clinic Name */}
            <Text style={[styles.label, { marginBottom: 4 }]}>Clinic Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.clinicName && { borderColor: 'red' },
                { marginBottom: 8 },
              ]}
              placeholder="e.g. Smile Studio"
              maxLength={40}
              placeholderTextColor="#555"
              value={clinicName}
              onChangeText={(text) => {
                setClinicName(text);
                if (errors.clinicName)
                  setErrors((prev) => ({ ...prev, clinicName: undefined }));
              }}
            />
            {errors.clinicName && (
              <Text style={styles.errorText}>{errors.clinicName}</Text>
            )}

            {/* Email */}
            <Text style={[styles.label, { marginBottom: 4 }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                errors.email && { borderColor: 'red' },
                { marginBottom: 8 },
              ]}
              placeholder="e.g. clinic@example.com"
              placeholderTextColor="#555"
              maxLength={40}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Mobile Number */}
            <Text style={[styles.label, { marginBottom: 4 }]}>Mobile Number</Text>
            <TextInput
              style={[
                styles.input,
                errors.mobileNumber && { borderColor: 'red' },
                { marginBottom: 8 },
              ]}
              placeholder="e.g. 09123456789"
              placeholderTextColor="#555"
              value={mobileNumber}
              keyboardType="phone-pad"
              maxLength={11}
              autoComplete="tel"
              onChangeText={(text) => {
                const digitsOnly = text.replace(/[^0-9]/g, '');
                setMobileNumber(digitsOnly);
                if (errors.mobileNumber)
                  setErrors((prev) => ({ ...prev, mobileNumber: undefined }));
              }}
            />
            {errors.mobileNumber && (
              <Text style={styles.errorText}>{errors.mobileNumber}</Text>
            )}
            </View>

            {/* Clinic Location Section */}
            <View style={{ marginBottom: 30, flex : 1 }}>
              <Text style={styles.sectionHeader}>Clinic Location</Text>

              {/* Street */}
              <Text style={[styles.label, { marginBottom: 4 }]}>Street</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.street && { borderColor: 'red' },
                  { marginBottom: 8 },
                ]}
                placeholder="e.g. 123 Main St"
                placeholderTextColor="#555"
                maxLength={30}
                value={street}
                onChangeText={(text) => {
                  setStreet(text);
                  if (errors.street)
                    setErrors((prev) => ({ ...prev, street: undefined }));
                }}
              />
              {errors.street && (
                <Text style={styles.errorText}>{errors.street}</Text>
              )}

              {/* Barangay */}
              <Text style={[styles.label, { marginBottom: 4 }]}>Barangay</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.barangay && { borderColor: 'red' },
                  { marginBottom: 8 },
                ]}
                placeholder="e.g. Barangay Tungkong Mangga"
                placeholderTextColor="#555"
                maxLength={30}
                value={barangay}
                onChangeText={(text) => {
                  setBarangay(text);
                  if (errors.barangay)
                    setErrors((prev) => ({ ...prev, barangay: undefined }));
                }}
              />
              {errors.barangay && (
                <Text style={styles.errorText}>{errors.barangay}</Text>
              )}

              {/* City / Province */}
              <Text style={[styles.label, { marginBottom: 4 }]}>City / Province</Text>
              <TextInput
                style={[
                  styles.input,
                ]}
                placeholder="e.g. Manila"
                placeholderTextColor="#555"
                value={cityProvince}
                readOnly
                onChangeText={(text) => {
                  setCityProvince(text);
                }}
              />

              {/* Zip Code */}
              <Text style={[styles.label, { marginBottom: 4 }]}>Zip Code</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.zipCode && { borderColor: 'red' },
                  { marginBottom: 8 },
                ]}
                placeholder="e.g. 3023 or 3024"
                placeholderTextColor="#555"
                keyboardType="numeric"
                maxLength={4}
                value={zipCode}
                onChangeText={(text) => {
                  const digitsOnly = text.replace(/[^0-9]/g, '');
                  setZipCode(digitsOnly);
                  if (errors.zipCode)
                    setErrors((prev) => ({ ...prev, zipCode: undefined }));
                }}
              />
              {errors.zipCode && (
                <Text style={styles.errorText}>{errors.zipCode}</Text>
              )}

              {/* You can optionally show combined address here for user confirmation */}
              <Text style={{ marginTop: 10, fontStyle: 'italic', color: '#333' }}>
                Full Address: {address}
              </Text>
            </View>
          </View>

          {/* Password Setup Section */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ ...styles.sectionHeader }}>Set Password</Text>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, marginBottom: 0 },
                  errors.password && { borderColor: 'red' },
                ]}
                placeholder="Password"
                placeholderTextColor="#555"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, marginBottom: 0 },
                  errors.confirmPassword && { borderColor: 'red' },
                ]}
                placeholder="Confirm Password"
                placeholderTextColor="#555"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={{ ...styles.errorText, marginBottom: 20 }}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Terms Modal */}
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
                  padding: 20,
                  width: isMobile ? '80%' : '35%',
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    marginBottom: 15,
                    textAlign: 'center',
                    color: '#004d33',
                  }}
                >
                  Terms of Use
                </Text>

                <ScrollView style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 15, lineHeight: 22 }}>{termsText}</Text>
                </ScrollView>

                {/* Checkbox */}
                <TouchableOpacity
                  onPress={() => setTermsAccepted((prev) => !prev)}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
                >
                  <View
                    style={{
                      height: 22,
                      width: 22,
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: '#888',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                      backgroundColor: termsAccepted ? '#4CAF50' : '#fff',
                    }}
                  >
                    {termsAccepted && <View style={{ width: 12, height: 12, backgroundColor: '#fff' }} />}
                  </View>
                  <Text style={{ fontSize: 16 }}>I agree to the terms of use</Text>
                </TouchableOpacity>

                {/* Modal Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 6,
                      marginRight: 10,
                      alignItems: 'center',
                      backgroundColor: '#b32020ff',
                      justifyContent: 'center',
                      padding: isMobile ? 8 : null,
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
                      }
                      setModalVisible(false);
                    }}
                    disabled={!termsAccepted}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 6,
                      marginLeft: 10,
                      alignItems: 'center',
                      backgroundColor: termsAccepted ? '#4CAF50' : '#ccc',
                      justifyContent: 'center',
                      padding: isMobile ? 8 : null,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                      Accept Terms and Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>

        {/* Action Button */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 20,
            backgroundColor: '#fff',
            borderRadius: 16,
          }}
        >
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 16,
    color: '#1f5474ff',
    marginTop: 6,
    marginBottom: 5,
    fontStyle: 'italic',
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
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginTop: 50,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00505cff',
    alignSelf: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00505cff',   // matching the title's greenish tone
    marginBottom: -5,
    borderBottomColor: '#00505cff',
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
});
