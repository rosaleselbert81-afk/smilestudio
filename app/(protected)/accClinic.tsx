import { useSession } from "@/lib/SessionContext";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { Calendar, Agenda } from "react-native-calendars";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import MapPickerView from "../view/MapPickerView";
import WeekScheduleEditor from "../view/WeekScheduleEditor";
import DayScheduleView from "../view/DayScheduleView";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import ChatView from "../view/ChatView";
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import * as Sharing from 'expo-sharing';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { WeeklySchedule } from '../../lib/types';
import DentistScheduleEditor from '../view/DentistScheduleEditor';
import Feather from '@expo/vector-icons/Feather';


type Appointment = {
  id: string;
  created_at: string;
  clinic_id: string;
  patient_id: string;
  date_time: string;
  message: string;
  clinic_profiles: {
    clinic_name: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
  isAccepted: boolean | null;
  rejection_note: string;
  request: string;
};

type Dentist = {
  id: string;
  name: string;
  weeklySchedule?: {
    [day: string]: string[];
  };
};

export default function Account() {
  const { session, isLoading, signOut } = useSession();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [clinicName, setClinicName] = useState("");
  const [mobileNum, setMobileNum] = useState("");
  const [adress, setAdress] = useState("");
  const [clinicPho, setClinicPho] = useState("");
  const [licensePho, setLicensePho] = useState("");
  const [clinicId, setClinicId] = useState<string>();

  const [viewFirst, setviewFirst] = useState(true);
  const [viewFirstShow, setviewFirstShow] = useState(true);
  const [viewClinic, setviewClinic] = useState(false);

  const [selectedSunday, setSelectedSunday] = useState("");
  const [selectedMonday, setSelectedMonday] = useState("");
  const [selectedTuesday, setSelectedTuesday] = useState("");
  const [selectedWednesday, setSelectedWednesday] = useState("");
  const [selectedThursday, setSelectedThursday] = useState("");
  const [selectedFriday, setSelectedFriday] = useState("");
  const [selectedSaturday, setSelectedSaturday] = useState("");

  const [selectedClinicName, setSelectedClinicName] = useState("");
  const [selectedClinicEmail, setSelectedClinicEmail] = useState("");
  const [selectedClinicSlogan, setSelectedClinicSlogan] = useState("");
  const [selectedClinicAddress, setSelectedClinicAddress] = useState("");
  const [selectedClinicMobile, setSelectedClinicMobile] = useState("");
  const [selectedClinicCreatedAt, setSelectedClinicCreatedAt] = useState("");
  const [selectedClinicRole, setSelectedClinicRole] = useState("");
  const [selectedClinicDentist, setSelectedClinicDentist] = useState(false);
  const [selectedClinicImage, setSelectedClinicImage] = useState();
  const [termsOfUse, setTermsOfUse] = useState(false);
  const [selectedCI, setSelectedCI] = useState("");
  const [selectedOffers, setSelectedOffers] = useState("");
  const [appointmentsToday, setAppointmentsToday] = useState<Appointment[]>([]);

  const [moved, setMoved] = useState(false);
  const [mobilemoved, mobilesetMoved] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [clinicCount, setClinicCount] = useState<number | null>(null);
  const { width, height } = useWindowDimensions();
  const isMobile = width < 480;
  const isTablet = width >= 480 && width < 768;
  const isDesktop = width >= 768;
  const drawerWidth = isMobile ? 370 : isTablet ? 300 : 350;

  const offset = moved ? -320 : 0;
  const moboffset = moved ? -370 : 0;
  const mobbutoffset = moved ? -305 : 0;

  const [fullProfile, setFullProfile] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSignout, setModalSignout] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [modalMap, setModalMap] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);

  const [profileInfoVisible, setProfileInfoVisible] = useState(false);

  // State for profileInfo modal
  const [dentistAvailability, setDentistAvailability] = useState(false);
  const [clinicIntroduction, setClinicIntroduction] = useState("");
  const [offers, setOffers] = useState("");

  const [dashboardView, setDashboardView] = useState("profile");
  // State for the verification photo
  const [verifyPhoto, setVerifyPhoto] = useState<string | { uri: string; file: File } | null>(null);
  // New state for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const [clinicList, setClinicList] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>();
  const [messageToClinic, setMessageToClinic] = useState<string>();
  const [modalMessage, setModalMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [denialReason, setDenialReason] = useState<string>();

  const [appointmentsList, setAppointmentList] = useState<Appointment[]>();
  const [appointmentsCurrentList, setAppointmentCurrentList] =
    useState<Appointment[]>();
  const [appointmentsPast, setAppointmentPast] = useState<Appointment[]>();

  const [mapView, setMapView] = useState<[number | undefined, number| undefined]>([undefined,undefined]);

  const [showMapPickerModal, setShowMapPicketModal] = useState(false);

  const [rejectAppointmentId, setRejectAppointmentID] = useState<string>();
  const [rejectMsg, setRejectMsg] = useState<string>();

  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);
  const [requestVerification, setRequestVerification] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [tMap, setTMap] = useState(false);
  const [warn, setWarn] = useState(false);
  const [ban, setBan] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string>();
  const [offerList, setOfferList] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [isAttended, setIsAttended] = useState(false);
  const [emptyOfferWarningVisible, setEmptyOfferWarningVisible] = useState(false);
  const [needDTIModal, setNeedDTIModal] = useState(false);
  const [newOfferText, setNewOfferText] = useState('');
  const [limitReachedModalVisible, setLimitReachedModalVisible] = useState(false);
  const [offerToRemoveIndex, setOfferToRemoveIndex] = useState<number | null>(null);
  const [removeConfirmModalVisible, setRemoveConfirmModalVisible] = useState(false);
  const [resetConfirmModalVisible, setResetConfirmModalVisible] = useState(false);
const [dentists, setDentists] = useState<string>(''); // for the stored dentists string from DB
const [dentistList, setDentistList] = useState<Dentist[]>([]);
const [newDentistName, setNewDentistName] = useState('');
const [newSpecialization, setNewSpecialization] = useState('');
const [dentistToRemoveIndex, setDentistToRemoveIndex] = useState<number | null>(null);

// Modal visibility states
const [limitReachedDentistModalVisible, setLimitReachedDentistModalVisible] = useState(false);
const [removeDentistConfirmModalVisible, setRemoveDentistConfirmModalVisible] = useState(false);
const [resetDentistConfirmModalVisible, setResetDentistConfirmModalVisible] = useState(false);
const [emptyDentistWarningModalVisible, setEmptyDentistWarningModalVisible] = useState(false);
const [duplicateDentistModalVisible, setDuplicateDentistModalVisible] = useState(false);

const [scheduleEditorVisible, setScheduleEditorVisible] = useState(false);
const [editingDentistIndex, setEditingDentistIndex] = useState<number | null>(null);
const [editingSchedule, setEditingSchedule] = useState<any>(null);
const defaultWeeklySchedule = {
  // depends on your actual schedule structure
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

  // State to open schedule editor immediately after add:
  const [openScheduleForIndex, setOpenScheduleForIndex] = useState<number | null>(null);
  const [requestViewVisible, setRequestViewVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState([]);

  const openRequestView = (requestStr) => {
    try {
      const parsed = JSON.parse(requestStr);
      setSelectedRequest(parsed);
    } catch {
      setSelectedRequest([requestStr]); // fallback to raw string if JSON parsing fails
    }
    setRequestViewVisible(true);
  };

function openScheduleEditor(dentist, index) {
  setEditingDentistIndex(index);
  // If dentist.weeklySchedule exists, use it; else initialize empty schedule
  setEditingSchedule(dentist.weeklySchedule || {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  setScheduleEditorVisible(true);
}

function closeScheduleEditor() {
  setScheduleEditorVisible(false);
  setEditingDentistIndex(null);
  setEditingSchedule(null);
}

function saveSchedule() {
  if (editingDentistIndex === null) return;

  // Update the schedule of the selected dentist
  const updatedList = [...dentistList];
  updatedList[editingDentistIndex] = {
    ...updatedList[editingDentistIndex],
    weeklySchedule: editingSchedule,
  };
  saveDentists(updatedList);
  closeScheduleEditor();
}

  // Load dentists from DB on mount or session change
  useEffect(() => {
    async function fetchDentists() {
      if (!session?.user) return;
      try {
        const { data, error } = await supabase
          .from('clinic_profiles')
          .select('dentists')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        if (data?.dentists) {
          const parsed = JSON.parse(data.dentists);
          setDentists(data.dentists);
          const fixedDentists = parsed.map((d: any) => ({
            ...d,
            weeklySchedule: d.weeklySchedule || {
              Monday: [],
              Tuesday: [],
              Wednesday: [],
              Thursday: [],
              Friday: [],
              Saturday: [],
              Sunday: [],
            },
          }));
          setDentistList(fixedDentists);
        }else {
          setDentists('');
          setDentistList([]);
        }
      } catch (err) {
        console.error('Failed to fetch dentists:', err.message);
      }
    }
    fetchDentists();
  }, [session, supabase]);

  // Save dentists to DB helper
async function saveDentists(updatedList) {
  try {
    if (!session?.user) throw new Error('User not authenticated');

    const combined = JSON.stringify(updatedList);

    // Save JSON string to DB
    const { error } = await supabase
      .from('clinic_profiles')
      .update({ dentists: combined })
      .eq('id', session.user.id);

    if (error) throw error;

    // Update local state with parsed list (not JSON string)
    setDentistList(updatedList);
    setDentists(updatedList); // or just one of these, depending on your state management

    Alert.alert('Success', 'Dentists saved successfully.');
  } catch (err) {
    console.error('Failed to save dentists:', err.message);
    Alert.alert('Error', err.message || 'Could not save dentists.');
  }
}



  // Remove dentist handler (confirmed)
  const confirmRemoveDentist = () => {
    if (dentistToRemoveIndex === null) return;
    const updatedList = dentistList.filter((_, i) => i !== dentistToRemoveIndex);
    saveDentists(updatedList);
    setDentistToRemoveIndex(null);
    setRemoveDentistConfirmModalVisible(false);
  };

  // Reset dentists handler (confirmed)
  const confirmResetDentists = () => {
    saveDentists([]);
    setResetDentistConfirmModalVisible(false);
  };

  
const addDentist = () => {
  if (!newDentistName.trim()) {
    alert("Please enter dentist name");
    return;
  }
  const newDentist = {
    name: newDentistName.trim(),
    specialty: newSpecialization.trim() || "General Dentist",
    weeklySchedule: defaultWeeklySchedule,
  };

  setDentistList((prev) => {
    const updatedList = [...prev, newDentist];
    setOpenScheduleForIndex(updatedList.length - 1);  // open scheduler for the new dentist index
    return updatedList;
  });

  setNewDentistName("");
  setNewSpecialization("");
};

console.log("Account render: openScheduleForIndex =", openScheduleForIndex, "dentistList length =", dentistList.length);




useEffect(() => {
  async function fetchOffers() {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('clinic_profiles')
        .select('offers')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      const offersString = data?.offers || '';
      setOffers(offersString);
      // Parse offers string into array for easier manipulation
      const offerArray = offersString
        ? offersString.split('?').filter(o => o.trim() !== '')
        : [];
      setOfferList(offerArray);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  }
  
  fetchOffers();
}, [session]);

const handleResetOffers = async () => {
  try {
    if (!session?.user) throw new Error("User not authenticated");

    // Clear offers locally
    setOfferList([]);
    setOffers("");
    setResetConfirmModalVisible(false);

    // Update database
    const { error } = await supabase
      .from("clinic_profiles")
      .update({ offers: "" })
      .eq("id", session.user.id);

    if (error) throw error;

    Alert.alert("Success", "All offers have been reset.");
  } catch (err: any) {
    console.error(err);
    Alert.alert("Error", err.message || "Failed to reset offers.");
  }
};


  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
      *,
      clinic_profiles (
        clinic_name
      ),
      profiles (
        first_name,
        last_name
      )
    `
      )
      .eq("clinic_id", session?.user.id)
      .is("isAccepted", null)
      .or("rejection_note.is.null,rejection_note.eq.''")
      .order("created_at", { ascending: false }); // 👈 DESCENDING

    if (error) {
      console.error("Error fetching appointments:", error.message);
      return [];
    }

    console.log("Appointments with names:", data);
    setAppointmentList(data);

    // Refresh Current and Past list
    fetchAppointmentsCurrent();
    fetchAppointmentsPast();
    fetchAppointmentsToday();
    return data;
  };

  const fetchAppointmentsCurrent = async () => {
    const nowUTC = new Date();

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        clinic_profiles (
          clinic_name
        ),
        profiles (
          first_name,
          last_name
        )
      `
      )
      .eq("clinic_id", session?.user.id)
      .eq("isAccepted", true)
      .gt("date_time", nowUTC.toISOString())
      .order("date_time", { ascending: true }); // 👈 DESCENDING

    if (error) {
      console.error("Error fetching appointments:", error.message);
      return [];
    }

    console.log("Appointments with names:", data);
    setAppointmentCurrentList(data);
    return data;
  };

const fetchAppointmentsToday = async () => {
  const startOfDayUTC = new Date();
  startOfDayUTC.setUTCHours(0, 0, 0, 0);

  const endOfDayUTC = new Date();
  endOfDayUTC.setUTCHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      clinic_profiles (
        clinic_name
      ),
      profiles (
        first_name,
        last_name
      )
    `
    )
    .eq("clinic_id", session?.user.id)
    .eq("isAccepted", true)
    .gte("date_time", startOfDayUTC.toISOString())
    .lte("date_time", endOfDayUTC.toISOString())
    .order("date_time", { ascending: true });

  if (error) {
    console.error("Error fetching today's appointments:", error.message);
    return [];
  }

  console.log("Today's appointments:", data);
  return data;
};

useEffect(() => {
  const loadAppointments = async () => {
    const todayAppointments = await fetchAppointmentsToday();
    setAppointmentsToday(todayAppointments);
  };

  loadAppointments();

  // Calculate time until next midnight (in ms)
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0); // Set to next midnight
  const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

  const midnightTimeout = setTimeout(() => {
    setAppointmentsToday([]); // Reset state at midnight

    // Optional: Fetch new day's appointments immediately after midnight
    loadAppointments();

    // Optional: setInterval to repeat daily if component stays mounted
    // Or re-run this useEffect if date context changes
  }, timeUntilMidnight);

  return () => clearTimeout(midnightTimeout); // Cleanup on unmount
}, []);




  const fetchAppointmentsPast = async () => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
      *,
      clinic_profiles (
        clinic_name
      ),
      profiles (
        first_name,
        last_name
      )
    `
      )
      .eq("clinic_id", session?.user.id)
      .or(`isAccepted.eq.false,date_time.lt.${now}`)
      .order("created_at", { ascending: false }); // 👈 DESCENDING

    if (error) {
      console.error("Error fetching appointments:", error.message);
      return [];
    }

    console.log("Appointments with names:", data);
    setAppointmentPast(data);
    return data;
  };

const acceptAppointment = async (appointmentId: string) => {
  const { error } = await supabase
    .from("appointments")
    .update({ isAccepted: true })
    .eq("id", appointmentId);

  if (error) {
    console.error("Error accepting appointment:", error.message); // See error
    Alert.alert("Error", error.message);
  }
};

const rejectAppointment = async (
  appointmentId: string,
  rejectionMsg: string
) => {
  const { error } = await supabase
    .from("appointments")
    .update({
      isAccepted: false,
      rejection_note: rejectionMsg,
    })
    .eq("id", appointmentId);

  if (error) {
    console.error("Error rejecting appointment:", error.message); // See error
    Alert.alert("Error", error.message);
  }
};

const attendedAppointment = async (appointmentId: string) => {
  const { error } = await supabase
    .from("appointments")
    .update({ isAttended: true }) // ✅ CORRECTED
    .eq("id", appointmentId);

  if (error) {
    console.error("Error marking as attended:", error.message);
    Alert.alert("Error", error.message);
  } else {
    // OPTIONAL: Refresh the appointments list if needed
    // await fetchAppointments();
  }
};

const notAttendedAppointment = async (appointmentId: string) => {
  const { error } = await supabase
    .from("appointments")
    .update({ isAttended: false })
    .eq("id", appointmentId);

  if (error) {
    console.error("Error marking as not attended:", error.message);
    Alert.alert("Error", error.message);
  } else {
    // OPTIONAL: Refresh the appointments list if needed
    // await fetchAppointments();
  }
};

  useEffect(() => {
    async function fetchClinics() {
      try {
        const { data, error } = await supabase
          .from("clinic_profiles")
          .select("*, clinic_schedule(*)");

        if (error) throw error;
        setClinicList(data || []);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      }
    }

    fetchClinics();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
      getProfile();
      getClinic();
    }, [])
  );

  useEffect(() => {
  if (!session?.user?.id) return;

  // Subscribe to all changes on appointments for this clinic
  const subscription = supabase
    .channel('public:appointments')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `clinic_id=eq.${session.user.id}`,
      },
      (payload) => {
        console.log('Realtime appointment change:', payload);

        // Re-fetch all appointment lists on any change
        fetchAppointments();
        fetchAppointmentsCurrent();
        fetchAppointmentsPast();
        fetchAppointmentsToday().then(setAppointmentsToday);;
      }
    )
    .subscribe();

  // Clean up subscription on unmount
  return () => {
    supabase.removeChannel(subscription);
  };
}, [session?.user?.id]);


  useEffect(() => {
    async function loadUserCount() {
      try {
        const { count, error } = await supabase
          .from("profiles") // or 'auth.users' if you have access
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        setUserCount(count ?? 0);
      } catch (error) {
        console.error("Failed to fetch user count:", error);
      }
    }
    loadUserCount();
  }, []);

  useEffect(() => {
    async function loadClinicCount() {
      try {
        const { count, error } = await supabase
          .from("clinic_profiles")
          .select("*", { count: "exact", head: true });

        if (error) throw error;
        setClinicCount(count ?? 0);
      } catch (error) {
        console.error("Failed to fetch clinic count:", error);
      }
    }

    loadClinicCount();
  }, []);

