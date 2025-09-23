import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  useWindowDimensions,
  Modal,
  Platform,
} from 'react-native';
import BirthdatePicker from './birthdayPicker';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../lib/SessionContext';

export default function SignupScreen() {
  const { signUp } = useSession();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 480;

  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName ||
      !gender ||
      !birthdate ||
      !mobileNumber
    ) {
      alert('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        gender,
        birthdate: birthdate.toISOString().split('T')[0], // convert to YYYY-MM-DD
        photo_url: photo || undefined,
        mobile_number: mobileNumber,
      });

      alert('Account created! Please check your email to verify.');
      router.push('/login');
    } catch (err: any) {
      alert(err.message || 'Sign-up failed.');
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
        <View style={{ ...styles.formBox, width: isMobile ? 350 : 600, height: isMobile ? 600 : 720 }}>
          <ScrollView style={{ flex: 1 }} automaticallyAdjustKeyboardInsets>
            <Text style={styles.title}>(PATIENT)</Text>

            {/* First Name */}
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. Juan"
              placeholderTextColor="#555"
              value={firstName}
              onChangeText={setFirstName}
            />

            {/* Last Name */}
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. Dela Cruz"
              placeholderTextColor="#555"
              value={lastName}
              onChangeText={setLastName}
            />

            {/* Mobile Number */}
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. 09123456789"
              placeholderTextColor="#555"
              value={mobileNumber}
              keyboardType="phone-pad"
              maxLength={11}
              autoComplete="tel"
              onChangeText={(text) => {
                const digitsOnly = text.replace(/[^0-9]/g, '');
                setMobileNumber(digitsOnly);
              }}
            />

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. JuanDelaCruz@gmail.com"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
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

            {/* Gender */}
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                style={{ height: isMobile ? (Platform.OS === 'ios' ? 230 : 50) : 40, color: 'black', borderColor: '#ccc' }}
                itemStyle={{ color: 'black', fontSize: 16 }}
                onValueChange={(itemValue) => setGender(itemValue)}
              >
                <Picker.Item label="- Choose a Gender -" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
              </Picker>
            </View>

            {/* Birthdate */}
            <Text style={styles.label}>Birthdate</Text>
            <View style={{ height: 50, justifyContent: 'center' }}>
              <BirthdatePicker value={birthdate} onChange={setBirthdate} />
            </View>

            {/* Profile Photo
            <Text style={styles.label}>Profile Photo</Text>
            <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <Text style={{ color: '#777' }}>Tap to select a photo</Text>
              )}
            </TouchableOpacity> */}

            {/* Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                style={{ ...styles.button, backgroundColor: '#b32020ff' }}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.buttonText}>BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'rgba(16, 82, 51, 1)' }]}
                onPress={() => setModalVisible(true)}
              >
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
                            handleSignup();
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
                          Accept Terms and SignUp
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  formBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    height: 600,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
  label: {
    marginLeft: 4,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f5474ff',
    marginTop: 6,
    marginBottom: 5,
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
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 3.5,
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
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
