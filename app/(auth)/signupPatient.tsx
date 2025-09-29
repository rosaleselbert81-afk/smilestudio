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

interface Errors {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  birthdate?: string;
  gender?: string;
  // Add more fields here if you have more inputs to validate
}

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
  const [errors, setErrors] = useState<Errors>({});


const validateForm = () => {
  const newErrors: Errors = {};

  if (!firstName.trim()) {
    newErrors.firstName = "First name is required";
  }

  if (!lastName.trim()) {
    newErrors.lastName = "Last name is required";
  }

  if (!mobileNumber.trim()) {
    newErrors.mobileNumber = "Mobile number is required";
  } else if (!/^09\d{9}$/.test(mobileNumber)) {
    newErrors.mobileNumber = "Mobile number must be exactly 11 digits and start with 09";
  }

  if (!email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    newErrors.email = "Invalid email format";
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

  // Optional validations:

  if (!birthdate) {
    newErrors.birthdate = "Birthdate is required";
  }

  if (!gender.trim()) {
    newErrors.gender = "Gender is required";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


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
  // Run your validateForm, which sets errors state
  const isValid = validateForm();
  
  if (!isValid) {
    setModalVisible(false);
    return;
  }

  // Additional password confirm check (optional if in validateForm already)
  if (password !== confirmPassword) {
    setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
    return;
  }

  try {
    await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      gender,
      birthdate: birthdate ? birthdate.toISOString().split('T')[0] : '',
      photo_url: photo || undefined,
      mobile_number: mobileNumber,
    });

    alert("Patient account created. Please verify your email. If you did not receive a verification, try to use other email.");
    setModalVisible(false);
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
    <LinearGradient colors={['#80c4c4ff', '#009b84ff']} style={styles.container}>
      <View style={styles.container}>
    <View
      style={{
        ...styles.formBox,
        width: isMobile ? 360 : 900,  // increased width on web
        height: isMobile ? 650 : 740,
        padding: 40,
      }}
    >
  <ScrollView style={{ flex: 1 }} automaticallyAdjustKeyboardInsets>
    {/* Form Title */}
    <TouchableOpacity
      onPress={() => router.push('/login')}
      style={{ position: 'absolute', top: 10, left: 0, zIndex: 10}}
    >
      <Ionicons name="arrow-back" size={36} color='#00505cff'/>
    </TouchableOpacity>
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
    <Text style={{...styles.sectionHeader, fontSize: 21, borderBottomWidth: 2, marginTop: 32, marginBottom: 36}}>PATIENT SIGN UP</Text>

    <View
      style={{
        flexDirection: isMobile ? 'column' : 'row', // row ONLY on web
        justifyContent: 'space-between',
        marginBottom: 20,
      }}
    >
      {/* Personal Information Section */}
      <View style={{ flex: 1, marginRight: isMobile ? 0 : 10, marginBottom: isMobile ? 15 : 0 }}>
        <Text style={styles.sectionHeader}>Personal Information</Text>

        {/* First Name */}
        <Text style={[styles.label, { marginBottom: 4 }]}>First Name</Text>
        <TextInput
          style={[styles.input, errors.firstName && { borderColor: 'red' }, { marginBottom: 8 }]}
          placeholder="e.g. Juan"
          maxLength={20}
          placeholderTextColor="#555"
          value={firstName}
          onChangeText={text => {
            setFirstName(text);
            if (errors.firstName) setErrors(prev => ({ ...prev, firstName: undefined }));
          }}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

        {/* Last Name */}
        <Text style={[styles.label, { marginBottom: 4 }]}>Last Name</Text>
        <TextInput
          style={[styles.input, errors.lastName && { borderColor: 'red' }, { marginBottom: 8 }]}
          placeholder="e.g. Dela Cruz"
          maxLength={20}
          placeholderTextColor="#555"
          value={lastName}
          onChangeText={text => {
            setLastName(text);
            if (errors.lastName) setErrors(prev => ({ ...prev, lastName: undefined }));
          }}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

        {/* Gender */}
        <Text style={[styles.label, { marginBottom: 4 }]}>Gender</Text>
        <View
          style={[
            styles.pickerContainer,
            errors.gender && { borderColor: 'red', borderWidth: 1 },
            { marginBottom: 8 },
          ]}
        >
          <Picker
            selectedValue={gender}
            style={{ height: isMobile ? (Platform.OS === 'ios' ? 230 : 50) : 45, color: 'black' }}
            itemStyle={{ color: 'black', fontSize: 16 }}
            onValueChange={(itemValue) => {
              setGender(itemValue);
              if (errors.gender) setErrors(prev => ({ ...prev, gender: undefined }));
            }}
          >
            <Picker.Item label="- Choose a Gender -" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

        {/* Birthdate */}
        <Text style={[styles.label, { marginBottom: 4 }]}>Birthdate</Text>
        <View
          style={[
            { height: 50, borderRadius: 8, justifyContent: 'center', marginBottom: 8 },
            errors.birthdate && { borderColor: 'red', borderWidth: 1, height: 47},
          ]}
        >
          <BirthdatePicker
            value={birthdate}
            onChange={(date) => {
              setBirthdate(date);
              if (errors.birthdate) setErrors(prev => ({ ...prev, birthdate: undefined }));
            }}
          />
        </View>
        {errors.birthdate && <Text style={styles.errorText}>{errors.birthdate}</Text>}
      </View>

      {/* Contact Information Section */}
      <View style={{ flex: 1, marginLeft: isMobile ? 0 : 10 }}>
        <Text style={styles.sectionHeader}>Contact Information</Text>

        {/* Mobile Number */}
        <Text style={[styles.label, { marginBottom: 4 }]}>Mobile Number</Text>
        <TextInput
          style={[styles.input, errors.mobileNumber && { borderColor: 'red' }, { marginBottom: 8 }]}
          placeholder="e.g. 09123456789"
          placeholderTextColor="#555"
          value={mobileNumber}
          keyboardType="phone-pad"
          maxLength={11}
          autoComplete="tel"
          onChangeText={(text) => {
            const digitsOnly = text.replace(/[^0-9]/g, '');
            setMobileNumber(digitsOnly);
            if (errors.mobileNumber) setErrors(prev => ({ ...prev, mobileNumber: undefined }));
          }}
        />
        {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

        {/* Email */}
        <Text style={[styles.label, { marginBottom: 4 }]}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && { borderColor: 'red' }, { marginBottom: 8 }]}
          placeholder="e.g. JuanDelaCruz@gmail.com"
          placeholderTextColor="#555"
          maxLength={40}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
    </View>

    {/* === Password Setup Section === */}
    <View style={{ marginBottom: 30}}>
      <Text style={{ ...styles.sectionHeader}}>Set Password</Text>

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }, errors.password && { borderColor: 'red' }]}
          placeholder="Password"
          placeholderTextColor="#555"
          secureTextEntry={!showPassword}
          maxLength={20}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
          }}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#555" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Confirm Password */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }, errors.confirmPassword && { borderColor: 'red' }]}
          placeholder="Confirm Password"
          placeholderTextColor="#555"
          secureTextEntry={!showConfirmPassword}
          maxLength={20}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
          }}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#555" />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={{...styles.errorText, marginBottom: 20}}>{errors.confirmPassword}</Text>}
    </View>

    {/* === Terms Modal === */}
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
                  handleSignup();
                }
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
    {/* === Action Buttons === */}
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
    fontSize: 16,
    color: '#1f5474ff',
    marginTop: 6,
    marginBottom: 5,
    fontStyle: 'italic',
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
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
});