async function getProfile() {
  try {
    setLoading(true);
    if (!session?.user) throw new Error("No user on the session!");

    // Check if profile exists
    const { data, error, status } = await supabase
      .from("profiles")
      .select("id, username, website, avatar_url, isFirst")
      .eq("id", session.user.id)
      .single();

    if (error && status !== 406) throw error;

    // Insert if profile does not exist
    if (!data) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([{ id: session.user.id }]);
      if (insertError) throw insertError;
    }

    // Update clinic_profiles email as before
    const { error: updateError } = await supabase
      .from("clinic_profiles")
      .update({ email: session.user.email })
      .eq("id", session.user.id);

    if (updateError) throw updateError;

    if (data) {
      setUsername(data.username);
      setWebsite(data.website);
      setAvatarUrl(data.avatar_url);
      setviewFirstShow(data.isFirst);

    }
  } catch (error) {
    if (error instanceof Error) Alert.alert(error.message);
  } finally {
    setLoading(false);
  }
}


  async function getClinic() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("clinic_profiles")
        .select(
          `clinic_name, mobile_number, address, clinic_photo_url, license_photo_url, isDentistAvailable, introduction, offers, request_verification, isVerified, denied_verification_reason, isWarn, isBan, notif_message`
        )
        .eq("id", session?.user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setClinicName(data.clinic_name);
        setMobileNum(data.mobile_number);
        setAdress(data.address);
        setClinicPho(data.clinic_photo_url);
        setLicensePho(data.license_photo_url);
        setDentistAvailability(data.isDentistAvailable ?? false);
        setClinicIntroduction(data.introduction ?? "");
        setOffers(data.offers ?? "");
        setRequestVerification(data.request_verification ?? false);
        setVerified(data.isVerified ?? false);
        setDenialReason(data.denied_verification_reason ?? "");
        setNotifMessage(data.notif_message ?? "");
        if (data.isWarn !== warn) {
          setWarn(true);
        }
        if (data.isBan !== ban) {
          setBan(true);
        }
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handlePickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "We need access to your photos to set a profile picture."
      );
      return;
    }

    // Launch picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // crop to square
      quality: 1,
    });

    // If not cancelled
    if (!result.canceled && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      const uri = selectedAsset.uri;

      // 👇 Set avatar to display it
      setAvatarUrl(uri);

      // OPTIONAL: Upload to Supabase or your backend here
    }
  };

  const saveClinicLocation = async (long: number, lat: number) => {
    try {
      const { error: updateError } = await supabase
        .from("clinic_profiles")
        .update({ longitude: long, latitude: lat }) // 👈 changed here
        .eq("id", session?.user.id);

      if (!updateError) {
        Alert.alert("Clinic Location has been saved");
      }
    } catch (err) {
      console.log(`ERR Save Clinic Location : ${err}`);
    }
  };

  async function updateProfile({
    website,
    avatar_url,
  }: {
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error: updateError } = await supabase
        .from("clinic_profiles")
        .update({ bio: website }) // 👈 changed here
        .eq("id", session.user.id); 

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || loading) {
    return <Text>Loading...</Text>;
  }

  const handleUploadAvatar = async (file: File | Blob | string) => {
    try {
      if (!session) throw new Error("No session available");

      // 1️⃣ Detect file extension
      let fileExt = "png";
      if (typeof file === "string") {
        const match = file.match(/^data:(image\/\w+);/);
        fileExt = match ? match[1].split("/")[1] : "png";
      } else if (file instanceof File) {
        fileExt = file.name.split(".").pop() ?? "png";
      } else if (file instanceof Blob && file.type) {
        fileExt = file.type.split("/")[1] ?? "png";
      }

      // 2️⃣ Normalize to Blob
      let fileData: Blob;
      if (typeof file === "string") {
        const base64 = file.split(",")[1];
        const byteChars = atob(base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileData = new Blob([byteArray], { type: `image/${fileExt}` });
      } else {
        fileData = file;
      }

      // 3️⃣ Create unique path
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // 4️⃣ Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileData, { upsert: true });

      if (uploadError) throw uploadError;

      // 5️⃣ Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error("Failed to get public URL");

      // 6️⃣ Update clinic_profiles.clinic_photo_url
      const { error: clinicUpdateError } = await supabase
        .from("clinic_profiles")
        .update({ clinic_photo_url: publicUrl })
        .eq("id", session.user.id);

      if (clinicUpdateError) throw clinicUpdateError;

      // 6️⃣ Update profiles.avatar_url
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (profileUpdateError) throw profileUpdateError;

      // 7️⃣ Update state
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error("Upload failed:", err.message);
    }
  };

  const pickImageMobile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      // 🔑 Read file as base64
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 → Uint8Array
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // Guess file extension from uri (png/jpg/jpeg/webp)
      const fileExt = asset.uri.split(".").pop() || "jpg";

      // Create unique file name
      const fileName = `${session!.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${session!.user.id}/${fileName}`;

      // ✅ Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, byteArray, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return;
      }

      // Get Public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      // Save to DB
      await supabase
        .from("clinic_profiles")
        .update({ clinic_photo_url: publicUrl })
        .eq("id", session!.user.id);

      setAvatarUrl(publicUrl);
    }
  };

  const pickImageWeb = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        // ✅ Upload to Supabase
        await handleUploadAvatar(file);
      }
    };
    input.click();
  };

  const wrapText = (text: string, limit = 40) => {
    if (!text) return "No message available";

    const words = text.split(" ");

    // ✅ special case: only one word and it's too long
    if (words.length === 1 && words[0].length > 30) {
      return words[0].substring(0, 40) + "...";
    }

    let lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + word).length <= limit) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word; // start new line
      }
    });

    if (currentLine) lines.push(currentLine);

    return lines.join("\n"); // insert line breaks
  };
  
  const toggleDentistAvailability = () => {
    setDentistAvailability((prev) => !prev);
  };

  const updateProfileInfoModal = async () => {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { error } = await supabase
        .from("clinic_profiles")
        .update({
          isDentistAvailable: dentistAvailability,
          introduction: clinicIntroduction,
          offers: offers,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      Alert.alert("Success", "Profile info updated.");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    }
  };

    const uploadVerificationImage = async (file: File | Blob | string): Promise<string | undefined> => {
        if (!session) throw new Error("No session available");
        // We are using the user's provided code structure but ensuring 
        // it handles a base64 string or a File/Blob, and returns the URL.
        try {
            // 1️⃣ Detect file extension (Simplified for clarity)
            let fileExt = "png";
            if (typeof file === "string") {
                const match = file.match(/^data:(image\/\w+);/);
                fileExt = match ? match[1].split("/")[1] : "png";
            } else if (file instanceof File) {
                fileExt = file.name.split(".").pop() ?? "png";
            } else if (file instanceof Blob && file.type) {
                fileExt = file.type.split("/")[1] ?? "png";
            }

            // 2️⃣ Normalize to Blob if base64 string
            let fileData: Blob;
            if (typeof file === "string") {
                const base64 = file.split(",")[1];
                const byteChars = atob(base64);
                const byteNumbers = new Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteNumbers[i] = byteChars.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                fileData = new Blob([byteArray], { type: `image/${fileExt}` });
            } else {
                fileData = file;
            }

            // 3️⃣ Create unique path in user's folder
            const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${session.user.id}/verification/${fileName}`; // Changed path to a 'verification' sub-folder
            
            // 4️⃣ Upload to Supabase Storage (using 'avatars' bucket as per your code)
            const { error: uploadError } = await supabase.storage
                .from("avatars") 
                .upload(filePath, fileData, { upsert: true });

            if (uploadError) throw uploadError;

            // 5️⃣ Get public URL
            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            const publicUrl = data?.publicUrl;
            if (!publicUrl) throw new Error("Failed to get public URL");

            return publicUrl;
        } catch (err) {
            console.error("Upload failed:", err);
            throw err; // Re-throw to be caught by the calling function
        }
    };

    // MODIFIED pickVerifyPhotoMobile: ONLY updates state, does NOT upload
    const pickVerifyPhotoMobile = async () => {
        // ... permission checks ...
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission denied",
                "We need access to your photos to upload a verification photo."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            // Set the URI to state. The button text will change now.
            setVerifyPhoto(result.assets[0].uri); 
        }
    };

    // MODIFIED pickVerifyPhotoWeb: ONLY updates state, does NOT upload
    const pickVerifyPhotoWeb = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (event: any) => {
            const file = event.target.files?.[0];
            if (file) {
                // Store the file object and a temporary URL for preview/tracking
                const uri = URL.createObjectURL(file);
                setVerifyPhoto({ uri, file });
            }
        };
        input.click();
    };

    // The generic handler remains the same
    const handlePickVerifyPhoto = () => {
        if (Platform.OS === "web") {
            pickVerifyPhotoWeb();
        } else {
            pickVerifyPhotoMobile();
        }
    };


    // 🎯 NEW FUNCTION: Handles the final verification submission and optional upload
    const handleVerificationSubmit = async () => {
        setIsSubmitting(true);
        let publicUrl: string | undefined = undefined;

        try {
            if (verifyPhoto) {
                // 1. Image selected: Prepare data based on platform and upload
                if (Platform.OS === 'web' && typeof verifyPhoto === 'object' && verifyPhoto.file) {
                    // Web: upload the File/Blob object
                    publicUrl = await uploadVerificationImage(verifyPhoto.file);
                } else if (typeof verifyPhoto === 'string') {
                    // Mobile/Other: upload the URI (need to convert to base64/blob)
                    const base64 = await FileSystem.readAsStringAsync(verifyPhoto, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    const fileExt = verifyPhoto.split(".").pop() || "jpg";
                    const dataUrl = `data:image/${fileExt};base64,${base64}`;
                    publicUrl = await uploadVerificationImage(dataUrl);
                }
            }

            // 2. Update clinic_profiles with the new photo URL (if uploaded) and submission status
            const updates = { 
                license_photo_url: publicUrl, // Update to the column you want to use for verification
                // Add a column to track the submission state, e.g., 'verification_submitted: true'
            };

            // Only update the URL if an image was uploaded
            const { error: dbUpdateError } = await supabase
                .from("clinic_profiles")
                .update(updates)
                .eq("id", session!.user.id);
            
            if (dbUpdateError) throw dbUpdateError;

            Alert.alert("Success", publicUrl ? "Verification photo uploaded and submission sent!" : "Verification request sent!");

            // Clear the local photo state after successful submission
            setVerifyPhoto(null);

        } catch (error) {
            console.error("Verification Submission Failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            Alert.alert("Error", `Failed to complete verification submission: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

  const handleConfirmVerify = async () => {
    handleVerificationSubmit();
    setRequestVerification(true);
    setShowVerifyModal(false); // close modal

    const { error } = await supabase
      .from("clinic_profiles")
      .update({ request_verification: true })
      .eq("id", session?.user.id);

    if (error) {
      console.error("Failed to request verification:", error.message);
    }
  };


type Appointment = {
  id: string;
  created_at: string;
  clinic_id: string;
  patient_id: string;
  date_time: string;
  message: string;
  clinic_profiles: { clinic_name: string };
  profiles: { first_name: string; last_name: string };
  isAccepted: boolean | null;
  rejection_note: string;
  isAttended: boolean | null;
  request: string;
};

const base64ArrayBuffer = (arrayBuffer: ArrayBuffer) => {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const a = bytes[i];
    const b = i + 1 < len ? bytes[i + 1] : 0;
    const c = i + 2 < len ? bytes[i + 2] : 0;

    const triplet = (a << 16) | (b << 8) | c;

    base64 += base64Chars[(triplet >> 18) & 0x3f];
    base64 += base64Chars[(triplet >> 12) & 0x3f];
    base64 += i + 1 < len ? base64Chars[(triplet >> 6) & 0x3f] : '=';
    base64 += i + 2 < len ? base64Chars[triplet & 0x3f] : '=';
  }
  return base64;
};

const handleDownloadExcel = async (appointmentsPast: Appointment[]) => {
  if (!appointmentsPast || appointmentsPast.length === 0) {
    Alert.alert('No data to export');
    return;
  }

  const dataToExport = appointmentsPast.map(item => ({
    'Clinic Name': item.clinic_profiles?.clinic_name || '',
    Patient: item.profiles?.last_name || '',
    'Request Date & Time': new Date(item.date_time).toLocaleString(),
    Message: item.message,
    Status: item.isAccepted ? 'Accepted' : 'Rejected',
    'Rejection Note':
      item.isAccepted === false
        ? item.rejection_note || 'No rejection note'
        : '-',
    'Created At': new Date(item.created_at || 0).toLocaleString(),
  }));

  const ws = XLSX.utils.json_to_sheet(dataToExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'History');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  if (Platform.OS === 'web') {
    // dynamically import file-saver only here
    const { saveAs } = await import('file-saver');
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'history.xlsx');
  } else {
    // Mobile (Expo / bare RN)
    try {
      const base64 = base64ArrayBuffer(wbout.buffer || wbout);
      const fileUri = FileSystem.documentDirectory + 'history.xlsx';

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Excel',
        UTI: 'com.microsoft.excel.xlsx',
      });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error exporting file');
    }
  }
};


  return (
    <LinearGradient
      colors={["#ffffffff", "#6ce2ffff"]}
      style={{
        flex: 1,
        justifyContent: "center",
        flexDirection: isMobile ? "column" : "row",
        width: isMobile ? "100%" : isTablet ? "100%" : "100%",
        position: "relative",
      }}
    >
      {viewFirstShow && (
        <Modal
          visible={viewFirst}
          transparent
          animationType="fade"
          onRequestClose={() => setviewFirst(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <View
              style={{
                width: isMobile ? '90%' : '40%',
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 20,
                  alignSelf: "center",
                  color: "#003f30ff",
                }}
              >
                Hello! Welcome to Smile Studio!
              </Text>
              <FontAwesome5 name="user-edit" size={isMobile ? 75 : 150} color="#bdbdbdff" />
              <Text
                style={{
                  fontSize: 16,
                  alignSelf: "center",
                  color: "#bdbdbdff",
                }}
              >
                Wanna edit/setup your information? let me guide you!
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  alignSelf: "center",
                  color: "#bdbdbdff",
                }}
              >
                You can pin your location in our map!
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 20,
                  alignSelf: "center",
                  color:"#bdbdbdff",
                }}
              >
                Verify your clinic to access schedule and pin map.
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  width: '48%',
                  gap: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: '#2196F3',
                    padding: 10,
                    borderRadius: 5,
                    marginVertical: 5,
                    width: '100%',
                    alignItems: 'center',
                  }}
                  onPress={async () => {
                    try {
                      // Update `isFirst` in `profiles`
                      const { error: profileError } = await supabase
                        .from('profiles')
                        .update({ isFirst: false })
                        .eq('id', session?.user.id);

                      // Update `isFirst` in `clinic_profiles`
                      const { error: clinicProfileError } = await supabase
                        .from('clinic_profiles')
                        .update({ isFirst: false })
                        .eq('id', session?.user.id);

                      if (profileError || clinicProfileError) {
                        console.error('Update error:', profileError || clinicProfileError);
                        Alert.alert('Error', 'Failed to update your profile.');
                        return;
                      }

                      // Close modal
                      setviewFirst(false);
                    } catch (err) {
                      console.error('Unexpected error:', err);
                      Alert.alert('Error', 'Something went wrong.');
                    }
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>I'll pass</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#4CAF50',
                    padding: 10,
                    borderRadius: 5,
                    marginVertical: 5,
                    width: '100%',
                    alignItems: 'center',
                  }}
                  onPress={async () => {
                    try {
                      // Update `isFirst` in `profiles`
                      const { error: profileError } = await supabase
                        .from('profiles')
                        .update({ isFirst: false })
                        .eq('id', session?.user.id);

                      // Update `isFirst` in `clinic_profiles`
                      const { error: clinicProfileError } = await supabase
                        .from('clinic_profiles')
                        .update({ isFirst: false })
                        .eq('id', session?.user.id);

                      if (profileError || clinicProfileError) {
                        console.error('Update error:', profileError || clinicProfileError);
                        Alert.alert('Error', 'Failed to update your profile.');
                        return;
                      }

                      // Close the modal locally
                      setviewFirst(false);
                      setModalUpdate(true);
                    } catch (err) {
                      console.error('Unexpected error:', err);
                      Alert.alert('Error', 'Something went wrong.');
                    }
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Sure, take me there!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      
      <Modal
        visible={warn}
        transparent
        animationType="fade"
        onRequestClose={() => setWarn(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              width: isMobile ? '90%' : '40%',
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 20,
                alignSelf: "center",
                color: "#003f30ff",
              }}
            >
              WARNING!
            </Text>
            <Entypo name="warning" size={isMobile? 75 : 150} color="black" />
            <Text
              style={{
                fontSize: 16,
                alignSelf: "center",
                color: "#000000ff",
                fontWeight: "bold",
              }}
            >
              The reason why you are seeing this is that you have violated our community guidelines.
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 30,
                alignSelf: "center",
                color: "#000000ff",
              }}
            >
              Admin: {notifMessage}
            </Text>
            <Text
              style={{
                fontSize: 16,
                alignSelf: "center",
                color: "#000000ff",
              }}
            >
              Please read our term of use and privacy policy to avoid getting banned.
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 20,
                alignSelf: "center",
                color: "#2a46ffff",
              }}
              onPress={() => setTermsOfUse(true)}
            >
              Terms of Use and Privacy Policy
            </Text>
          <View
            style={{
              flexDirection: 'row',
              width: '48%',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >

            <TouchableOpacity
              style={{
                backgroundColor: '#4CAF50',
                padding: 10,
                borderRadius: 5,
                marginVertical: 5,
                width: '100%',
                alignItems: 'center',
              }}
              onPress={async () => {
                  const { error } = await supabase
                    .from('clinic_profiles')
                    .update({ isWarn: false })
                    .eq('id', session?.user.id); // Use the current user's ID

                  setWarn(false);
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Understood and Close</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={ban}
        transparent
        animationType="fade"
        onRequestClose={() => setWarn(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              width: isMobile ? '90%' : '40%',
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 20,
                alignSelf: "center",
                color: "#003f30ff",
              }}
            >
              Your account has been banned!
            </Text>
            <FontAwesome name="ban" size={isMobile ? 75 : 150} color="black" />
            <Text
              style={{
                fontSize: 16,
                alignSelf: "center",
                color: "#000000ff",
                fontWeight: "bold",
              }}
            >
              The reason why you are seeing this is that you have violated our community guidelines.
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 30,
                alignSelf: "center",
                color: "#000000ff",
              }}
            >
              Admin: {notifMessage}
            </Text>


          <View
            style={{
              flexDirection: 'row',
              width: '48%',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >

          </View>
          </View>
        </View>
      </Modal>
              <Modal
          animationType="fade"
          transparent={true}
          visible={modalMessage}
          onRequestClose={() => setModalMessage(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                width: "80%",
                maxWidth: 500,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 10,
                  color: "#003f30ff",
                }}
              >
                Message
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 20,
                  color: "#333",
                }}
              >
                {selectedMessage}
              </Text>
              <TouchableOpacity
                onPress={() => setModalMessage(false)}
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "#003f30",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 5,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      {/* Glider Panel */}
      <View
        style={{
          width: isMobile ? drawerWidth : "18%",
          left: 0,
          top: 0,
          flexDirection: "row",
          height: "100%",
          position: "absolute",
          zIndex: 1,
          transform: [{ translateX: isMobile ? mobbutoffset : offset }],
        }}
      >
        <LinearGradient
          style={{
            ...styles.glider,
            bottom: 0,
            left: 0,
            top: 0,
            width: drawerWidth,
          }}
          colors={['#80c4c4ff', '#009b84ff']}
        >
          <View style={{ flex: 1 }}>
          <Modal
            transparent
            animationType="fade"
            visible={modalSignout}
            onRequestClose={() => setModalSignout(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
                padding: 50,
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 20,
                  alignItems: "center",
                  width: !isMobile ? "30%" : "85%",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    marginBottom: 20,
                    textAlign: "center",
                  }}
                >
                  Do you wanna signout?
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {/* CANCEL BUTTON */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: "#b32020",
                      paddingVertical: 12,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                    onPress={() => setModalSignout(false)}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  {/* SIGNOUT BUTTON */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: "#2ecc71",
                      paddingVertical: 12,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                    onPress={() => {
                      console.log("Signing out...");
                      setModalSignout(false);
                      signOut();
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Signout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
              }}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={require("../../assets/favicon.ico.png")}
                style={styles.logo}
              />

            <Text style={{fontWeight: 'bold', fontSize: 30, marginTop: -40, color: '#00505cff', textAlign: 'center', }}>SMILE STUDIO</Text>
            <Text style={{fontSize: 12, color: '#00505cff', textAlign: 'center', marginBottom: 7, }}>GRIN CREATORS</Text>
            <View style={{padding: 7, paddingLeft: 10, paddingRight: 10, backgroundColor: 'white', marginBottom: 30, borderRadius: 10}}>
              <Text style={{fontSize: 12, color: '#00505cff', textAlign: 'center'}}>CLINIC</Text>
            </View>

              <View style={{ ...styles.container, width: "100%" }}>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#00505cff',
                    borderRadius: 12,
                    marginTop: 0,
                    marginBottom: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 6,
                    height: 30,
                    alignSelf: "center",
                    width: "90%",
                  }}
                  onPress={() => setModalUpdate(true)}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"white"} />
                  ) : (
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "white",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                        textAlign: "center",
                      }}
                    >
                      Edit Information
                    </Text>
                  )}
                </TouchableOpacity>

                {/*Modal : Edit Info */}
                <Modal
                  transparent
                  animationType="fade"
                  visible={modalUpdate}
                  onRequestClose={() => setModalUpdate(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.4)",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 50,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "white",
                        borderRadius: 12,
                        padding: 20,
                        alignItems: "center",
                        width: !isMobile ? "25%" : "95%",
                      }}
                    >
                      <View style={styles.avatarSection}>
                        <TouchableOpacity
                          onPress={() => {
                            if (Platform.OS === "web") {
                              pickImageWeb();
                            } else {
                              pickImageMobile();
                            }
                          }}
                          style={styles.avatarContainer}
                        >
                          {avatarUrl ? (
                            <Image
                              source={{
                                uri: avatarUrl
                                  ? `${avatarUrl}?t=${Date.now()}`
                                  : require("../../assets/default.png"),
                              }} // ✅ Type-safe (fallback empty string)
                              style={styles.avatar}
                            />
                          ) : (
                            <View style={styles.avatarPlaceholder}>
                              <MaterialIcons
                                name="person"
                                size={50}
                                color="#ccc"
                              />
                            </View>
                          )}
                          <View style={styles.cameraIcon}>
                            <MaterialIcons
                              name="camera-alt"
                              size={20}
                              color="#007AFF"
                            />
                          </View>
                        </TouchableOpacity>

                        <Text style={styles.avatarText}>
                          Tap to change profile picture
                        </Text>
                      </View>

                      {/* Rest of your profile content */}
                      <View>
                        <Text style={{fontWeight: "bold", fontStyle: "italic", fontSize: 16, textAlign: "center", color: "#003f30ff"}}>
                          {clinicName}
                        </Text>
                        <Text style={{fontStyle: "italic", fontSize: 16, textAlign: "center", marginBottom: 10, color: "#003f30ff"}}>
                          {website}
                        </Text>
                      </View>
                      <Modal
                        transparent
                        animationType="fade"
                        visible={profileInfoVisible}
                        onRequestClose={() => setProfileInfoVisible(false)}
                      >
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: "rgba(0,0,0,0.4)",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 50,
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "white",
                              borderRadius: 12,
                              padding: 20,
                              width: Platform.OS === "web" ? "25%" : "95%",
                            }}
                          >
                            <TouchableOpacity
                              onPress={toggleDentistAvailability}
                              style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}
                            >
                              <View
                                style={{
                                  height: 20,
                                  width: 20,
                                  borderRadius: 4,
                                  borderWidth: 1,
                                  borderColor: "#888",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  marginRight: 10,
                                  backgroundColor: dentistAvailability ? "#007bff" : "#fff",
                                }}
                              >
                                {dentistAvailability && (
                                  <View style={{ width: 10, height: 10, backgroundColor: "#fff" }} />
                                )}
                              </View>
                              <Text>Dentist Availability</Text>
                            </TouchableOpacity>

                            {/* Clinic's Introduction TextInput */}
                            <Text style={{ marginBottom: 6, fontWeight: "bold" }}>
                              Clinic's Slogan
                            </Text>
                            <TextInput
                              style={{
                                height: 100,
                                borderColor: "#ccc",
                                borderWidth: 1,
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 15,
                                textAlignVertical: "top",
                              }}
                              multiline
                              placeholder="Write introduction..."
                              maxLength={100}
                              value={website}
                              onChangeText={setWebsite}
                            />

                            {/* Clinic's Introduction TextInput */}
                            <Text style={{ marginBottom: 6, fontWeight: "bold" }}>
                              Clinic's Introduction
                            </Text>
                            <TextInput
                              style={{
                                height: 100,
                                borderColor: "#ccc",
                                borderWidth: 1,
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 15,
                                textAlignVertical: "top",
                              }}
                              multiline
                              placeholder="Write introduction..."
                              maxLength={500}
                              value={clinicIntroduction}
                              onChangeText={setClinicIntroduction}
                            />

                            {/* Buttons at the bottom */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                              <TouchableOpacity
                                style={{
                                  flex: 1,
                                  backgroundColor: "#b32020",
                                  paddingVertical: 12,
                                  borderRadius: 8,
                                  marginRight: 10,
                                }}
                                onPress={() => setProfileInfoVisible(false)}
                              >
                                <Text
                                  style={{
                                    color: "white",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                  }}
                                >
                                  Close
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={{
                                  flex: 1,
                                  backgroundColor: "#2e7dccff",
                                  paddingVertical: 12,
                                  borderRadius: 8,
                                }}
                                onPress={() => {
                                  updateProfileInfoModal(); // always updates with current toggle state

                                  console.log("Clinic Introduction:", clinicIntroduction);
                                  console.log("Offers:", offers);
                                  setProfileInfoVisible(false);
                                  updateProfile({ website, avatar_url: avatarUrl });

                                }}
                              >
                                <Text
                                  style={{
                                    color: "white",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                  }}
                                >
                                  Update
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </Modal>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          width: "100%",
                          marginBottom: 8,
                        }}
                      >
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: "#4CAF50",
                          paddingVertical: 5,
                          borderRadius: 8,
                          marginTop: 10,
                        }}
                        onPress={() => setProfileInfoVisible(true)}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          Open Profile Info
                        </Text>
                      </TouchableOpacity>
                      </View>
                        {!verified && (
                          <Text style={{ 
                            color: "#000000ff", 
                            marginBottom: 10, 
                            textAlign: "center",
                          }}>
                            {"To access these features, please "}
                            <Text style={{ textDecorationLine: "underline", color: "blue" }} onPress={() => {
                              setDashboardView("verify");
                              setModalUpdate(false);
                              if (isMobile) {
                                setMoved((prev) => !prev);
                                setExpanded((prev) => !prev);
                              }
                            }}>
                              verify
                            </Text>
                            {" here."}
                          </Text>
                        )}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          width: "100%",
                          gap: 5,
                        }}
                      >
                        <TouchableOpacity
                          disabled={!verified}
                          style={{
                            flex: 1,
                            backgroundColor: verified ? "#4CAF50" : "#A5D6A7", // lighter green or gray when disabled
                            paddingVertical: 5,
                            borderRadius: 8,
                            marginBottom: 8,
                            height: isMobile ? 28 : 30,
                            opacity: verified ? 1 : 0.6, // visually indicate disabled state
                          }}
                          onPress={() => {
                            if (verified) setShowMapPicketModal(true);
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {"Edit Map"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        {/* CANCEL BUTTON */}
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: "#b32020",
                            paddingVertical: 12,
                            borderRadius: 8,
                          }}
                          onPress={() => setModalUpdate(false)}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            Back
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>

                <Modal
                  transparent
                  animationType="fade"
                  visible={showMapPickerModal}
                  onDismiss={() => {
                    setShowMapPicketModal(false);
                  }}
                  onRequestClose={() => setShowMapPicketModal(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.4)",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 50,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        padding: 16,
                        width: isMobile ? 350 : "80%",
                      }}
                    >
                      <Text style={{ marginBottom: 8, fontWeight: "bold", fontSize: 16, color: "#003f30ff" }}>
                        Locate your clinic location
                      </Text>
                      <Text style={{ marginBottom: 12 }}>
                        Tip: click/tap in the map to pin your clinic location
                      </Text>

                      <MapPickerView
                        allowEdit
                        onSave={(long, lat) => {
                          setShowMapPicketModal(false);
                          saveClinicLocation(long, lat);
                        }}
                      />

                      {/* Bottom close button */}
                      <TouchableOpacity
                        onPress={() => setShowMapPicketModal(false)}
                        style={{
                          marginTop: 20,
                          paddingVertical: 12,
                          backgroundColor: "#e74c3c",
                          borderRadius: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

<TouchableOpacity
  onPress={() => {
    setDashboardView("profile");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "profile" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="user" size={24} color={dashboardView === "profile" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "profile" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        Profile
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("schedule");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "schedule" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="calendar-check-o" size={24} color={dashboardView === "schedule" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "schedule" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        Schedule
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("offers");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "offers" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="tag" size={24} color={dashboardView === "offers" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "offers" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        Offers
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("clinics");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "clinics" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="hospital-o" size={24} color={dashboardView === "clinics" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "clinics" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        Clinics
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("appointments");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "appointments" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="calendar" size={24} color={dashboardView === "appointments" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "appointments" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        Appointments
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("pending");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "pending" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="clock-o" size={24} color={dashboardView === "pending" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "pending" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        Requests
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("history");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "history" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="history" size={24} color={dashboardView === "history" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "history" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        History
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("chats");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "chats" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="comments" size={24} color={dashboardView === "chats" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "chats" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        Chats
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("verify");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "verify" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="check-circle" size={24} color={dashboardView === "verify" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "verify" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        Verification
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("team");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "team" ? '#ffffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="users" size={24} color={dashboardView === "team" ? '#00505cff' : '#ffffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "team" ? '#00505cff' : '#ffffffff',
        marginLeft: 8,
      }}>
        About Us
      </Text>
    </View>
  )}
</TouchableOpacity>



              </View>
            </ScrollView>
<TouchableOpacity
  onPress={() => setModalSignout(true)}
  style={{
    alignSelf: 'center',  // Align to left side
    marginLeft: -35,  // Optional: some left margin
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"white"} />
  ) : (
    <>
      <SimpleLineIcons name="logout" size={24} color="white" />
      <Text style={{ color: 'white', fontSize: 16, marginLeft: 8 }}>
        Logout
      </Text>
    </>
  )}
</TouchableOpacity>
          </View>
        </LinearGradient>
        {/* Toggle Button */}
        {(Platform.OS === "android" || Platform.OS === "ios") && (
          <View style={[styles.toggleButtonWrapper, { height: 60 }]}>
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                backgroundColor: '#00505cff',
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                zIndex: 9999,
                shadowColor: "#00000045",
                shadowRadius: 2,
                shadowOffset: { width: 2, height: 2 },
              }}
              onPress={() => {
                setMoved((prev) => !prev);
                setExpanded((prev) => !prev);
              }}
              disabled={loading}
            >
              {moved ? (
                <MaterialIcons
                  name="keyboard-arrow-right"
                  size={34}
                  color="white"
                />
              ) : (
                <MaterialIcons
                  name="keyboard-arrow-left"
                  size={34}
                  color="white"
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Dashboard */}
      <LinearGradient
        style={{ flex: 1, position: "relative" }}
        colors={['#b9d7d3ff', '#00505cff']}
      >
        {/* Dashboard Profile --------------------------------------------------------------------------------------- */}
        <Modal
          transparent
          animationType="fade"
          visible={!!rejectAppointmentId}
          onRequestClose={() => setModalUpdate(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(110, 79, 79, 0.4)",
              justifyContent: "center",
              alignItems: "center",
              padding: 50,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 18,
                width: isDesktop ? 320 : "100%",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                Reject appointment request
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "black",
                }}
              >
                Rejection Note
              </Text>
              <TextInput
                value={rejectMsg}
                maxLength={3000}
                inputMode="text"
                multiline
                onChangeText={setRejectMsg}
              />
              <TouchableOpacity
                onPress={() => {
                  rejectAppointment(rejectAppointmentId || "", rejectMsg || "");
                  setRejectAppointmentID(undefined);
                  setRejectMsg(undefined);
                }}
                style={{
                  marginTop: 25,
                  width: "100%",
                  backgroundColor: "green",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "300",
                  }}
                >
                  Confirm Rejection
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setRejectAppointmentID(undefined);
                  setRejectMsg(undefined);
                }}
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "black",
                    fontSize: 14,
                    fontWeight: "300",
                  }}
                >
                  Cancel Reject
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {dashboardView === "profile" && (
        <View
          style={[
            styles.dashboard,
            {
              width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
              right: dashboardView === "profile" ? 11 : 20000,
              backgroundColor: '#f1f5f9',
            },
          ]}
        >
          <ScrollView>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 20,
                alignSelf: isMobile ? "center" : "flex-start",
                color: '#00505cff',
              }}
            >
              Profile
            </Text>
            <View style={styles.proinfo}>
              <Image
                source={
                  avatarUrl
                    ? { uri: avatarUrl }
                    : require("../../assets/default.png") // fallback/default image
                }
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: 100,
                  borderWidth: 4,
                  borderColor: '#cbd5e1',
                  backgroundColor: "#eaeaea",
                }}
              />
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  color: '#00505cff',
                  textAlign: "center",
                  marginBottom: 4,
                  marginTop: 10
                }}
              >
                {clinicName}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: "#8a8a8aff",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                {session?.user?.email}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: "#8a8a8aff",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                {mobileNum}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: "#416e5dff",
                  fontStyle: "italic",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                {website}
              </Text>
            </View>
            
            <Modal
              transparent
              animationType="fade"
              visible={showWeeklySchedule}
              onRequestClose={() => {
                setShowWeeklySchedule(false);
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 50,
                }}
              >

                  <WeekScheduleEditor
                    clinicId={session?.user.id}
                    onSave={() => {
                      setShowWeeklySchedule(false);
                    }}
                  />

                  <TouchableOpacity
                    onPress={() => setShowWeeklySchedule(false)}
                    style={{
                      marginTop: 20,
                      paddingVertical: 12,
                      paddingHorizontal: 25,
                      backgroundColor: "#f44336", // red button
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
            </Modal>
            <View style={styles.cardRow}>
              <View style={styles.card}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 50,
                    textAlign: "center",
                    color: '#00505cff',
                  }}
                >
                  {userCount !== null ? userCount : "..."}
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 6,
                    fontSize: isMobile ? 15 : 25,
                    color: '#00505cff',
                  }}
                >
                  Total Patients
                </Text>
              </View>
              <View style={styles.card}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 50,
                    textAlign: "center",
                    color: '#00505cff',
                  }}
                >
                  {
                    // You might want to store the length in state for reactivity
                    appointmentsToday.length // Assuming you've fetched and stored it
                  }
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 6,
                    fontSize: isMobile ? 15 : 25,
                    color: '#00505cff',
                  }}
                >
                  Appointments Today
                </Text>
              </View>
              <View style={styles.card}>
                <View style={{ flexDirection: "column" }}>
                  <View>
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 6,
                        fontSize: isMobile ? 15 : 25,
                        color: '#00505cff',
                      }}
                    >
                      Running Appointments
                    </Text>
                  </View>
                  <View style={{ marginTop: 20, alignItems: "center" }}>
                    <TouchableOpacity
                      style={{...styles.redButton, backgroundColor: '#00505cff',}}
                      onPress={() => setModalVisible(true)}
                    >
                      <Text
                        style={{
                          ...styles.buttonText1,
                          fontSize: isMobile ? 10 : 25,
                          color: '#ffffffff',
                        }}
                      >
                        Overview
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)} // for Android back button
                  >
                    <View style={styles.modalBackground}>
                      <View
                        style={{
                          ...styles.modalContent,
                          width: isMobile ? 350 : "20%",
                          maxHeight: "70%",
                          minWidth: 350,
                        }}
                      >
                        <ScrollView>
                          <Text style={{ 
                            fontSize: 24,
                            fontWeight: "bold",
                            marginBottom: 20,
                            alignSelf: isMobile ? "center" : "flex-start",
                            color: "#003f30ff",
                           }}>
                            Appointments
                          </Text>
                          <View style={{ padding: 20 }}>
                            {/* Appointment Section */}
                            <FlatList
                              data={appointmentsCurrentList}
                              keyExtractor={(e) => e.id}
                              renderItem={(e) => (
                              <View
                                style={{
                                  width: isMobile ? null : 300,
                                  borderWidth: 1,
                                  borderColor: "#ccc",
                                  borderRadius: 10,
                                  padding: 15,
                                  backgroundColor: "#f1f1f1",
                                  marginBottom: 5,
                                }}
                              >
                                  <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                                    {`${e.item.profiles.first_name} ${e.item.profiles.last_name}`}
                                  </Text>

                                  <Text style={{ fontWeight: "600" }}>
                                    Requested Dentists/Staff :
                                  </Text>
                                  <Text>
                                    {(() => {
                                      try {
                                        return JSON.parse(e.item.request).join("\n");
                                      } catch {
                                        return e.item.request; // fallback: just show raw string if parsing fails
                                      }
                                    })()}
                                  </Text>
                                  {e.item.message.length > 20 ? (
                                    <Text style={{ textAlign: "left", flex: 1 }}>
                                      <Text style={{ color: "#000" }}>
                                        {e.item.message.slice(0, 20) + "..."}
                                      </Text>
                                      <Text
                                      onPress={() => {
                                        setSelectedMessage(e.item.message);
                                        setModalMessage(true);
                                        setModalVisible(false);
                                      }} style={{ color: "blue", textDecorationLine: "underline" }}>
                                        See More
                                      </Text>
                                    </Text>
                                  ) : (
                                    <Text style={{ flex: 1 }}>
                                      {e.item.message}
                                    </Text>
                                  )}
                                  <View
                                    style={{
                                      backgroundColor: "#fff",
                                      padding: 10,
                                      borderRadius: 8,
                                      borderWidth: 1,
                                      borderColor: "#ccc",
                                      marginBottom: 10,
                                      marginTop: 15
                                    }}
                                  >
                                  <Text style={{ color: "#000000ff" }}>
                                    {`Date/Time Request : \n${new Date(e.item.date_time).toLocaleString(undefined, {
                                      year: "numeric",
                                      month: "numeric",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}`}
                                  </Text>
                                  </View>
                                  <Text style={{ color: "#767676ff", fontSize: 9, alignSelf: "flex-end"}}>{`Created at : ${new Date(
                                    e.item.created_at || 0
                                  ).toLocaleString()}`}</Text>
                                </View>
                              )}
                              ListEmptyComponent={() => (
                                <View
                                  style={{
                                    borderWidth: 1,
                                    borderColor: "#ccc",
                                    borderRadius: 10,
                                    padding: 15,
                                    backgroundColor: "#f1f1f1",
                                    marginBottom: 5,
                                  }}
                                >
                                  <Text style={{ fontWeight: "600" }}>
                                    - NO APPOINTMENTS -
                                  </Text>
                                </View>
                              )}
                            />
                          </View>
                          <TouchableOpacity
                            style={{
                              ...styles.closeButton,
                              width: "60%",
                              alignSelf: "center",
                            }}
                            onPress={() => setModalVisible(false)}
                          >
                            <Text
                              style={{
                                ...styles.closeButtonText,
                                textAlign: "center",
                              }}
                            >
                              Close
                            </Text>
                          </TouchableOpacity>
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                </View>
              </View>
            </View>
            <View
              style={{
                width: isMobile ? "98.8%" : "99.3%",
                marginHorizontal: 8,
                flexDirection: isMobile ? "column" : "row", // 👈 switch here
                flexWrap: "wrap",
                gap: 15,
                paddingBottom: 25,
              }}
            >
              <View
                style={{
                  flex: 1,
                  padding: 16,
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  minWidth: 330,
                   height: isMobile ? null : 400,
                }}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    fontWeight: "bold",
                    fontSize: 24,
                    color: '#00505cff',
                    marginBottom: 10,
                  }}
                >
                  Appointment Requests
                </Text>
                {/*List Appointments*/}
                <FlatList
                  data={isMobile ? (appointmentsList ?? []).slice(0, 3) : (appointmentsList ?? [])} // 👈 safe fallback
                  keyExtractor={(e) => e.id}
                  style={{ flex: 1 }} // 👈 makes FlatList expand and scroll inside container
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                  contentContainerStyle={{
                    gap: 10,
                    paddingBottom: 20,
                    alignItems: (appointmentsList?.length ?? 0) === 0 ? "center" : "stretch",
                  }}
                  renderItem={(e) => (
                    <View
                      style={{
                        width: "100%",
                        gap: 5,
                        paddingHorizontal: 20,
                        paddingVertical: 15,
                        backgroundColor: "#ffffd7ff",
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Patient's Name :</Text>
                      <Text>{`${e.item.profiles.first_name} ${e.item.profiles.last_name}`}</Text>

                      <Text style={{ fontWeight: "bold" }}>Date & Time of Appointment :</Text>
                      <Text>{`Date : ${new Date(e.item.date_time).toLocaleString(undefined, {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}`}</Text>

                      <Text style={{ fontWeight: "bold" }}>
                        Requested Dentists/Staff :
                      </Text>
                      <Text>
                        {(() => {
                          try {
                            return JSON.parse(e.item.request).join("\n");
                          } catch {
                            return e.item.request; // fallback: just show raw string if parsing fails
                          }
                        })()}
                      </Text>

                      <View
                        style={{
                          marginTop: 10,
                          padding: 8,
                          borderRadius: 6,
                          backgroundColor: "#fffce9ff", // light yellow background
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>Message :</Text>
                        {e.item.message.length > 20 ? (
                          <Text style={{ textAlign: "left", flex: 1 }}>
                            <Text style={{ color: "#000" }}>
                              {e.item.message.slice(0, 20) + "..."}
                            </Text>
                            <Text
                            onPress={() => {
                              setSelectedMessage(e.item.message);
                              setModalMessage(true);
                            }} style={{ color: "blue", textDecorationLine: "underline" }}>
                              See More
                            </Text>
                          </Text>
                      ) : (
                        <Text style={{ flex: 1 }}>
                          {e.item.message}
                        </Text>
                      )}
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          marginTop: 10,
                          gap: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => acceptAppointment(e.item.id)}
                          style={{
                            backgroundColor: "#4CAF50",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{ color: "white", fontWeight: "600" }}
                          >
                            Accept
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setRejectAppointmentID(e.item.id);
                          }}
                          style={{
                            backgroundColor: "#F44336",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{ color: "white", fontWeight: "600" }}
                          >
                            Reject
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text
                        style={{
                          textAlign: "right",
                          color: "#2c2c2cff",
                          fontSize: 10,
                        }}
                      >
                        {`Created at : ${new Date(e.item.created_at || 0).toLocaleString()}`}
                      </Text>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text
                      style={{
                        fontSize: 20,
                        color: "gray",
                        marginTop: 40,
                        marginBottom: 40,
                      }}
                    >
                      - No Requests -
                    </Text>
                  }
                />

                {/* 👇 Show "view all" message only if mobile AND more than 3 */}
                {isMobile && (appointmentsList?.length ?? 0) > 3 && (
                  <Text
                  onPress={() => {
                    setDashboardView("pending");
                  }}
                    style={{
                      fontSize: 14,
                      color: "blue",
                      marginTop: 10,
                      textAlign: "center",
                    }}
                  >
                    ...navigate to requests to view all
                  </Text>
                )}

              </View>
              <View
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: 16,
                  backgroundColor: "#ffffffff",
                  borderRadius: 8,
                  height: isMobile ? null : 400,
                }}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    fontWeight: "bold",
                    fontSize: 24,
                    color: '#00505cff',
                    marginBottom: 10,
                  }}
                >
                  History
                </Text>
                <FlatList
                  data={isMobile ? (appointmentsPast ?? []).slice(0, 3) : (appointmentsPast ?? [])} // 👈 safe fallback
                  keyExtractor={(e) => e.id}
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                  contentContainerStyle={{
                    gap: 10,
                    flexGrow: 1,
                    paddingBottom: 20,
                    alignItems: (appointmentsPast?.length ?? 0) === 0 ? "center" : "stretch",
                  }}
                  renderItem={(e) => (
                    <View
                      style={{
                        width: "100%",
                        gap: 5,
                        paddingHorizontal: 20,
                        paddingVertical: 15,
                        backgroundColor: e.item.isAccepted ? "#e4ffe0ff" : "#ffe0e0ff",
                        borderRadius: 8,

                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Patient's Name :</Text>
                      <Text>{`${e.item.profiles.first_name} ${e.item.profiles.last_name}`}</Text>

                      <Text style={{ fontWeight: "bold" }}>Date & Time:</Text>
                      <Text>
                        {`${new Date(e.item.date_time).toLocaleString(undefined, {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}`}
                      </Text>

                      <Text style={{ fontWeight: "bold" }}>
                        Requested Dentists/Staff :
                      </Text>
                      <Text>
                        {(() => {
                          try {
                            return JSON.parse(e.item.request).join("\n");
                          } catch {
                            return e.item.request; // fallback: just show raw string if parsing fails
                          }
                        })()}
                      </Text>

                      <View
                        style={{
                          marginTop: 10,
                          padding: 8,
                          borderRadius: 6,
                          backgroundColor: !e.item.isAccepted ? "#fff3f3" : "#e9fdecff",
                          borderWidth: 1,
                          borderColor: !e.item.isAccepted ? "#ffcccc" : "#b6e4beff",
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>Message :</Text>
                        {e.item.message.length > 20 ? (
                          <Text style={{ textAlign: "left", flex: 1 }}>
                            <Text style={{ color: "#000" }}>
                              {e.item.message.slice(0, 20) + "..."}
                            </Text>
                            <Text
                            onPress={() => {
                              setSelectedMessage(e.item.message);
                              setModalMessage(true);
                            }} style={{ color: "blue", textDecorationLine: "underline" }}>
                              See More
                            </Text>
                          </Text>
                      ) : (
                        <Text style={{ flex: 1 }}>
                          {e.item.message}
                        </Text>
                      )}
                      </View>

                      <Text style={{ fontWeight: "bold" }}>Status :</Text>
                      <Text>
                        {e.item.isAccepted
                          ? "Accepted"
                          : e.item.isAccepted === false
                          ? "Rejected"
                          : "Rejected : - past due -"}
                      </Text>

                      {e.item.isAccepted == false && (
                        <View
                          style={{
                            marginTop: 10,
                            padding: 8,
                            borderRadius: 6,
                            backgroundColor: "#fff3f3",
                            borderWidth: 1,
                            borderColor: "#ffcccc",
                          }}
                        >
                          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                            Rejection Message :
                          </Text>
                          <Text>{e.item.rejection_note || "No rejection note"}</Text>
                        </View>
                      )}

                      <Text style={{ fontWeight: "bold" }}>Attendance :</Text>
                      {/* Attended Status Column */}
                      <Text style={{ flex: 1 }}>
                        {e.item.isAttended === true
                          ? "Attended"
                          : e.item.isAttended === false
                          ? "Not Attended"
                          : "Not Attended"}
                      </Text>

                    {e.item.isAccepted === true && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          marginTop: 10,
                          gap: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => attendedAppointment(e.item.id)}
                          style={{
                            backgroundColor: "#4CAF50",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "600" }}>Attended</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => notAttendedAppointment(e.item.id)}
                          style={{
                            backgroundColor: "#F44336",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "600" }}>
                            Not Attended
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                      <Text
                        style={{
                          textAlign: "right",
                          color: "#2c2c2cff",
                          fontSize: 10,
                        }}
                      >
                        {`Created at : ${new Date(e.item.created_at || 0).toLocaleString()}`}
                      </Text>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text
                      style={{
                        fontSize: 20,
                        color: "gray",
                        marginTop: 40,
                        marginBottom: 40,
                      }}
                    >
                      - No History -
                    </Text>
                  }
                />

                {/* 👇 Show "view all" message only if mobile AND more than 3 */}
                {isMobile && (appointmentsPast?.length ?? 0) > 3 && (
                  <Text
                  onPress={() => {
                    setDashboardView("history");
                  }}
                    style={{
                      fontSize: 14,
                      color: "blue",
                      marginTop: 10,
                      textAlign: "center",
                    }}
                  >
                    ...navigate to history to view all
                  </Text>
                )}

              </View>
            </View>
          </ScrollView>
        </View>
        )}

        {/* Dashboard Schedule --------------------------------------------------------------------------------------- */}

{dashboardView === "schedule" && (
  <View
    style={[
      styles.dashboard,
      {
        flex: 1,
        width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
        right: dashboardView === "schedule" ? 11 : 20000,
      },
    ]}
  >
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          alignSelf: isMobile ? "center" : "flex-start",
          color: "#003f30ff",
        }}
      >
        Clinic's Schedule & Dentist's Schedule
      </Text>

      <View
        style={{
          flex: 1,
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* Schedule Section */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 12,
            // optional shadow/elevation for card look
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {!!verified ? (
            <WeekScheduleEditor
              clinicId={session?.user.id}
              onSave={() => setShowWeeklySchedule(false)}
              style={{ flex: 1 }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
                backgroundColor: "#f7f7f7",
                borderRadius: 16,
                marginTop: -10,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "bold",
                  marginBottom: 20,
                  color: "#003f30ff",
                  textAlign: "center",
                }}
              >
                VERIFY YOUR CLINIC TO CREATE A SCHEDULE
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#444",
                  marginBottom: 20,
                  lineHeight: 22,
                  textAlign: "center",
                }}
              >
                Verified clinics build more trust with patients. When your clinic is
                verified:
                {"\n"}• Patients are able to create an appointment.
                {"\n"}• You can set your clinic's operating hours and location.
                {"\n"}• Your clinic is highlighted as trustworthy and authentic.
              </Text>

              <TouchableOpacity
                onPress={() => setDashboardView("verify")}
                style={{
                  backgroundColor: "#00796b",
                  paddingVertical: 12,
                  paddingHorizontal: 30,
                  borderRadius: 8,
                  alignSelf: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>
                  Go to Verification
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Dentists Section (only if verified) */}
{verified && (
  <View
    style={{
      flex: 1,
      backgroundColor: "#fff",
      padding: 40,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      // Important: add height or flex for ScrollView to work properly
      height: "100%", // or any fixed height you want
    }}
  >
    <Text
      style={{
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#003f30ff",
      }}
    >
      Dentists & Schedule
    </Text>
    <Text
      style={{
        fontSize: 16,
        marginBottom: 15,
        color: "black",
      }}
    >
      Dentists may extend their working hours beyond the clinic’s standard schedule based on patient needs or personal availability.
    </Text>

    {/* Schedule Editor */}
    {openScheduleForIndex !== null && (
      <DentistScheduleEditor
        dentists={dentistList}
        setDentists={setDentistList}
        saveDentists={saveDentists}
        initialSelectedDentistIndex={openScheduleForIndex}
        onBack={() => setOpenScheduleForIndex(null)}
      />
    )}

    {/* Only show below if schedule editor is not open */}
    {openScheduleForIndex === null && (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }} // Space for fixed button
        nestedScrollEnabled={true}
      >
        {/* Input Fields and Add Button */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 20,
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <TextInput
            placeholder="Dentist's Firstname Lastname"
            placeholderTextColor={"#ccc"}
            value={newDentistName}
            onChangeText={setNewDentistName}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 10,
              borderRadius: 6,
              backgroundColor: "#fff",
            }}
            maxLength={50}
          />
          <TextInput
            placeholder="Specialization / General Dentist"
            placeholderTextColor={"#ccc"}
            value={newSpecialization}
            onChangeText={setNewSpecialization}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 10,
              borderRadius: 6,
              backgroundColor: "#fff",
            }}
            maxLength={50}
          />
          <TouchableOpacity
            onPress={addDentist}
            style={{
              backgroundColor: "#003f30ff",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Add Dentist
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Dentists List */}
        <View
          style={{
            backgroundColor: "#f1f5f9",
            padding: 20,
            borderRadius: 8,
            height: "100%",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 15,
              color: "#003f30ff",
            }}
          >
            Current Dentists:
          </Text>

          {dentistList.length > 0 ? (
            dentistList.map(({ name, specialty }, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  marginRight: 10,
                }}
              >
                <Feather onPress={() => setOpenScheduleForIndex(i)} name="edit" size={20} color="#00505cff" style={{ marginRight: 6 } } />
                <Text style={{ fontSize: 16 }}>
                  Dr. {name} ({specialty})
                </Text>
              </View>

                <TouchableOpacity
                  onPress={() => {
                    setDentistToRemoveIndex(i);
                    setRemoveDentistConfirmModalVisible(true);
                  }}
                  style={{
                    marginLeft: 10,
                    backgroundColor: "#ff4444",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 16, color: "#999" }}>
              - dentists have not yet been set -
            </Text>
          )}
        </View>
      </ScrollView>

      {/* 🔒 Fixed Reset Button */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => setResetDentistConfirmModalVisible(true)}
          style={{
            backgroundColor: "#ff4444",
            paddingVertical: 12,
            paddingHorizontal: 25,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            Reset Dentists
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    )}
  </View>
)}

      </View>
    </ScrollView>
  </View>
)}




<Modal
  visible={limitReachedDentistModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setLimitReachedDentistModalVisible(false)}
>
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
    <View style={{ backgroundColor: '#fff', padding: 25, borderRadius: 8, width: '80%' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Limit Reached</Text>
      <Text style={{ marginBottom: 20 }}>
        You can only add up to 10 dentists.
      </Text>
      <TouchableOpacity
        onPress={() => setLimitReachedDentistModalVisible(false)}
        style={{
          backgroundColor: '#003f30ff',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 6,
          alignSelf: 'flex-end',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  visible={removeDentistConfirmModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setRemoveDentistConfirmModalVisible(false)}
>
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
    <View style={{ backgroundColor: '#fff', padding: 25, borderRadius: 8, width: '80%' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Confirm Removal</Text>
      <Text style={{ marginBottom: 20 }}>
        Are you sure you want to remove this dentist?
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity
          onPress={() => setRemoveDentistConfirmModalVisible(false)}
          style={{
            marginRight: 10,
            backgroundColor: '#ccc',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={confirmRemoveDentist}
          style={{
            backgroundColor: '#ff4444',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

<Modal
  visible={resetDentistConfirmModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setResetDentistConfirmModalVisible(false)}
>
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
    <View style={{ backgroundColor: '#fff', padding: 25, borderRadius: 8, width: '80%' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Reset Dentists</Text>
      <Text style={{ marginBottom: 20 }}>
        This will remove all dentists from your clinic. Are you sure?
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity
          onPress={() => setResetDentistConfirmModalVisible(false)}
          style={{
            marginRight: 10,
            backgroundColor: '#ccc',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={confirmResetDentists}
          style={{
            backgroundColor: '#ff4444',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

<Modal
  visible={emptyDentistWarningModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setEmptyDentistWarningModalVisible(false)}
>
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
    <View style={{ backgroundColor: '#fff', padding: 25, borderRadius: 8, width: '80%' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Empty Fields</Text>
      <Text style={{ marginBottom: 20 }}>
        Both the dentist's name and specialization are required.
      </Text>
      <TouchableOpacity
        onPress={() => setEmptyDentistWarningModalVisible(false)}
        style={{
          backgroundColor: '#003f30ff',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 6,
          alignSelf: 'flex-end',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


        {/* Dashboard Offers --------------------------------------------------------------------------------------- */}

        {dashboardView === 'offers' && (
          <View
            style={[
              styles.dashboard,
              {
                width: !isDesktop ? '95%' : expanded ? '80%' : '95%',
                right: dashboardView === 'offers' ? 11 : 20000,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                marginBottom: 20,
                alignSelf: isMobile ? 'center' : 'flex-start',
                color: '#003f30ff',
              }}
            >
              Offers
            </Text>

            {/* Always-visible TextInput + Add Offer button */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <TextInput
                value={newOfferText}
                onChangeText={setNewOfferText}
                placeholder="Enter a new offer..."
                maxLength={50}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  padding: 10,
                  borderRadius: 6,
                  backgroundColor: '#fff',
                  marginRight: 10,
                }}
              />
              <TouchableOpacity
                onPress={async () => {
                  const trimmed = newOfferText.trim();
                  if (trimmed === '') {
                    setEmptyOfferWarningVisible(true);
                    return;
                  }

                  // Check max limit
                  if (offerList.length >= 10) {
                    setLimitReachedModalVisible(true);
                    return;
                  }

                  // Check duplicates (case-insensitive)
                  const duplicate = offerList.some(
                    (offer) => offer.toLowerCase() === trimmed.toLowerCase()
                  );
                  if (duplicate) {
                    Alert.alert('Duplicate Offer', 'This offer already exists.');
                    return;
                  }

                  const updatedOfferList = [...offerList, trimmed];
                  setOfferList(updatedOfferList);

                  try {
                    if (!session?.user) throw new Error('User not authenticated');
                    const combinedOffers = updatedOfferList.join('?');

                    const { error } = await supabase
                      .from('clinic_profiles')
                      .update({ offers: combinedOffers })
                      .eq('id', session.user.id);

                    if (error) throw error;

                    Alert.alert('Success', 'Offer added and saved.');
                    setNewOfferText('');
                    setIsSaved(true);
                    setOffers(combinedOffers);
                  } catch (err: any) {
                    console.error(err);
                    Alert.alert('Error', err.message || 'Could not save offer.');
                  }
                }}
                style={{
                  backgroundColor: '#003f30ff',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Offer</Text>
              </TouchableOpacity>
            </View>

            {/* Current offers section */}
            <View
              style={{
                padding: 20,
                backgroundColor: '#f9f9f9',
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 20,
                  alignSelf: isMobile ? 'center' : 'flex-start',
                  color: '#003f30ff',
                }}
              >
                Current offers :
              </Text>

              {offers && offers.trim() !== '' ? (
                offers
                  .split('?')
                  .filter((offer) => offer.trim() !== '')
                  .map((offer, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: '#f0f0f0',   // light gray background
                        borderRadius: 8,
                        padding: 15,
                        marginBottom: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2, // for Android shadow
                      }}
                    >
                      <Text style={{ fontSize: 16, flex: 1, marginRight: 10 }}>
                        • {offer}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setOfferToRemoveIndex(i);  // store which offer to remove
                          setRemoveConfirmModalVisible(true);
                        }}
                        style={{
                          marginLeft: 10,
                          backgroundColor: '#ff4444',
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))
              ) : (
                <Text style={{ fontSize: 16, color: '#999' }}>
                  - offers have not yet been set -
                </Text>
              )}

            </View>
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => setResetConfirmModalVisible(true)}
                style={{
                  backgroundColor: "#ff4444",
                  paddingVertical: 12,
                  paddingHorizontal: 25,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                  Reset Offers
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

<Modal
  visible={duplicateDentistModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setDuplicateDentistModalVisible(false)}
>
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  }}>
    <View style={{
      backgroundColor: 'white',
      padding: 25,
      borderRadius: 10,
      alignItems: 'center',
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Duplicate Dentist
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
        This dentist with the same name already exists.
      </Text>
      <TouchableOpacity
        onPress={() => setDuplicateDentistModalVisible(false)}
        style={{
          backgroundColor: '#003f30ff',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Okay</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


<Modal
  visible={resetConfirmModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setResetConfirmModalVisible(false)}
>
  <View style={{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  }}>
    <View style={{
      backgroundColor: "white",
      padding: 20,
      borderRadius: 8,
      width: "80%",
      alignItems: "center",
    }}>
      <Text style={{ fontSize: 18, marginBottom: 20, textAlign: "center" }}>
        Are you sure you want to reset all offers?
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        <TouchableOpacity
          onPress={() => setResetConfirmModalVisible(false)}
          style={{
            backgroundColor: "#aaa",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 6,
            marginRight: 10,
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetOffers}
          style={{
            backgroundColor: "#ff4444",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 6,
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Yes, Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


<Modal
  visible={emptyOfferWarningVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setEmptyOfferWarningVisible(false)}
>
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  }}>
    <View style={{
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 8,
      width: '80%',
      alignItems: 'center',
    }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Please enter an offer before adding.</Text>
      <TouchableOpacity
        onPress={() => setEmptyOfferWarningVisible(false)}
        style={{
          backgroundColor: '#003f30ff',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  visible={removeConfirmModalVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setRemoveConfirmModalVisible(false)}
>
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    }}
  >
    <View
      style={{
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
        Confirm Removal
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        Are you sure you want to remove this offer?
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <TouchableOpacity
          onPress={() => setRemoveConfirmModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: '#ccc',
            paddingVertical: 10,
            borderRadius: 8,
            marginRight: 10,
            alignItems: 'center',
          }}
        >
          <Text>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            if (offerToRemoveIndex === null) return;

            const newOfferList = [...offerList];
            newOfferList.splice(offerToRemoveIndex, 1);

            setOfferList(newOfferList);
            setRemoveConfirmModalVisible(false);

            try {
              if (!session?.user) throw new Error('User not authenticated');
              const combinedOffers = newOfferList.join('?');

              const { error } = await supabase
                .from('clinic_profiles')
                .update({ offers: combinedOffers })
                .eq('id', session.user.id);

              if (error) throw error;

              Alert.alert('Removed', 'Offer has been deleted.');
              setOffers(combinedOffers);
            } catch (err: any) {
              console.error(err);
              Alert.alert('Error', err.message || 'Failed to remove the offer.');
            }
          }}
          style={{
            flex: 1,
            backgroundColor: '#ff4444',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


    {/* Reached Limit */}
    <Modal
      visible={limitReachedModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setLimitReachedModalVisible(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <View
          style={{
            width: '80%',
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 20, fontWeight: 'bold' }}>
            Limit Reached
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 20 }}>
            You can only add up to 10 offers.
          </Text>
          <TouchableOpacity
            onPress={() => setLimitReachedModalVisible(false)}
            style={{
              backgroundColor: '#003f30ff',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>





        {/* Dashboard Clinics --------------------------------------------------------------------------------------- */}

        {dashboardView === "clinics" && (
        <View
          style={[
            styles.dashboard,
            {
              width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
              right: dashboardView === "clinics" ? 11 : 20000,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              alignSelf: isMobile ? "center" : "flex-start",
              color: "#003f30ff",
            }}
          >
            Clinics
          </Text>
          <View
            style={{
              width: !isDesktop ? "100%" : expanded ? "90%" : "95%",
              alignSelf: "center",
              position: "absolute",
              height: isMobile ? "90%" : "85%",
              marginTop: 80,
              padding: 14,
              shadowColor: "#00000045",
              shadowRadius: 2,
              shadowOffset: { width: 4, height: 4 },
              backgroundColor: "#e5ffceff",
              borderRadius: 12,
            }}
          >
            <ScrollView>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 20,
                  color: "#003f30ff",
                  alignSelf: "center",
                }}
              >
                Available Clinics
              </Text>
              <TouchableOpacity
                style={{...styles.card, backgroundColor: "rgba(152, 203, 255, 1)", marginBottom: 8, width: isMobile ? "91%" : "98%", height: 30, alignSelf: "center"}}
                onPress={()=>{
                  setTMap(true)
                }}
                >
                  <Text>View All Registered Clinics in Map</Text>
                </TouchableOpacity>
              <Modal
                transparent
                animationType="fade"
                visible={tMap}
                onRequestClose={() => {
                  setTMap(false);
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: "rgba(214, 214, 214, 1)",
                      padding: 20,
                      alignItems: "center",
                      width: isMobile ? 350 : "80%",
                      height: isMobile ? 450 : "80%",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        marginBottom: 20,
                        alignSelf: isMobile ? "center" : "flex-start",
                        color: "#003f30ff",
                      }}
                    >
                      Map
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#000000ff",
                        fontStyle: "italic",
                        textAlign: "left",
                        marginBottom: 4,
                      }}
                    >
                      Click/Tap the pin to view dental clinic details
                    </Text>
                    <MapPickerView allowEdit={false} pins={clinicList} />
                    <TouchableOpacity
                      onPress={() => setTMap(false)}
                      style={{
                        backgroundColor: "#e74c3c",
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        borderRadius: 8,
                        marginTop: 10,
                        minHeight: 20,
                      }}
                    >
                      <Text style={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

            {clinicList.length === 0 ? (
              <Text style={{ textAlign: "center" }}>No clinics found.</Text>
            ) : (
              <View
                style={{
                  flexDirection: isMobile ? "column" : "row",
                  flexWrap: isMobile ? "nowrap" : "wrap",
                  justifyContent: isMobile ? "flex-start" : "center",
                }}
              >
                {clinicList
                  .filter((clinic) => clinic.isFirst === false)
                  .map((clinic, index) => (
                  <LinearGradient
                    colors={["#ffffffff", "#bdeeffff"]}
                    key={clinic.id || index}
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#fff",
                      padding: 20,
                      margin: 8,
                      borderRadius: 16,
                      shadowColor: "#000",
                      shadowOpacity: 0.15,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 4,
                      alignItems: "center",
                      minHeight: 140,

                      // responsive width
                      width: isMobile ? "95%" : "45%",
                    }}
                  >
                    {/* Left side: Image + Info */}
                    <View
                      style={{
                        flex: 7,
                        flexDirection: "row",
                        alignItems: "center",
                        marginLeft: 4,
                      }}
                    >
<View style={{ position: "relative" }}>
  <Image
    source={{ uri: clinic.clinic_photo_url }}
    style={{
      width: isMobile ? 70 : 100,
      height: isMobile ? 70 : 100,
      borderRadius: 16,
      marginRight: 16,
      backgroundColor: "#fff",
    }}
    resizeMode="cover"
  />

  {/* Small Button Overlay */}
  <TouchableOpacity
    style={{
      position: "absolute",
      bottom: -4,
      backgroundColor: "rgba(0,0,0,0.4)",
      right: 6,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
    }}
    onPress={() => {
      setSelectedSunday(clinic.clinic_schedule[0]?.sunday || {});
      setSelectedMonday(clinic.clinic_schedule[0]?.monday || {});
      setSelectedTuesday(clinic.clinic_schedule[0]?.tuesday || {});
      setSelectedWednesday(clinic.clinic_schedule[0]?.wednesday || {});
      setSelectedThursday(clinic.clinic_schedule[0]?.thursday || {});
      setSelectedFriday(clinic.clinic_schedule[0]?.friday || {});
      setSelectedSaturday(clinic.clinic_schedule[0]?.saturday || {});

      setSelectedClinicName(clinic.clinic_name);
      setSelectedClinicEmail(clinic.email);
      setSelectedClinicSlogan(clinic.bio);
      setSelectedClinicAddress(clinic.address);
      setSelectedClinicMobile(clinic.mobile_number);
      setSelectedClinicCreatedAt(clinic.created_at);
      setSelectedClinicRole(clinic.role);
      setSelectedClinicDentist(clinic.isDentistAvailable);
      setSelectedClinicImage(clinic.clinic_photo_url);
      setviewClinic(true);
      setSelectedClinicId(clinic.id);
      setMapView([clinic.longitude, clinic.latitude]);
      setSelectedCI(clinic.introduction);
      setSelectedOffers(clinic.offers);
      setVerified(clinic.isVerified);
    }}
  >
    <Text style={{ color: "#fff", fontSize: isMobile ? 8 : 10 }}>View Clinic</Text>
  </TouchableOpacity>

  {/* Modal */}
  <Modal
    transparent
    visible={viewClinic}
    onRequestClose={() => setviewClinic(false)}
  >
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 20,
          width: isMobile ? "90%" : "35%",
          borderWidth: 2,
          borderColor: "rgba(214, 214, 214, 1)",
          position: "relative", // for absolute positioning of the close button
        }}
      >

        {/* ❌ Top-Right Close Button */}
        <TouchableOpacity
          onPress={() => setviewClinic(false)}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            padding: 6,
            borderRadius: 100,
            width: 30,
            backgroundColor: "#da3434ff",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "white", textAlign: "center", bottom: 1.5 }}>×</Text>
        </TouchableOpacity>

        {/* Profile Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Image
            source={{ uri: selectedClinicImage }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              marginRight: 16,
              backgroundColor: "#f2f2f2",
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {selectedClinicName || "Unnamed Clinic"}
            </Text>
            <Text style={{ fontSize: 11, color: "#226064ff", marginBottom: 6 }}>
              {verified ? "✅ Verified Clinic" : "❌ Unverified Clinic"}
            </Text>
            <Text style={{ fontSize: 14, color: "#3c6422ff" }}>
              {selectedClinicEmail}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#416e5dff",
                fontStyle: "italic",
                marginTop: -2,
              }}
            >
              {selectedClinicSlogan || ""}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: "#e0e0e0",
            marginBottom: 16,
          }}
        />

        {/* Info Section */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            📍 {selectedClinicAddress || "No address provided"}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            📞 {selectedClinicMobile || "No contact"}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            🗓️ Joined: {selectedClinicCreatedAt || "N/A"}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            🦷 Dentist Availability: {selectedClinicDentist ? "Yes" : "No"}
          </Text>
        </View>

        {/* Schedule */}
        <Text style={{ fontSize: 14, fontWeight: "500", marginTop: 12 }}>
          Clinic Schedule
        </Text>
        <View style={{ marginBottom: 16, gap: 1 }}>
          {[
            { label: "Sunday", time: selectedSunday },
            { label: "Monday", time: selectedMonday },
            { label: "Tuesday", time: selectedTuesday },
            { label: "Wednesday", time: selectedWednesday },
            { label: "Thursday", time: selectedThursday },
            { label: "Friday", time: selectedFriday },
            { label: "Saturday", time: selectedSaturday },
          ].map((day) => (
            <DayScheduleView
              key={day.label}
              label={day.label}
              time={
                day.time
                  ? {
                      ...day.time,
                      from: {
                        ...day.time.from,
                        minute: day.time.from?.minute
                          ?.toString()
                          .padStart(2, "0"),
                      },
                      to: {
                        ...day.time.to,
                        minute: day.time.to?.minute
                          ?.toString()
                          .padStart(2, "0"),
                      },
                    }
                  : undefined
              }
            />
          ))}

          {/* If all days have no schedule */}
          {[
            selectedSunday,
            selectedMonday,
            selectedTuesday,
            selectedWednesday,
            selectedThursday,
            selectedFriday,
            selectedSaturday,
          ].every((day) => !day || day.from == null || day.to == null) && (
            <Text
              style={{
                color: "#999",
                fontSize: 14,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              No schedule available
            </Text>
          )}
        </View>

        {/* Buttons Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >

          {/* 🔍 "View Full" Button (replaces the old Close button) */}
          <TouchableOpacity
            onPress={() => {
              setFullProfile(true);
            }}
            style={{
              flex: 1,
              marginLeft: 8,
              backgroundColor: "#2ecc71",
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>View Full</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  <Modal
    visible={fullProfile}
    transparent={false}
    onRequestClose={() => setFullProfile(false)}
  >
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      
      {/* Header with Back Button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 25,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderColor: "#e0e0e0",
          backgroundColor: "#b9ffdcff",
        }}
      >
        <TouchableOpacity onPress={() => setFullProfile(false)}>
          <MaterialIcons
            name="keyboard-arrow-left"
            size={34}
            color="#003f30ff"
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginLeft: 12,
            color: "#003f30ff",
            bottom: 2,
          }}
        >
          Clinic Profile
        </Text>
      </View>

      <ScrollView>

      {/* Cover Photo and Profile Picture */}
      <View>
        <View
          style={{
            width: isMobile ? "95%" : "60%",
            height: 200,
            alignSelf: "center",
            marginTop: isMobile ? 8 : 26,
            borderRadius: 10,
            backgroundColor: "#d9d9d9",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 125,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: selectedClinicImage }}
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              borderWidth: 4,
              borderColor: "#fff",
              backgroundColor: "#e0e0e0",
            }}
          />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={{ flex: 1, padding: 16, paddingTop: 90 }}>

        
        
        <View style={{paddingLeft: isMobile ? null : "20%", paddingRight: isMobile ? null : "20%"}}>

        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#003f30",
            marginBottom: 10,
          }}
        >
          Clinic Details
        </Text>

        {/* Clinic Info Container */}
        <View
          style={{
            backgroundColor: "#f8f9f9",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 6, color: "#222" }}>
            {selectedClinicName || "Unnamed Clinic"}
          </Text>
          <Text style={{ fontSize: 14, color: "#2a4d4d", marginBottom: 6 }}>
            {verified ? "✅ Verified Clinic" : "❌ Unverified Clinic"}
          </Text>
          <Text style={{ fontSize: 14, color: "#0b5a51", fontStyle: "normal", marginBottom: 6 }}>
            {selectedClinicEmail}
          </Text>
          <Text style={{ fontSize: 14, fontStyle: "italic", color: "#2a594d", marginBottom: 12 }}>
            {selectedClinicSlogan || ""}
          </Text>

          <Text style={{ fontSize: 14, marginBottom: 4 }}>📍 {selectedClinicAddress || "No address provided"}</Text>
          <Text style={{ fontSize: 14, marginBottom: 4 }}>📞 {selectedClinicMobile || "No contact"}</Text>
          <Text style={{ fontSize: 14, marginBottom: 4 }}>🗓️ Joined: {selectedClinicCreatedAt || "N/A"}</Text>
          <Text style={{ fontSize: 14 }}>
            🦷 Dentist Availability: {selectedClinicDentist ? "Yes" : "No"}
          </Text>
        </View>
        

        {/* Clinic Details Title */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#003f30",
            marginBottom: 10,
          }}
        >
          Introduction
        </Text>

        {/* Clinic Info Container */}
        <View
          style={{
            backgroundColor: "#f8f9f9",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: selectedCI ? 17 : 14,
              marginBottom: 6,
              color: selectedCI ? "#222" : "#ccc",
              textAlign: selectedCI ? "left" : "center",
            }}
          >
            {selectedCI || "introduction have not yet been set"}
          </Text>
        </View>


        {/* Clinic Offers */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#003f30",
            marginBottom: 10,
          }}
        >
          Offers
        </Text>

        {/* Clinic Info Container */}
        <View
          style={{
            backgroundColor: "#f8f9f9",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: selectedOffers ? 17 : 14,
              marginBottom: 6,
              color: selectedOffers ? "#222" : "#ccc",
              textAlign: selectedOffers ? "left" : "center",
            }}
          >
            {selectedOffers && selectedOffers.trim() !== '' ? (
              selectedOffers
                .split('?')
                .filter(offer => offer.trim() !== '')
                .map((offer, i) => (
                  <Text key={i}>
                    {'• ' + offer}
                    {'\n'}
                  </Text>
                ))
            ) : (
              "offers have not yet been set"
            )}
          </Text>
        </View>

        

        {/* Clinic Schedule Title */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#003f30",
            marginBottom: 10,
          }}
        >
          Clinic Schedule
        </Text>

        {/* Schedule Container */}
        {/* Clinic Schedule Container */}
        <View
          style={{
            backgroundColor: "#f8f9f9",
            borderRadius: 12,
            padding: 16,
            marginBottom: 200,
            elevation: 3, // shadow for Android
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >

          {/* Schedule Grid */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            {[
              { label: "Sun", time: selectedSunday },
              { label: "Mon", time: selectedMonday },
              { label: "Tue", time: selectedTuesday },
              { label: "Wed", time: selectedWednesday },
              { label: "Thu", time: selectedThursday },
              { label: "Fri", time: selectedFriday },
              { label: "Sat", time: selectedSaturday },
            ].map((day) => {
              const hasValidTime = day.time && day.time.from && day.time.to;
              const formattedTime = hasValidTime
                ? {
                    ...day.time,
                    from: {
                      ...day.time.from,
                      minute: day.time.from.minute?.toString().padStart(2, "0"),
                    },
                    to: {
                      ...day.time.to,
                      minute: day.time.to.minute?.toString().padStart(2, "0"),
                    },
                  }
                : undefined;

              return (
                <View
                  key={day.label}
                  style={{
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "600", fontSize: isMobile ? 12 : 15, marginBottom: 4 }}>
                    {day.label}
                  </Text>
                  {formattedTime ? (
                    <Text
                      style={{
                        fontSize: isMobile ? 9 : 14,
                        color: "#444",
                        textAlign: "center",
                      }}
                    >
                      {`${formattedTime.from.hour
                        .toString()
                        .padStart(2, "0")}:${formattedTime.from.minute} ${formattedTime.from.atm} - ${formattedTime.to.hour
                        .toString()
                        .padStart(2, "0")}:${formattedTime.to.minute} ${formattedTime.to.atm}`}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: isMobile ? 11 : 14,
                        color: "#b33",
                        fontStyle: "italic",
                        textAlign: "center",
                      }}
                    >
                      Closed
                    </Text>
                  )}
                </View>
              );
            })}
  </View>

          {/* No schedule fallback */}
          {[
            selectedSunday,
            selectedMonday,
            selectedTuesday,
            selectedWednesday,
            selectedThursday,
            selectedFriday,
            selectedSaturday,
          ].every((day) => !day || !day.from || !day.to) && (
            <Text
              style={{
                color: "#999",
                fontSize: 14,
                textAlign: "center",
                marginTop: 12,
              }}
            >
              No schedule available
            </Text>
          )}
        </View>
        </View>

      </ScrollView>
      </ScrollView>
      

      {/* Action Buttons1 at Bottom */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "#b9ffdcff",
        }}
      >

        <TouchableOpacity
          onPress={() => setModalMap(true)}
          style={{
            backgroundColor: "#f39c12",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>View in Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>

</View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: isMobile ? 15 : 18,
                            marginBottom: 6,
                          }}
                        >
                          {clinic.clinic_name || "Unnamed Clinic"}
                        </Text>
                        <Text style={{ marginBottom: 2, fontSize: isMobile ? 13 : 16 }}>
                          {clinic.address || "No address provided"}
                        </Text>
                        <Text style={{ color: "#555", fontSize: isMobile ? 13 : 16 }}>
                          {clinic.mobile_number || "No Contact Number"}
                        </Text>
                      </View>
                    </View>

                    {/* Right side: Buttons */}
                    <View style={{ flex: 3, justifyContent: "space-around" }}>
                      <TouchableOpacity
                        onPress={() => {
                          console.log(`Proceed to map: ${clinic.id}`);
                          setSelectedClinicId(clinic.id);
                          setModalMap(true);
                          setMapView([clinic.longitude, clinic.latitude]);
                        }}
                        style={{
                          backgroundColor: "#0058aaff",
                          paddingVertical: 12,
                          paddingHorizontal: 10,
                          borderRadius: 10,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: isMobile ? 9 : 14,
                            textAlign: "center",
                          }}
                        >
                          Check in Map
                        </Text>
                      </TouchableOpacity>

                      {/* Modal: Map View */}
                      <Modal
                        transparent
                        animationType="fade"
                        visible={modalMap}
                        onRequestClose={() => {
                          setMessageToClinic(undefined);
                          setModalMap(false);
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: "rgba(0, 0, 0, 0)",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 20,
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "white",
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor: "rgba(214, 214, 214, 1)",
                              padding: 20,
                              alignItems: "center",
                              width: !isMobile ? "90%" : "100%",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 24,
                                fontWeight: "bold",
                                marginBottom: 20,
                                alignSelf: isMobile ? "center" : "flex-start",
                                color: "#003f30ff",
                              }}
                            >
                              Map
                            </Text>
                            {(mapView[0] || mapView[1]) ? (
                              <MapPickerView
                                pinLongitude={mapView[0]}
                                pinLatitude={mapView[1]}
                                allowEdit={false}
                              />
                            ) : (
                              <Text>No map provided by the clinic</Text>
                            )}
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#e74c3c",
                                paddingVertical: 10,
                                paddingHorizontal: 15,
                                borderRadius: 8,
                                marginTop: 10,
                                minHeight: 20,
                              }}
                              onPress={() => setModalMap(false)}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                close
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>
                    </View>
                  </LinearGradient>
                ))}
              </View>
            )}

            </ScrollView>
          </View>
        </View>
        )}

        {/* Dashboard Appointments --------------------------------------------------------------------------------------- */}

        {dashboardView === "appointments" && (
        <View
          style={[
            styles.dashboard,
            {
              width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
              right: dashboardView === "appointments" ? 11 : 20000,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              alignSelf: isMobile ? "center" : "flex-start",
              color: "#003f30ff",
            }}
          >
            Appointments
          </Text>
          <View style={{ flex: 1, width: "100%" }}>
            <FlatList
              data={appointmentsCurrentList}
              keyExtractor={(e) => e.id}
              style={{ width: "100%" }} // ensure FlatList itself fills parent
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: "stretch", // <-- always stretch so header/rows fill width
                paddingHorizontal: 12,
              }}
              ListHeaderComponent={() => (
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "#e0e0e0",
                    padding: 20,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    alignSelf: "stretch", // make header fill available width
                  }}
                >
                  <Text style={{ flex: 1, fontWeight: "700" }}>Patient</Text>
                  <Text style={{ flex: 1, fontWeight: "700" }}>Message</Text>
                  <Text style={{ flex: 1, fontWeight: "700" }}>Request</Text>
                  <Text style={{ flex: 1, fontWeight: "700" }}>
                    Request Date & Time
                  </Text>
                  <Text style={{ flex: 1, fontWeight: "700" }}>Created At</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderColor: "#ccc",
                    padding: 20,
                    backgroundColor: "#f9f9f9",
                    alignSelf: "stretch",
                  }}
                >
                  <Text style={{ flex: 1 }}>
                    {wrapText(
                      `${item.profiles.first_name} ${item.profiles.last_name}`,
                      40
                    )}
                  </Text>
                  {item.message.length > 20 ? (
                    <Text style={{ textAlign: "left", flex: 1 }}>
                      <Text style={{ color: "#000" }}>
                        {item.message.slice(0, 20) + "..."}
                      </Text>
                      <Text
                      onPress={() => {
                        setSelectedMessage(item.message);
                        setModalMessage(true);
                      }} style={{ color: "blue", textDecorationLine: "underline" }}>
                        See More
                      </Text>
                    </Text>
                  ) : (
                    <Text style={{ flex: 1 }}>
                      {item.message}
                    </Text>
                  )}
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => openRequestView(item.request)}
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                View Request
              </Text>
            </TouchableOpacity>
                  {/* requestView Modal */}
            <Modal
              visible={requestViewVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setRequestViewVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "80%",
                    backgroundColor: "white",
                    borderRadius: 8,
                    padding: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 18,
                      marginBottom: 12,
                    }}
                  >
                    Requested Dentists/Staff
                  </Text>

                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 20,
                      textAlign: "center",
                      whiteSpace: "pre-line", // helps to show new lines if any
                    }}
                  >
                    {selectedRequest.map((line, i) => (
                      <Text key={i}>
                        {line}
                        {"\n"}
                      </Text>
                    ))}
                  </Text>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#007bff",
                      paddingVertical: 10,
                      paddingHorizontal: 30,
                      borderRadius: 6,
                    }}
                    onPress={() => setRequestViewVisible(false)}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
                  <Text style={{ flex: 1 }}>
                    {`${new Date(item.date_time).toLocaleString(undefined, {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}`}
                  </Text>
                  <Text style={{ flex: 1 }}>
                    {new Date(item.created_at || 0).toLocaleString()}
                  </Text>
                </View>
              )}
              ListEmptyComponent={() => (
                // full-width wrapper that centers the "no items" text
                <View
                  style={{ width: "100%", alignItems: "center", marginTop: 40 }}
                >
                  <Text style={{ fontSize: 20, color: "gray" }}>
                    - No Appointments -
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
        )}

        {/* Dashboard Pending --------------------------------------------------------------------------------------- */}

        {dashboardView === "pending" && (
        <View
          style={[
            styles.dashboard,
            {
              width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
              right: dashboardView === "pending" ? 11 : 20000,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              alignSelf: isMobile ? "center" : "flex-start",
              color: "#003f30ff",
            }}
          >
            Requests
          </Text>
          <FlatList
            data={appointmentsList}
            keyExtractor={(e) => e.id}
            style={{ width: "100%" }}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "stretch", // <-- always stretch so header/rows fill width
              paddingHorizontal: 12,
            }}
            ListHeaderComponent={() => (
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#ffe680",
                  padding: 20,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  alignSelf: "stretch",
                }}
              >
                <Text style={{ flex: 1, fontWeight: "700" }}>Patient</Text>
                <Text style={{ flex: 1, fontWeight: "700" }}>Request Date & Time</Text>
                <Text style={{ flex: 1, fontWeight: "700" }}>Message</Text>
                <Text style={{ flex: 1, fontWeight: "700" }}>Request</Text>
                <Text style={{ flex: 1, fontWeight: "700" }}>Created At</Text>
                <Text
                  style={{ flex: 1, fontWeight: "700", textAlign: "center" }}
                >
                  Action
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderColor: "#ccc",
                  padding: 20,
                  backgroundColor: "#fffce9ff",
                }}
              >
                {/* Patient */}
                <Text style={{ flex: 1 }}>
                  {wrapText(
                    `${item.profiles.first_name} ${item.profiles.last_name}`,
                    40
                  )}
                </Text>

                {/* Date & Time */}
                <Text style={{ flex: 1 }}>
                  {`${new Date(item.date_time).toLocaleString(undefined, {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}`}
                </Text>

                {/* Message */}
                {item.message.length > 20 ? (
                  <Text style={{ textAlign: "left", flex: 1 }}>
                    <Text style={{ color: "#000" }}>
                      {item.message.slice(0, 20) + "..."}
                    </Text>
                    <Text
                    onPress={() => {
                      setSelectedMessage(item.message);
                      setModalMessage(true);
                    }} style={{ color: "blue", textDecorationLine: "underline" }}>
                      See More
                    </Text>
                  </Text>
                  ) : (
                    <Text style={{ flex: 1 }}>
                      {item.message}
                    </Text>
                  )}

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => openRequestView(item.request)}
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                View Request
              </Text>
            </TouchableOpacity>
                  {/* requestView Modal */}
            <Modal
              visible={requestViewVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setRequestViewVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "80%",
                    backgroundColor: "white",
                    borderRadius: 8,
                    padding: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 18,
                      marginBottom: 12,
                    }}
                  >
                    Requested Dentists/Staff
                  </Text>

                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 20,
                      textAlign: "center",
                      whiteSpace: "pre-line", // helps to show new lines if any
                    }}
                  >
                    {selectedRequest.map((line, i) => (
                      <Text key={i}>
                        {line}
                        {"\n"}
                      </Text>
                    ))}
                  </Text>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#007bff",
                      paddingVertical: 10,
                      paddingHorizontal: 30,
                      borderRadius: 6,
                    }}
                    onPress={() => setRequestViewVisible(false)}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

                {/* Created At */}
                <Text style={{ flex: 1 }}>
                  {new Date(item.created_at || 0).toLocaleString()}
                </Text>

                {/* Action Buttons */}
                <View
                  style={{
                    flex: 1,
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setRejectAppointmentID(item.id)}
                    style={{
                      backgroundColor: "red",
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12, textAlign: 'center' }}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => acceptAppointment(item.id)}
                    style={{
                      backgroundColor: "green",
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12, textAlign: 'center' }}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{ width: "100%", alignItems: "center", marginTop: 40 }}
              >
                <Text style={{ fontSize: 20, color: "gray" }}>
                  - No Pending -
                </Text>
              </View>
            }
          />
        </View>
        )}

        {/* Dashboard history --------------------------------------------------------------------------------------- */}

          {dashboardView === "history" && (
            <View
              style={[
                styles.dashboard,
                {
                  width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
                  right: dashboardView === "history" ? 11 : 20000,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 20,
                  alignSelf: isMobile ? "center" : "flex-start",
                  color: "#003f30ff",
                }}
              >
                History
              </Text>

              <TouchableOpacity
                onPress={() => setDownloadModal(true)}
                style={{
                  backgroundColor: "#007AFF",
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  Download History Excel
                </Text>
              </TouchableOpacity>

              <Modal
                visible={downloadModal}
                transparent
                animationType="fade"
                onRequestClose={() => setDownloadModal(false)}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      padding: 24,
                      width: "100%",
                      maxWidth: 400,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
                      Confirm Download
                    </Text>
                    <Text
                      style={{ fontSize: 16, marginBottom: 24, textAlign: "center" }}
                    >
                      Are you sure you want to download the history?
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setDownloadModal(false)}
                        style={{
                          backgroundColor: "#ccc",
                          paddingVertical: 10,
                          paddingHorizontal: 20,
                          borderRadius: 8,
                          flex: 1,
                          marginRight: 10,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setDownloadModal(false);
                          handleDownloadExcel(appointmentsPast ?? []);
                        }}
                        style={{
                          backgroundColor: "#007AFF",
                          paddingVertical: 10,
                          paddingHorizontal: 20,
                          borderRadius: 8,
                          flex: 1,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 16 }}>Download</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              <FlatList
                data={appointmentsPast}
                keyExtractor={(e) => e.id}
                style={{ width: "100%" }}
                contentContainerStyle={{
                  flexGrow: 1,
                  alignItems: "stretch",
                  paddingHorizontal: 12,
                }}
                ListHeaderComponent={() => (
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#e0e0e0",
                      padding: 20,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      alignSelf: "stretch",
                    }}
                  >
                    <Text style={{ flex: 1, fontWeight: "700" }}>Patient</Text>
                    <Text style={{ flex: 1, fontWeight: "700" }}>Request Date & Time</Text>
                    <Text style={{ flex: 1, fontWeight: "700" }}>Message</Text>
                    <Text style={{ flex: 1, fontWeight: "700" }}>Request</Text>
                    <Text style={{ flex: 1, fontWeight: "700" }}>Status</Text>
                    <Text style={{ flex: 1, fontWeight: "700" }}>Rejection Note</Text>
                    <Text style={{ flex: 1, fontWeight: "700" }}>Created At</Text>
                    <Text style={{ flex: 1, fontWeight: "700" }}>Attendance</Text> {/* NEW */}
                  </View>
                )}

                renderItem={({ item }) => (
                  <View
                    style={{
                      flexDirection: "column",
                      borderBottomWidth: 1,
                      borderColor: "#ccc",
                      padding: 20,
                      backgroundColor: item.isAccepted ? "#e4ffe0" : "#ffe0e0",
                      alignSelf: "stretch",
                    }}
                  >
                    <View style={{ flexDirection: "row" }}>
                      {/* Patient */}
                      <Text style={{ flex: 1 }}>
                        {`${item.profiles.first_name} ${item.profiles.last_name}`}
                      </Text>

                      {/* Request Date & Time */}
                      <Text style={{ flex: 1 }}>
                        {new Date(item.date_time).toLocaleString(undefined, {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>

                      {/* Message */}
                      {item.message.length > 20 ? (
                        <Text style={{ textAlign: "left", flex: 1 }}>
                          <Text style={{ color: "#000" }}>
                            {item.message.slice(0, 20) + "..."}
                          </Text>
                          <Text
                            onPress={() => {
                              setSelectedMessage(item.message);
                              setModalMessage(true);
                            }}
                            style={{ color: "blue", textDecorationLine: "underline" }}
                          >
                            See More
                          </Text>
                        </Text>
                      ) : (
                        <Text style={{ flex: 1 }}>{item.message}</Text>
                      )}

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => openRequestView(item.request)}
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                View Request
              </Text>
            </TouchableOpacity>
                  {/* requestView Modal */}
            <Modal
              visible={requestViewVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setRequestViewVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "80%",
                    backgroundColor: "white",
                    borderRadius: 8,
                    padding: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 18,
                      marginBottom: 12,
                    }}
                  >
                    Requested Dentists/Staff
                  </Text>

                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 20,
                      textAlign: "center",
                      whiteSpace: "pre-line", // helps to show new lines if any
                    }}
                  >
                    {selectedRequest.map((line, i) => (
                      <Text key={i}>
                        {line}
                        {"\n"}
                      </Text>
                    ))}
                  </Text>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#007bff",
                      paddingVertical: 10,
                      paddingHorizontal: 30,
                      borderRadius: 6,
                    }}
                    onPress={() => setRequestViewVisible(false)}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

                      {/* Status */}
                      <Text style={{ flex: 1 }}>
                        {item.isAccepted ? "Accepted" : "Rejected"}
                      </Text>

                      {/* Rejection Note */}
                      <Text style={{ flex: 1 }}>
                        {item.isAccepted === false
                          ? item.rejection_note || "No rejection note"
                          : "-"}
                      </Text>

                      {/* Created At */}
                      <Text style={{ flex: 1 }}>
                        {new Date(item.created_at || 0).toLocaleString()}
                      </Text>

                      {/* Attended Status Column */}
                      <Text style={{ flex: 1 }}>
                        {item.isAttended === true
                          ? "Attended"
                          : item.isAttended === false
                          ? "Not Attended"
                          : "Not Attended"}
                      </Text>
                    </View>

                    {item.isAccepted === true && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          marginTop: 10,
                          gap: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => attendedAppointment(item.id)}
                          style={{
                            backgroundColor: "#4CAF50",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "600" }}>Attended</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => notAttendedAppointment(item.id)}
                          style={{
                            backgroundColor: "#F44336",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "600" }}>
                            Not Attended
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                  </View>
                )}

                ListEmptyComponent={() => (
                  <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                    <Text style={{ fontSize: 20, color: "gray" }}>- No History -</Text>
                  </View>
                )}
              />
            </View>
          )}


        {/* Dashboard Chats --------------------------------------------------------------------------------------- */}

        {dashboardView === "chats" && (
        <View
          style={[
            styles.dashboard,
            {
              width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
              right: dashboardView === "chats" ? 11 : 20000,
            },
          ]}
        >
          <ChatView role="clinic"/>
        </View>
        )}

        {/* Dashboard verification --------------------------------------------------------------------------------------- */}

        {dashboardView === "verify" && (
          <View
            style={[
              styles.dashboard,
              {
                width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
                right: dashboardView === "verify" ? 11 : 20000,
                padding: 20,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 20,
                alignSelf: isMobile ? "center" : "flex-start",
                color: "#003f30ff",
              }}
            >
              Verification
            </Text>

            {/* Introduction Section */}
            <View style={{justifyContent: "center", alignItems: "center", flex: 1, padding: 10, backgroundColor: "#f7f7f7ff", borderRadius: 16, marginTop: -10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,}}>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "bold",
                  marginBottom: 20,
                  alignSelf: "center",
                  justifyContent: "center",
                  color: "#003f30ff",
                }}
              >
                VERIFY YOUR CLINIC!
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#444",
                  marginBottom: 20,
                  lineHeight: 22,
                }}
              >
                Verified clinics build more trust with patients. When your clinic is verified:
                {"\n"}• Patients are able to create an appointment.
                {"\n"}• You can set your clinic's operating hours and location.
                {"\n"}• Your clinic is highlighted as trustworthy and authentic.
              </Text>

              {/* Upload Area */}
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  padding: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: !!verified ? "#edffe8ff" : !!requestVerification ? "#fffde8ff" : "#f9f9f9",
                  marginBottom: 20,
                }}
              >
                {!!verified && (
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#003f30ff", textAlign: "center"  }}>
                    Your Clinic is Verified
                  </Text>
                )}
                {!!requestVerification && (
                  <Text style={{ color: "#666", textAlign: "center"  }}>
                    Your verification request is pending. Please wait for admin approval. Thank you!
                  </Text>
                )}
                {!verified && !requestVerification && (
                  <Text style={{ marginBottom: 10, color: "#666", textAlign: "center"  }}>
                    Optional: Uploading a photo of Business Permit helps verify your clinic's legitimacy fast.
                  </Text>
                )}

                  {!!verifyPhoto && (
                      <Image
                          source={{ uri: typeof verifyPhoto === 'object' ? verifyPhoto.uri : verifyPhoto }}
                          style={{ width: 200, height: 150, borderRadius: 10, marginBottom: 15 }}
                          resizeMode="cover"
                      />
                  )}

                  {/* Replace with actual upload logic later */}
              {!verified && !requestVerification && (
                  <TouchableOpacity
                    onPress={async () => {
                      handlePickVerifyPhoto(); // Existing logic to pick a photo
                    }}
                    style={{
                      backgroundColor: "#e0f2f1",
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: "#00796b" }}>
                      {!!verifyPhoto ? "Change Photo" : "Upload Photo"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {denialReason ? (
                <Text style={{ color: "red", marginBottom: 10, marginTop: -2, textAlign: "center" }}>
                  Your clinic has been denied.
                  {"\n"}Reason: {denialReason}
                </Text>
              ) : null}

              {/* Verify Button */}
              {!verified && !requestVerification && (
                <TouchableOpacity
                  onPress={() => setShowVerifyModal(true)}
                  style={{
                    backgroundColor: "#00796b",
                    paddingVertical: 12,
                    paddingHorizontal: 30,
                    borderRadius: 8,
                    alignSelf: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>Verify</Text>
                </TouchableOpacity>
              )}
                <Modal
                  visible={showVerifyModal}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowVerifyModal(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        padding: 20,
                        width: "80%",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          marginBottom: 10,
                          textAlign: "center",
                        }}
                      >
                        Do you want to verify your clinic?
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: 20,
                          gap: 20,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => setShowVerifyModal(false)}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: "#00796b",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <Text style={{ color: "#00796b" }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={async () => {
                            if (!verifyPhoto) {
                              setShowVerifyModal(false);
                              setNeedDTIModal(true); // Show the custom modal instead
                              return;
                            }

                            setShowVerifyModal(false);
                            setRequestVerification(true);
                            setDenialReason("");

                            handleVerificationSubmit();

                            const { error } = await supabase
                              .from("clinic_profiles")
                              .update({ 
                                request_verification: true,
                                denied_verification_reason: null,
                                license_photo_url: verifyPhoto.uri || verifyPhoto,
                              })
                              .eq("id", session?.user.id);

                            if (error) {
                              console.error("Failed to request verification:", error.message);
                            }
                          }}

                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 6,
                            backgroundColor: "#00796b",
                          }}
                        >
                          <Text style={{ color: "#fff" }}>Verify</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
                        <Modal
                          visible={needDTIModal}
                          transparent
                          animationType="fade"
                          onRequestClose={() => setNeedDTIModal(false)}
                        >
                          <View
                            style={{
                              flex: 1,
                              backgroundColor: "rgba(0,0,0,0.5)",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: "white",
                                borderRadius: 10,
                                padding: 20,
                                width: "80%",
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  marginBottom: 10,
                                  textAlign: "center",
                                }}
                              >
                                Upload Required
                              </Text>

                              <Text
                                style={{
                                  fontSize: 14,
                                  color: "#555",
                                  textAlign: "center",
                                  marginBottom: 20,
                                }}
                              >
                                You must upload a valid photo of your DTI/Business Permit before verifying your clinic.
                              </Text>

                              <TouchableOpacity
                                onPress={() => setNeedDTIModal(false)}
                                style={{
                                  paddingVertical: 10,
                                  paddingHorizontal: 20,
                                  borderRadius: 6,
                                  backgroundColor: "#00796b",
                                }}
                              >
                                <Text style={{ color: "#fff" }}>Okay</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </Modal>
            </View>
          </View>
        )}


        {/* Dashboard Team --------------------------------------------------------------------------------------- */}

        {dashboardView === "team" && (
        <View
          style={[
            styles.dashboard,
            {
              width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
              right: dashboardView === "team" ? 11 : 20000,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              alignSelf: isMobile ? "center" : "flex-start",
              color: "#003f30ff",
            }}
          >
            About Us
          </Text>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View
      style={{
        padding: 20,
        backgroundColor: "#f7f7f7ff",
        borderRadius: 16,
        marginTop: -10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* Tagline */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 10,
          textAlign: "center",
          color: "#003f30",
        }}
      >
        Explore Dental Clinics Around San Jose Delmonte Bulacan!
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#444",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        We believe that a confident smile and healthy teeth are best achieved
        when guided by expertise.
      </Text>

      {/* Purpose */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 10,
          color: "#003f30",
          textAlign: "center",
        }}
      >
        Our Purpose
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#555",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        This platform was created to bridge the gap between patients and
        trusted dental clinics in SJDM, Caloocan, and Metro Manila.
      </Text>

      <View style={{ alignSelf: "center", marginTop: 20, marginBottom: 20 }}>
        {/* Benefits */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 12,
            color: "#003f30",
            textAlign: "left",
          }}
        >
          Platform Benefits
        </Text>
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{ fontSize: 16, fontWeight: "600", color: "#00796b" }}
          >
            • Streamline Dental Appointment Scheduling
          </Text>
          <Text
            style={{ fontSize: 14, color: "#555", marginBottom: 10 }}
          >
            Provide a seamless, user-friendly platform for patients to book,
            reschedule, and cancel appointments anytime, anywhere.
          </Text>

          <Text
            style={{ fontSize: 16, fontWeight: "600", color: "#00796b" }}
          >
            • Improve Patient Experience Through Accessible Services
          </Text>
          <Text
            style={{ fontSize: 14, color: "#555", marginBottom: 10 }}
          >
            Instant booking, reminders, and access to records help patients
            save time and reduce wait times.
          </Text>

          <Text
            style={{ fontSize: 16, fontWeight: "600", color: "#00796b" }}
          >
            • AR Tools for Patient Engagement
          </Text>
          <Text style={{ fontSize: 14, color: "#555" }}>
            Preview treatments and learn with Augmented Reality for better
            understanding and trust.
          </Text>
        </View>

        {/* Topics */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 12,
            color: "#003f30",
            textAlign: "left",
          }}
        >
          Covered Topics
        </Text>
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{ fontSize: 16, fontWeight: "600", color: "#00796b" }}
          >
            • Finding the Right Clinic Near You
          </Text>
          <Text
            style={{ fontSize: 14, color: "#555", marginBottom: 10 }}
          >
            Browse trusted clinics in San Jose Del Monte Bulacan with full
            profiles, services, and schedules.
          </Text>

          <Text
            style={{ fontSize: 16, fontWeight: "600", color: "#00796b" }}
          >
            • Common Dental Concerns, Easy Solutions
          </Text>
          <Text
            style={{ fontSize: 14, color: "#555", marginBottom: 10 }}
          >
            From toothaches to check-ups, our hub addresses common oral
            health needs.
          </Text>

          <Text
            style={{ fontSize: 16, fontWeight: "600", color: "#00796b" }}
          >
            • Book Your Appointment Online
          </Text>
          <Text style={{ fontSize: 14, color: "#555" }}>
            Skip the calls — schedule your appointments digitally with ease.
          </Text>
        </View>
      </View>

      {/* Trusted Clinics */}
      <Text style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
        Trusted by 7+ Dental Clinics around San Jose Delmonte Bulacan
      </Text>

      {/* Modal Trigger */}
      <TouchableOpacity
        onPress={() => setTermsOfUse(true)}
        style={{
          marginTop: 30,
          backgroundColor: "#00796b",
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 10,
          alignSelf: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Terms of Use
        </Text>
      </TouchableOpacity>
    </View>

          <View
            style={{
              padding: 20,
              backgroundColor: "#f7f7f7ff",
              borderRadius: 16,
              marginTop: 20,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                marginBottom: 20,
                textAlign: "center",
                color: "#003f30",
              }}
            >
              Meet the Team
            </Text>

            <View
              style={{
                alignItems: "center",
                marginBottom: 30,
                backgroundColor: "#f0fff0",
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Image
                source={
                  require("../../assets/team/migueldel.png") // fallback/default image
                }
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: "#00bcd4",
                  backgroundColor: "#eaeaea",
                }}
              />

              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Miguel Del Rosario
              </Text>
              <Text style={{ fontSize: 16, color: "#555" }}>
                Project Manager
              </Text>
            </View>
            <View
              style={{
                alignItems: "center",
                marginBottom: 30,
                backgroundColor: "#f0fff0",
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Image
                source={
                  require("../../assets/team/paala.png") // fallback/default image
                }
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: "#00bcd4",
                  backgroundColor: "#eaeaea",
                }}
              />

              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Paala James
              </Text>
              <Text style={{ fontSize: 16, color: "#555" }}>
                Programmer Specialist
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                marginBottom: 30,
                backgroundColor: "#f0fff0",
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Image
                source={
                  require("../../assets/team/elbert.png") // fallback/default image
                }
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: "#00bcd4",
                  backgroundColor: "#eaeaea",
                }}
              />

              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Elbert Rosales
              </Text>
              <Text style={{ fontSize: 16, color: "#555" }}>
                Quality Assurance
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                marginBottom: 30,
                backgroundColor: "#f0fff0",
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Image
                source={
                  require("../../assets/team/rex.png") // fallback/default image
                }
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: "#00bcd4",
                  backgroundColor: "#eaeaea",
                }}
              />

              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Rex Carlo Rosales
              </Text>
              <Text style={{ fontSize: 16, color: "#555" }}>
                System Analyst
              </Text>
              </View>
            </View>
          </ScrollView>
        </View>
        )}
      {/* Modal */}
      <Modal
        visible={termsOfUse}
        transparent
        onRequestClose={() => setTermsOfUse(false)}
      >
        <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            width: "90%",
            padding: 20,
            borderRadius: 16,
            maxHeight: "80%",
          }}
        >
<ScrollView>
  <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#003f30" }}>
    SMILE STUDIO: Terms of Use
  </Text>
  <Text style={{ fontSize: 14, marginBottom: 10, color: "#444" }}>
    <Text style={{ fontWeight: "bold" }}>Last Updated:</Text> May 8, 2025{"\n"}
    <Text style={{ fontWeight: "bold" }}>Effective Immediately</Text>
  </Text>

  <Text style={{ fontSize: 14, color: "#444", lineHeight: 22 }}>
    By accessing or using Smile Studio: A Cross-Platform Dental Appointment System with AR Teeth and Braces Filter for Dental Patients in San Jose Del Monte, Bulacan, owned and operated by Scuba Scripter and Pixel Cowboy Team, you agree to be legally bound by these Terms of Use. These Terms govern your use of Smile Studio, a web-based and mobile system designed for managing dental appointments with notification-based follow-up reminders.{"\n\n"}

    If you do not agree with any part of these Terms, you must immediately cease all use of the Platform. Continued access constitutes unconditional acceptance of these Terms and any future modifications.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>1. Definitions{"\n"}</Text>
    • “Appointment” – A scheduled dental consultation booked through Smile Studio.{"\n"}
    • “No-Show” – Failure to attend a booked Appointment without prior cancellation.{"\n"}
    • “Grace Period” – A 15-minute window after a scheduled Appointment time during which a late arrival may still be accommodated.{"\n"}
    • “Malicious Activity” – Any action that disrupts, exploits, or harms the Platform, its users, or affiliated clinics (e.g., hacking, fake bookings, harassment).{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>2. Eligibility & Account Registration{"\n"}</Text>
    <Text style={{ fontWeight: "bold" }}>2.1 Age Requirement</Text>{" "}
    The Platform is accessible to users of all ages but is currently intended for non-commercial, academic/capstone project use only.{"\n"}
    Minors (under 18) must obtain parental/guardian consent before booking Appointments.{"\n"}
    <Text style={{ fontWeight: "bold" }}>2.2 Account Responsibility</Text>{" "}
    Users must provide accurate, current, and complete information during registration. You are solely responsible for:{"\n"}
    • Maintaining the confidentiality of your login credentials.{"\n"}
    • All activities conducted under your account.{"\n"}
    • Immediately notifying us of any unauthorized account use.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>3. Permitted & Prohibited Use{"\n"}</Text>
    <Text style={{ fontWeight: "bold" }}>3.1 Acceptable Use</Text>{" "}
    You may use Smile Studio only for lawful purposes, including:{"\n"}
    • Booking legitimate dental Appointments at partner clinics in San Jose Del Monte, Bulacan.{"\n"}
    • Accessing clinic information, availability, location, pricing, services, and notification assistance.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>3.2 Strictly Prohibited Conduct</Text>{" "}
    Violations will result in immediate account suspension or termination. You agree NOT to:{"\n"}
    • Create fake or duplicate Appointments (e.g., under false names).{"\n"}
    • Engage in hacking, phishing, or data scraping (automated or manual).{"\n"}
    • Harass clinic staff or other users (e.g., trolling, abusive messages).{"\n"}
    • Upload malicious software (viruses, spyware) or disrupt server operations.{"\n"}
    • Misrepresent your identity or medical needs.{"\n"}
    • Circumvent appointment limits (e.g., creating multiple accounts).{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>4. Appointment Policies{"\n"}</Text>
    <Text style={{ fontWeight: "bold" }}>4.1 Booking & Cancellation</Text>{" "}
    • Appointments operate on a “First-Appoint, First-Served” basis.{"\n"}
    • No downpayment is required (“Appoint Now, Pay Later”).{"\n"}
    • Cancellations must be made at least 24 hours in advance via the Platform.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>4.2 No-Show & Late Arrival Policy</Text>{" "}
    • Notification Reminders: Users receive automated alerts before their scheduled Appointment.{"\n"}
    • Grace Period: A 15-minute late arrival window is permitted. After this:{"\n"}
      • The Appointment is automatically forfeited.{"\n"}
      • The slot is released to other patients.{"\n"}
      • The User must reschedule.{"\n"}
    Strike System:{"\n"}
    • 1st No-Show = Warning (User is notified of policy violation).{"\n"}
    • 2nd No-Show = 1-month Account Suspension.{"\n"}
    Suspended accounts cannot book new Appointments but may still view clinic information.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>4.3 Clinic Cancellations</Text>{" "}
    Partner clinics reserve the right to reschedule or cancel Appointments due to unforeseen circumstances such as dentist unavailability, equipment failure, or emergencies. Patients will be promptly notified via the Platform’s notification system.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>5. Medical Disclaimer & Patient Responsibilities{"\n"}</Text>
    <Text style={{ fontWeight: "bold" }}>5.1 Non-Emergency Use</Text>{" "}
    Smile Studio is not intended for medical emergencies. If you are experiencing severe pain, bleeding, infection, or urgent dental issues, please call 911 (Philippine hotline: 117) or proceed to the nearest emergency facility.{"\n"}
    <Text style={{ fontWeight: "bold" }}>5.2 Patient Honesty</Text>{" "}
    Patients must provide truthful and complete medical information when booking and attending Appointments.{"\n"}
    <Text style={{ fontWeight: "bold" }}>5.3 AR Filter Disclaimer</Text>{" "}
    The AR Teeth and Braces Filter is for illustrative and educational purposes only. It is not a substitute for professional dental advice or treatment planning.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>6. Intellectual Property Rights{"\n"}</Text>
    <Text style={{ fontWeight: "bold" }}>6.1 Ownership</Text>{" "}
    All text, graphics, logos, clinic data, AR filters, and notification software are the exclusive property of Smile Studio and its partner clinics.{"\n"}
    <Text style={{ fontWeight: "bold" }}>6.2 Limited License</Text>{" "}
    Users are granted a revocable, non-exclusive license to access the Platform for personal, non-commercial healthcare purposes.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>7. Privacy & Data Security{"\n"}</Text>
    Our Privacy Policy explains how we collect, store, and protect your data. By using the Platform, you agree to its terms.{"\n"}
    <Text style={{ fontWeight: "bold" }}>7.1 Confidentiality</Text>{" "}
    All medical information shared during Appointments is protected under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).{"\n"}
    <Text style={{ fontWeight: "bold" }}>7.2 Data Retention</Text>{" "}
    Patient data, including appointment records, is stored for a maximum of 12 months for reporting and scheduling purposes. After this period, data is securely deleted in compliance with Philippine law.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>8. Disclaimers & Limitation of Liability{"\n"}</Text>
    <Text style={{ fontWeight: "bold" }}>8.1 No Medical Guarantees</Text>{" "}
    Smile Studio is not a healthcare provider. We do not guarantee diagnosis accuracy, treatment outcomes, or clinic availability.{"\n"}
    <Text style={{ fontWeight: "bold" }}>8.2 Platform “As Is”</Text>{" "}
    The Platform may experience downtime, bugs, or delays.{"\n"}
    <Text style={{ fontWeight: "bold" }}>8.3 No Financial Liability</Text>{" "}
    We do not charge users and do not handle payments, medical services, or clinic operations.{"\n"}
    We are not liable for:{"\n"}
    • User misconduct (e.g., no-shows, fake bookings).{"\n"}
    • Clinic errors (e.g., overbooking, misdiagnosis).{"\n"}
    • Indirect damages (e.g., lost time, travel costs).{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>9. Feedback & Complaints{"\n"}</Text>
    Users may provide feedback or file complaints regarding clinics, services, or system errors by contacting Smile Studio Support.     Reports of unprofessional conduct by clinics or users will be reviewed, and appropriate action may include warnings, suspensions, or termination of accounts.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>10. Termination & Enforcement{"\n"}</Text>
    <Text style={{ fontWeight: "bold" }}>10.1 By Smile Studio</Text>{" "}
    We may suspend or terminate accounts for:{"\n"}
    • Breach of these Terms (e.g., fake Appointments, harassment).{"\n"}
    • Malicious Activity (e.g., hacking attempts).{"\n"}
    • Excessive No-Shows (per Section 4.2).{"\n"}
    <Text style={{ fontWeight: "bold" }}>10.2 By Users</Text>{" "}
    You may deactivate your account at any time by contacting: (+63) 921-888-1835{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>11. Governing Law & Dispute Resolution{"\n"}</Text>
    These Terms are governed by Philippine law (Republic Act No. 10173, Data Privacy Act of 2012).{"\n"}
    Disputes must first undergo mediation in San Jose Del Monte, Bulacan.{"\n"}
    Unresolved disputes will be settled in Philippine courts.{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>12. Contact Information{"\n"}</Text>
    Smile Studio Support{"\n"}
    Scuba Scripter and Pixel Cowboy Team{"\n"}
    (+63) 921-888-1835{"\n"}
    San Jose Del Monte, Bulacan, Philippines{"\n\n"}

    <Text style={{ fontWeight: "bold" }}>Acknowledgment{"\n"}</Text>
    By creating an account or booking an Appointment through Smile Studio, you acknowledge that you have read, understood, and agreed to these Terms of Use.
  </Text>
</ScrollView>

          <TouchableOpacity
            onPress={() => setTermsOfUse(false)}
            style={{
              marginTop: 20,
              backgroundColor: "#003f30",
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </Modal>


      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {},
  glider: {
    flex: 1,
    borderBottomEndRadius: 30,
    borderTopEndRadius: 30,
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    padding: 60,
    justifyContent: "flex-start",
    alignItems: "center", // Make it higher than dashboard
    width: 380,
    elevation: 5,
    shadowColor: "#00000045",
    shadowRadius: 1,
    shadowOffset: { width: 6, height: 6 },
  },
  toggleButtonWrapper: {
    left: 0,
    top: 50,
    height: 20,
    marginLeft: 20,
    overflow: "hidden",
  },
  dashboard: {
    position: "absolute",
    right: 11,
    height: "90%",
    marginTop: 40,
    padding: 14,
    shadowColor: "#00000045",
    shadowRadius: 2,
    shadowOffset: { width: 4, height: 4 },
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    alignContent: "center",
  },
  mar2: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 0,
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000000ff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonTextUpdate: {
    color: "#000000ff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  contentsmenu: {
    shadowColor: "#00000045",
    shadowRadius: 2,
    shadowOffset: { width: 2, height: 2 },
    borderRadius: 3,
    borderColor: "rgba(0, 0, 0, 1)",
    width: "100%",
    padding: 5,
    textAlign: "center",
    marginBottom: 15,
    backgroundColor: "rgba(163, 255, 202, 1)",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 50,
    resizeMode: "contain",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "nowrap",
    width: "100%",
    paddingHorizontal: 8,
  },
  card: {
    flex: 1,
    marginHorizontal: 8,
    height: 240,
    backgroundColor: "#ffffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  infoSection: {
    flex: 1,
    padding: 16,
    backgroundColor: "#e6f7ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b3e5fc",
    marginHorizontal: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  proinfo: {
    flexDirection: "column", // stack children vertically
    justifyContent: "flex-start", // align from top to bottom
    alignItems: "center", // center horizontally
    marginBottom: 20,
    flexWrap: "nowrap",
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 5, // add some vertical padding
    minHeight: 150, // ensure space for multiple items
  },
  redButton: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText1: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "20%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "white",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  avatarText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
