import { useSession } from "@/lib/SessionContext";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Platform,
  FlatList,
  ActionSheetIOS,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { Calendar, Agenda } from "react-native-calendars";
import DateTimePicker from "@react-native-community/datetimepicker";
import CalendarPicker from "@/components/CalendarPicker";
import TimePicker from "@/components/TimePicker";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import MapPickerView from "../view/MapPickerView";
import DayScheduleView from "../view/DayScheduleView";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import ChatView from "../view/ChatView";
import { useChatRoom } from "@/hooks/useChatRoom";
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import * as Sharing from 'expo-sharing';
import AsyncStorage from "@react-native-async-storage/async-storage";
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

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
  isAttended: boolean | null;
};

type Dentist = {
  name: string;
  specialty: string;
  weeklySchedule: Record<string, string[]>;
};

export default function Account() {
  const { session, isLoading, signOut } = useSession();
  const router = useRouter();
  const date = new Date();

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showInvalidTimeModal, setShowInvalidTimeModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [moved, setMoved] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [clinicCount, setClinicCount] = useState<number | null>(null);
  const { width } = useWindowDimensions();

  const isMobile = width < 480;
  const isTablet = width >= 480 && width < 768;
  const isDesktop = width >= 768;
  const drawerWidth = isMobile ? 370 : isTablet ? 300 : 350;

  const offset = moved ? -320 : 0;
  const mobbutoffset = moved ? -305 : 0;

  const [fullProfile, setFullProfile] = useState(false);
  const [viewFirst, setviewFirst] = useState(false);
  const [warn, setWarn] = useState(false);
  const [ban, setBan] = useState(false);
  const [viewClinic, setviewClinic] = useState(false);
  const [aIndicator, setaIndicator] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSignout, setModalSignout] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [modalAppoint, setModalAppoint] = useState(false);
  const [modalMap, setModalMap] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(date);
  const [dashboardView, setDashboardView] = useState("profile");

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
  const [clinicList, setClinicList] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>();
  const [messageToClinic, setMessageToClinic] = useState<string>("");
  const [isOthersChecked, setIsOthersChecked] = useState(false);
  const [showOthersModal, setShowOthersModal] = useState(false);
  const [tempMessage, setTempMessage] = useState(""); // For editing in modal

  const [showOutOfScheduleModal, setShowOutOfScheduleModal] = useState(false);
  const [appointmentsList, setAppointmentList] = useState<Appointment[]>();
  const [appointmentsCurrentList, setAppointmentCurrentList] =
    useState<Appointment[]>();
  const [appointmentsPast, setAppointmentPast] = useState<Appointment[]>();
  const [appointmentName, setappointmentName] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [modalMessage, setModalMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [termsOfUse, setTermsOfUse] = useState(false);
  const [selectedCI, setSelectedCI] = useState("");
  const [selectedOffers, setSelectedOffers] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [downloadModal, setDownloadModal] = useState(false);
  const [showTooCloseModal, setShowTooCloseModal] = useState(false);
  const [verified, setVerified] = useState(false);
  const [offerList, setOfferList] = useState<string>("");
  const COOLDOWN_KEY = "last_appointment_time";
  const [lastAppointmentTime, setLastAppointmentTime] = useState<Date | null>(null);
  const [cooldownModalVisible, setCooldownModalVisible] = useState(false);
  const [remainingCooldownTime, setRemainingCooldownTime] = useState(0); // In seconds
  const [showCloseTimeModal, setShowCloseTimeModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [tempSelectedReasons, setTempSelectedReasons] = useState([...selectedReasons]);
  const toggleTempReason = (reason) => {
    setTempSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDentistModal, setShowDentistModal] = useState(false);

  const [selectedDentists, setSelectedDentists] = useState([]);
  const [dentistList, setDentistList] = useState<Dentist[]>([]);
  const [tempSelectedDentists, setTempSelectedDentists] = useState<string[]>([]);

  const toggleTempDentist = (name: string) => {
    setTempSelectedDentists((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };
  const parsedDentistList = typeof dentistList === "string" ? JSON.parse(dentistList) : dentistList || [];
  const fixedRoles = ["Receptionist", "Dental Practice Owner"];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // 👇 Local state to toggle expanded dentist schedule
  const [expandedDentistIndex, setExpandedDentistIndex] = useState<number | null>(null);

  const toggleSchedule = (index) => {
    setExpandedDentistIndex(prev => (prev === index ? null : index));
  };
  const today = new Date().toLocaleString("en-US", { weekday: "long" }); // e.g. "Monday"
  const [unavailableDentists, setUnavailableDentists] = useState<string[]>([]);
  const [showDentistUnavailableModal, setShowDentistUnavailableModal] = useState(false);
  const [showDentistRequiredModal, setShowDentistRequiredModal] = useState(false);
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




  const offersArray = typeof offerList === "string"
    ? offerList.split("?")
    : Array.isArray(offerList)
    ? offerList
    : [];

// Load cooldown from storage when modal opens
useEffect(() => {
  if (!modalAppoint) return;

  (async () => {
    const storedTime = await AsyncStorage.getItem(COOLDOWN_KEY);
    if (storedTime) {
      setLastAppointmentTime(new Date(storedTime));
    }
  })();
}, [modalAppoint]);

// Live countdown effect for cooldown modal
useEffect(() => {
  if (!cooldownModalVisible || remainingCooldownTime <= 0) return;

  const interval = setInterval(() => {
    setRemainingCooldownTime((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setCooldownModalVisible(false);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [cooldownModalVisible]);

  const [mapView, setMapView] = useState<
    [number | undefined, number | undefined]
  >([undefined, undefined]);

  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionChecked, setPermissionChecked] = useState(false);

  const [tMap, setTMap] = useState(false);

  const { createOrFindRoom } = useChatRoom();

  const chatWithClinic = async(clinicId : string)=>{
    if(!session?.user?.id) return;

    const roomId = await createOrFindRoom(session?.user.id, clinicId);
    console.log(roomId)
  }

  const isWithinClinicSchedule = (
    appointmentDate: Date,
    schedules: (DayScheduleType | undefined)[]
  ): boolean => {
    const dayIndex = appointmentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const schedule = schedules[dayIndex];

    if (!schedule || !schedule.hasSchedule || !schedule.from || !schedule.to) {
      return false;
    }

    const to24Hour = (hour: number, atm: "AM" | "PM") => {
      if (atm === "AM") return hour === 12 ? 0 : hour;
      return hour === 12 ? 12 : hour + 12;
    };

    const fromHour24 = to24Hour(schedule.from.hour, schedule.from.atm);
    const toHour24 = to24Hour(schedule.to.hour, schedule.to.atm);

    const fromTotalMinutes = fromHour24 * 60 + (schedule.from.minute ?? 0);
    const toTotalMinutes = toHour24 * 60 + (schedule.to.minute ?? 0);

    const appointmentHour = appointmentDate.getHours();
    const appointmentMinute = appointmentDate.getMinutes();
    const appointmentTotalMinutes = appointmentHour * 60 + appointmentMinute;

    return (
      appointmentTotalMinutes >= fromTotalMinutes &&
      appointmentTotalMinutes <= toTotalMinutes
    );
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
      .eq("patient_id", session?.user.id)
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
      .eq("patient_id", session?.user.id)
      .eq("isAccepted", true)
      .gt("date_time", nowUTC.toISOString())
      .order("date_time", { ascending: true }); // 👈 ASCENDING (closest first)

    if (error) {
      console.error("Error fetching appointments:", error.message);
      return [];
    }

    console.log("Appointments with names:", data);
    setAppointmentCurrentList(data);
    return data;
  };

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
      .eq("patient_id", session?.user.id)
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
  // 111
  useEffect(() => { 
    async function fetchClinics() {
      try {
        const { data, error } = await supabase
        .from("clinic_profiles")
        .select(`*, clinic_schedule(*)`);

        if (error) throw error;
        setClinicList(data || []);

        console.log(data);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      }
    }

    fetchClinics();
  }, []);
  

  useEffect(() => {
    fetchAppointments();
    getProfile();
  }, [session]);

useEffect(() => {
  if (!session?.user?.id) return;

  // Initial fetch
  fetchAppointments(); // This already triggers current + past
  getProfile();

  const channel = supabase
    .channel("appointments-changes")
    .on(
      "postgres_changes",
      {
        event: "*", // "INSERT", "UPDATE", "DELETE"
        schema: "public",
        table: "appointments",
      },
      (payload) => {
        console.log("🔄 Realtime appointment change:", payload);

        // Re-fetch all derived data on change
        fetchAppointments();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [session?.user?.id]);


  useEffect(() => {
    async function loadUserCount() {
      try {
        const { count, error } = await supabase
          .from("profiles")
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

  useEffect(() => {
    if (isMobile) {
      setMoved(true);
    }
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(
          `id, username, website, avatar_url, role, last_name, first_name, isFirst, isWarning, isBan, notif_message`
        ) // Include role here
        .eq("id", session?.user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
        setRole(data.role || null);
        setLastname(data.last_name);
        setFirstname(data.first_name);
        setNotifMessage(data.notif_message || "");

        if (data.isFirst !== viewFirst) {
          setviewFirst(true);
        }
        if (data.isWarning !== warn) {
          setWarn(true);
        }
        if (data.isBan !== ban) {
          setBan(true);
        }

        console.log(warn);

        // Redirect based on role
        if (data.role === "admin") {
          router.push("/accAdmin");
        } else if (data.role === "clinic") {
          router.push("/accClinic");
          console.log('TRANSFERRED');
        }
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

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

const createAppointment = async (
  client_id: string,
  datetime: Date,
  message: string,
  request: string
) => {
  // Step 1: Check if session user id is available
  if (!session?.user?.id) {
    console.error("No session user ID found");
    return null;
  }

  // Step 2: Log the data being inserted for debugging
  console.log("Creating appointment with:", {
    clinic_id: client_id,
    patient_id: session.user.id,
    date_time: datetime.toISOString(),
    message: message,
    request: tempSelectedDentists
  });

  // Step 3: Attempt the insert with detailed logging of result
  const result = await supabase
    .from("appointments")
    .insert([
      {
        clinic_id: client_id,      // Clinic ID must exist in clinic_profiles
        patient_id: session.user.id,  // Patient ID from authenticated user
        date_time: datetime.toISOString(),
        message: message,
        request: tempSelectedDentists
      },
    ])
    .select();

  // Step 4: Check for errors and log results
  if (result.error) {
    console.error("Error inserting appointment:", result.error.message);
    return null;
  }

  console.log("Inserted appointment:", result.data);

  // Step 5: Refresh appointments after successful insert (if applicable)
  await fetchAppointments();

  // Step 6: Return inserted data
  return result.data;
};


  const handleUploadAvatar = async (file: File | Blob | string) => {
    try {
      if (!session) throw new Error("No session available");

      // 1️⃣ Detect file extension
      let fileExt = "png";
      if (typeof file === "string") {
        const match = file.match(/^data:(image\/\w+);/);
        fileExt = match ? match[1].split("/")[1] : "png";
      } else if (typeof File !== "undefined" && file instanceof File) {
        // Only runs on web
        fileExt = file.name.split(".").pop() ?? "png";
      } else if (file instanceof Blob && file.type) {
        fileExt = file.type.split("/")[1] ?? "png";
      }

      // 2️⃣ Normalize to Blob
      let fileData: Blob;
      if (typeof file === "string") {
        // Convert base64 string → Blob
        const base64 = file.split(",")[1];
        const byteChars = atob(base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileData = new Blob([byteArray], { type: `image/${fileExt}` });
      } else {
        // ✅ Works both on web (File) and mobile (Blob)
        fileData = file as Blob;
      }

      // 3️⃣ Create unique path
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // 4️⃣ Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileData, { upsert: true });

      if (uploadError) throw uploadError;

      // 5️⃣ Get Public URL (bucket must be set to "public")
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error("Failed to get public URL");

      // 6️⃣ Save to profile table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      // 7️⃣ Update local state
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

type OptionKey =
  | 'teethCheckUp'
  | 'cavitiesRemoval'
  | 'chippedOrCracked'
  | 'braces'
  | 'others';

const optionsList: { label: string; key: OptionKey }[] = [
  { label: 'Teeth Check Up', key: 'teethCheckUp' },
  { label: 'Cavities Removal', key: 'cavitiesRemoval' },
  { label: 'Chipped or Cracked Teeth', key: 'chippedOrCracked' },
  { label: 'Braces', key: 'braces' },
  { label: 'Others', key: 'others' },
];


const toggleReason = (reason: string) => {
  setSelectedReasons((prev) => {
    const updated = prev.includes(reason)
      ? prev.filter((r) => r !== reason)
      : [...prev, reason];

    // Rebuild full messageToClinic
    const combined = [...updated];
    if (isOthersChecked && tempMessage.trim()) {
      combined.push(tempMessage.trim());
    }
    setMessageToClinic(combined.join(", "));

    return updated;
  });
};


type Appointment = {
  id: string;
  created_at: string;
  clinic_id: string;
  patient_id: string;
  date_time: string;
  message: string;
  clinic_profiles: {
    clinic_name: string;
    dentists?: { first_name: string; last_name: string }[];
  };
  profiles: { first_name: string; last_name: string };
  isAccepted: boolean | null;
  rejection_note: string;
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
    Dentist: item.clinic_profiles?.dentists?.length
      ? item.clinic_profiles.dentists
          .map(d => `${d.first_name} ${d.last_name}`)
          .join(', ')
      : 'No dentists listed',
    Request: (() => {
      try {
        return JSON.parse(item.request).join(', ');
      } catch {
        return item.request || 'No request data';
      }
    })(),
    'Request Date & Time': new Date(item.date_time).toLocaleString(),
    Message: item.message,
    Status:
      item.isAccepted === true
        ? 'Accepted'
        : item.isAccepted === false
        ? 'Rejected'
        : 'Pending',
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
    const { saveAs } = await import('file-saver');
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'history.xlsx');
  } else {
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
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Excel',
        UTI: 'com.microsoft.excel.xlsx',
      });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error exporting file');
    }
  }
};



function getMinutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function getScheduleMinutes(schedule: ClockScheduleType): number {
  const hour = schedule.hour % 12 + (schedule.atm === "PM" ? 12 : 0);
  return hour * 60 + schedule.minute;
}

function isAtLeast30MinsBeforeClosing(appointment: Date, closing: ClockScheduleType): boolean {
  const appointmentMins = getMinutesSinceMidnight(appointment);
  const closingMins = getScheduleMinutes(closing);
  return appointmentMins <= closingMins - 30;
}

  return ( 
    <LinearGradient
      colors={["#ffffffff", "#6ce2ffff"]}
      style={{
        flex: 1,
        justifyContent: "center",
        flexDirection: isMobile ? "column" : "row",
        width: "100%",
        position: "relative",
      }}
    >
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              width: isMobile ? '90%' : '40%',
              backgroundColor: '#f1f5f9',
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
                color: "#00505cff",
              }}
            >
              Hello! Welcome to Smile Studio!
            </Text>
            <FontAwesome5 name="user-edit" size={isMobile ? 75 : 150} color="#59819aff" />
            <Text
              style={{
                fontSize: 16,
                marginBottom: 20,
                alignSelf: "center",
                color: "#1f5474ff",
                textAlign: 'center',
              }}
            >
              wanna edit/setup your information? let me guide you!
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
                backgroundColor: '#fff',
                padding: 10,
                borderRadius: 5,
                marginVertical: 5,
                width: '100%',
                alignItems: 'center',
              }}
              onPress={async () => {
                try {
                  // Update `isFirst` to false in Supabase
                  const { error } = await supabase
                    .from('profiles')
                    .update({ isFirst: false })
                    .eq('id', session?.user.id); // Use the current user's ID

                  if (error) {
                    console.error('Failed to update isFirst:', error.message);
                    Alert.alert('Error', 'Failed to update your profile.');
                    return;
                  }

                  // Close the modal locally
                  setviewFirst(false);
                } catch (err) {
                  console.error('Unexpected error:', err);
                  Alert.alert('Error', 'Something went wrong.');
                }
              }}
            >
              <Text style={{ color: '#00505cff', fontWeight: 'bold' }}>I'll pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#00505cff',
                padding: 10,
                borderRadius: 5,
                marginVertical: 5,
                width: '100%',
                alignItems: 'center',
              }}
              onPress={async () => {
                try {
                  // Update `isFirst` to false in Supabase
                  const { error } = await supabase
                    .from('profiles')
                    .update({ isFirst: false })
                    .eq('id', session?.user.id); // Use the current user's ID

                  if (error) {
                    console.error('Failed to update isFirst:', error.message);
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
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Sure!</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>
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
              backgroundColor: '#f1f5f9',
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
                color: "#00505cff",
              }}
            >
              WARNING!
            </Text>
            <Entypo name="warning" size={isMobile? 75 : 150} color="#d7c41aff" />
            <Text
              style={{
                fontSize: 16,
                alignSelf: "center",
                color: "#00505cff",
                fontWeight: "bold",
                textAlign: 'center',
              }}
            >
              The reason why you are seeing this is that you have violated our community guidelines.
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 30,
                alignSelf: "center",
                color: "#1f5474ff",
                textAlign: 'center',
              }}
            >
              Admin: {notifMessage}
            </Text>
            <Text
              style={{
                fontSize: 16,
                alignSelf: "center",
                color: "#1f5474ff",
                textAlign: 'center',
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
                backgroundColor: '#00505cff',
                padding: 10,
                borderRadius: 5,
                marginVertical: 5,
                width: '100%',
                alignItems: 'center',
              }}
              onPress={async () => {
                  const { error } = await supabase
                    .from('profiles')
                    .update({ isWarning: false })
                    .eq('id', session?.user.id); // Use the current user's ID

                  setWarn(false);
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', }}>Understood and Close</Text>
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
              backgroundColor: '#f1f5f9',
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
                color: "#00505cff",
                textAlign: 'center',
              }}
            >
              Your account has been banned!
            </Text>
            <FontAwesome name="ban" size={isMobile ? 75 : 150} color="#a31b0cff" />
            <Text
              style={{
                fontSize: 16,
                alignSelf: "center",
                color: "#00505cff",
                fontWeight: "bold",
                textAlign: 'center',
              }}
            >
              The reason why you are seeing this is that you have violated our community guidelines.
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 30,
                alignSelf: "center",
                color: "#1f5474ff",
                textAlign: 'center',
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

            <TouchableOpacity
              style={{
                backgroundColor: '#00505cff',
                padding: 10,
                borderRadius: 5,
                marginVertical: 5,
                width: '100%',
                alignItems: 'center',
              }}
              onPress={async () => {
                setModalSignout(true)
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
            </TouchableOpacity>
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
              zIndex: 100,
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
          }}
          colors={['#80c4c4ff', '#009b84ff']}
        >
          <View style={{ flex: 1, width: "100%" }}>
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
          {(isMobile) && (
            <View style={[{ height: 60}]}>
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: 'transparent',
                  alignSelf: 'flex-end',
                  left: 60,
                  borderRadius: 10,
                  zIndex: 9999,
                }}
                onPress={() => {
                  setMoved((prev) => !prev);
                  setExpanded((prev) => !prev);
                }}
                disabled={loading}
              >
                {moved ? (
                  <MaterialIcons name="keyboard-arrow-right" size={34} color="#00505cff" />
                ) : (
                  <MaterialIcons name="keyboard-arrow-left" size={34} color="#00505cff" />
                )}
              </TouchableOpacity>
            </View>
          )}

              <Image
                source={require("../../assets/favicon.ico.png")}
                style={{...styles.logo, marginTop: isMobile ? -50  : null}}
              />

            <Text style={{fontWeight: 'bold', fontSize: 20, marginTop: -40, color: '#00505cff', textAlign: 'center', }}>SMILE STUDIO</Text>
            <Text style={{fontSize: 12, color: '#00505cff', textAlign: 'center', marginBottom: 7, }}>GRIN CREATORS</Text>
            <View style={{padding: 7, marginLeft: 40, marginRight: 40, backgroundColor: 'white', marginBottom: 30, borderRadius: 10}}>
              <Text style={{fontSize: 12, color: '#00505cff', textAlign: 'center'}}>PATIENT</Text>
            </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#00505cff',
                    borderRadius: 12,
                    marginTop:0,
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
                      Change Photo
                    </Text>
                  )}
                </TouchableOpacity>

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
                        backgroundColor: '#f1f5f9',
                        borderRadius: 12,
                        padding: 20,
                        alignItems: "center",
                        width: !isMobile ? "25%" : "85%",
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
                        <Text style={{fontWeight: "bold", fontStyle: "italic", fontSize: 16, textAlign: "center", color: '#00505cff', marginBottom: 20}}>
                          {firstname} {lastname}
                        </Text>
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
                            backgroundColor: '#00505cff',
                            paddingVertical: 12,
                            borderRadius: 8,
                            marginRight: 8,
                          }}
                          onPress={() => setModalUpdate(false)}
                        >
                          <Text
                            style={{
                              color: '#ffffffff',
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            Close
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
                marginTop: 12,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ ...styles.container, width: "100%" }}>

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
    backgroundColor: dashboardView === "profile" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 5,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color="black" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="user" size={24} color={dashboardView === "profile" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "profile" ? '#00505cff' : '#ffffff',
        marginLeft: 8,
      }}>
        Profile
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
    backgroundColor: dashboardView === "clinics" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color="black" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="hospital-o" size={24} color={dashboardView === "clinics" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "clinics" ? '#00505cff' : '#ffffff',
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
    backgroundColor: dashboardView === "appointments" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color="black" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="calendar" size={24} color={dashboardView === "appointments" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "appointments" ? '#00505cff' : '#ffffff',
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
    backgroundColor: dashboardView === "pending" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color="black" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="clock-o" size={24} color={dashboardView === "pending" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "pending" ? '#00505cff' : '#ffffff',
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
    backgroundColor: dashboardView === "history" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color="black" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="history" size={24} color={dashboardView === "history" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "history" ? '#00505cff' : '#ffffff',
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
    backgroundColor: dashboardView === "chats" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color="black" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="comments" size={24} color={dashboardView === "chats" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "chats" ? '#00505cff' : '#ffffff',
        marginLeft: 8,
      }}>
        Chats
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
    backgroundColor: dashboardView === "team" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color="black" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="users" size={24} color={dashboardView === "team" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "team" ? '#00505cff' : '#ffffff',
        marginLeft: 8,
      }}>
        About Us
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("ar");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "ar" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color="black" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="cube" size={24} color={dashboardView === "ar" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "ar" ? '#00505cff' : '#ffffff',
        marginLeft: 8,
      }}>
        Augmented Reality
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
          {(isMobile) && (
            <View style={[styles.toggleButtonWrapper, { height: 60 }]}>
                <TouchableOpacity
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: !moved ? 'transparent' : '#00505cff',
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    zIndex: 9999,
                    shadowColor: !moved ? "transparent" : "#00000045",
                    shadowRadius: !moved ? null : 2,
                    shadowOffset: !moved ? null : { width: 2, height: 2 },
                  }}
                  onPress={() => {
                    setMoved((prev) => !prev);
                    setExpanded((prev) => !prev);
                  }}
                  disabled={loading}
                >
                  {moved ? (
                    <MaterialIcons name="keyboard-arrow-right" size={34} color= {!moved ? 'transparent' : 'white'} />
                  ) : (
                    <MaterialIcons name="keyboard-arrow-left" size={34} color= {!moved ? 'transparent' : 'white'} />
                  )}
                </TouchableOpacity>
            </View>
          )}
      </View>

      {/* Dashboard Profile */}
      <LinearGradient
        style={{ flex: 1, position: "relative" }}
        colors={['#b9d7d3ff', '#00505cff']}
      >
        {/* Dashboard Profile --------------------------------------------------------------------------------------- */}

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
                  borderWidth: 3,
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
                  marginTop: 10,
                }}
              >
                {firstname} {lastname}
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
            </View>
            {/* mymap */}
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
                  {clinicCount !== null ? clinicCount : "..."}
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 6,
                    fontSize: isMobile ? 15 : 25,
                    color: '#00505cff',
                  }}
                >
                  SJDM Clinics
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
                      style={{...styles.redButton, backgroundColor: '#00505cff'}}
                      onPress={() => setModalVisible(true)}
                    >
                      <Text
                        style={{
                          ...styles.buttonText1,
                          fontSize: isMobile ? 10 : 25,
                          color: "#fff"
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
        width: isMobile ? "90%" : "20%",
        maxHeight: "70%",
        backgroundColor: '#f1f5f9',
        paddingHorizontal: isMobile ? null : 200,
      }}
    >

      <TouchableOpacity
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          backgroundColor: "#00505cff",
          padding: 8,
          borderRadius: 50,
        }}
        onPress={() => setModalVisible(false)}
      >
        <Text style={{ fontWeight: "bold", color: "white" }}>X</Text>
      </TouchableOpacity> 

        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 20,
            alignSelf: "center",
            color: "#00505cff",
          }}
        >
          Appointments
        </Text>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          width: '100%',
        }}
      >
        <View style={{ padding: 20 }}>
          {/* Appointment Section */}
          <FlatList
            data={appointmentsCurrentList}
            keyExtractor={(e) => e.id}
            renderItem={(e) => (
              <View
                style={{
                  width: isMobile ? null : 300,
                  borderRadius: 10,
                  padding: 15,
                  backgroundColor: "#ffffffff",
                  marginBottom: 5,
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  {`Clinic Name : ${wrapText(
                    e.item.clinic_profiles.clinic_name
                  )}`}
                </Text>
                {e.item.message.length > 20 ? (
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      setSelectedMessage(e.item.message);
                      setModalMessage(true);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={{ color: "blue", textDecorationLine: "underline", marginBottom: 8 }}>
                      {e.item.message.slice(0, 20) + "..."}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ flex: 1 }}>
                    {e.item.message}
                  </Text>
                )}
                <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                  Requested Dentists/Staff :
                </Text>
                <Text>
                  {(() => {
                    try {
                      return JSON.parse(e.item.request).join("\n");
                    } catch {
                      return e.item.request;
                    }
                  })()}
                </Text>
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
                    {`Date/Time Request :\n${new Date(e.item.date_time).toLocaleString(undefined, {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}`}
                  </Text>
                </View>
                <Text style={{ color: "#767676ff", fontSize: 9, alignSelf: "flex-end" }}>
                  {`Created at : ${new Date(
                    e.item.created_at || 0
                  ).toLocaleString()}`}
                </Text>
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
                marginLeft: isMobile ? 0 : 8,
                flexWrap: "wrap",
                gap: 15,
                paddingBottom: 25,
              }}
            >
              <View
                style={{
                  flex: 1,
                  padding: 16,
                  backgroundColor: "#ffffffff",
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
                  Your Requests
                </Text>

                <FlatList
                  data={
                    isMobile
                      ? (appointmentsList ?? []).slice(0, 3)
                      : appointmentsList ?? []
                  } // 👈 safe fallback
                  keyExtractor={(e) => e.id}
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                  contentContainerStyle={{
                    gap: 10,
                    paddingBottom: 20,
                    alignItems:
                      (appointmentsList?.length ?? 0) === 0
                        ? "center"
                        : "stretch",
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
                      <Text style={{ fontWeight: "bold" }}>Clinic Name :</Text>
                      <Text>{`${e.item.clinic_profiles.clinic_name}`}</Text>

                      <Text style={{ fontWeight: "bold" }}>
                        Date & Time of Appointment :
                      </Text>
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
                          backgroundColor: "#fffce9ff",
                          borderWidth: 1,
                          borderColor: "#ffe680",
                        }}
                      >
                        <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                          Patient's Message :
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

                      <Text
                        style={{
                          textAlign: "right",
                          color: "#2c2c2cff",
                          fontSize: 10,
                        }}
                      >
                        {`Created at : ${new Date(
                          e.item.created_at || 0
                        ).toLocaleString()}`}
                      </Text>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text
                      style={{ fontSize: 20, color: "gray", marginTop: 40 }}
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
                  padding: 16,
                  backgroundColor: "#ffffffff",
                  borderRadius: 8,
                  minWidth: 200,
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
                  data={
                    isMobile
                      ? (appointmentsPast ?? []).slice(0, 3)
                      : appointmentsPast ?? []
                  } // 👈 safe fallback
                  keyExtractor={(e) => e.id}
                  style={{ flex: 1 }} // allow FlatList to take up remaining height
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                  contentContainerStyle={{
                    gap: 10,
                    paddingBottom: 20,
                    alignItems:
                      (appointmentsPast?.length ?? 0) === 0
                        ? "center"
                        : "stretch",
                  }}
                  renderItem={(e) => (
                    <View
                      style={{
                        width: "100%",
                        gap: 5,
                        padding: 5,
                        backgroundColor: e.item.isAccepted
                          ? "#e4ffe0ff"
                          : "#ffe0e0ff",
                        borderRadius: 8,
                        paddingHorizontal: 20,
                        paddingVertical: 15,
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Clinic Name :</Text>
                      <Text>{`${e.item.clinic_profiles.clinic_name} ${e.item.profiles.last_name}`}</Text>

                      <Text style={{ fontWeight: "bold" }}>Date & Time :</Text>
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

                      <View //borderfix
                        style={{
                          marginTop: 10,
                          padding: 8,
                          borderRadius: 6,
                          backgroundColor: !e.item.isAccepted
                            ? "#fff3f3"
                            : "#e9fdecff",
                          borderWidth: 1,
                          borderColor: !e.item.isAccepted
                            ? "#ffcccc"
                            : "#b6e4beff",
                        }}
                      >
                        <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                          Patient's Message :
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

                      <Text style={{ fontWeight: "bold", marginTop: 7 }}>
                        Status :
                      </Text>
                      <Text>
                        {e.item.isAccepted
                          ? "Accepted"
                          : e.item.isAccepted === false
                          ? "Rejected"
                          : "Rejected : past due"}
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
                            Clinic's Rejection Message :
                          </Text>
                          <Text>
                            {e.item.rejection_note || "No rejection note"}
                          </Text>
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

                      <Text
                        style={{
                          textAlign: "right",
                          color: "#2c2c2cff",
                          fontSize: 10,
                        }}
                      >
                        {`Created at : ${new Date(
                          e.item.created_at || 0
                        ).toLocaleString()}`}
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
              color: "#00505cff",
            }}
          >
            Clinics
          </Text>
            {/*Clinic Map View*/}
            <ScrollView
              contentContainerStyle={{
                backgroundColor: 'white',
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  ...styles.card,
                  backgroundColor: "#00505cff",
                  marginBottom: 8,
                  width: isMobile ? "91%" : "98%",
                  height: 40,
                  alignSelf: "center",
                }}
                onPress={() => {
                  setTMap(true);
                }}
              >
              <Text style={{color: 'white'}}>View All Registered Clinics in Map</Text>
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
                      {/* 222 */}
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
      setappointmentName(clinic.clinic_name);
      setMapView([clinic.longitude, clinic.latitude]);
      chatWithClinic(clinic.id);
      setSelectedCI(clinic.introduction);
      setSelectedOffers(clinic.offers);
      setOfferList(clinic.offers || []);
      setVerified(clinic.isVerified);
      setDentistList(clinic.dentists)
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
          {/* Message Button */}
          <TouchableOpacity
            onPress={() => {
              chatWithClinic(clinic.id);
              setviewClinic(false);
              setDashboardView("chats");
            }}
            style={{
              flex: 1,
              marginRight: 8,
              backgroundColor: "#3498db",
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Message</Text>
          </TouchableOpacity>

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


        {/* Clinic Dentists/Staffs Title */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#003f30",
            marginBottom: 10,
          }}
        >
          Clinic's Dentist
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

          {/* Dentists List */}
        {(() => {
          try {
            const dentists = JSON.parse(dentistList);
            return dentists.map((d, i) => (
              <View key={i} style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 14, color: "#333", fontWeight: "bold" }}>
                  • Dr. {d.name} ({d.specialty})
                </Text>

                {Object.entries(d.weeklySchedule || {}).map(([day, slots], j) =>
                  slots.length > 0 ? (
                    <View key={j} style={{ marginLeft: 12, marginTop: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: "500", color: "#555" }}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}:
                      </Text>
                      {slots.map((s, k) => (
                        <Text key={k} style={{ fontSize: 13, color: "#555", marginLeft: 8 }}>
                          - {s}
                        </Text>
                      ))}
                    </View>
                  ) : null
                )}
              </View>
            ));
          } catch {
            return (
              <Text             
                style={{
                fontSize: selectedOffers ? 17 : 14,
                marginBottom: 6,
                color: "#ccc",
                textAlign: selectedOffers ? "left" : "center",
              }}>
                Dentist list have not yet been set
              </Text>
            );
          }
        })()}

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
          onPress={() => {
            setFullProfile(false);
            setviewClinic(false);
            setDashboardView("chats");
          }}
          style={{
            backgroundColor: "#3498db",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // setSelectedClinicId(clinic.id);
            // setappointmentName(clinic.clinic_name);
            setModalAppoint(true);
          }}
          style={{
            backgroundColor: "#34db6cff",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Appoint</Text>
        </TouchableOpacity>

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
                      {/* Create Appointment */}
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedSunday(clinic.clinic_schedule[0]?.sunday || {});
                          setSelectedMonday(clinic.clinic_schedule[0]?.monday || {});
                          setSelectedTuesday(clinic.clinic_schedule[0]?.tuesday || {});
                          setSelectedWednesday(clinic.clinic_schedule[0]?.wednesday || {});
                          setSelectedThursday(clinic.clinic_schedule[0]?.thursday || {});
                          setSelectedFriday(clinic.clinic_schedule[0]?.friday || {});
                          setSelectedSaturday(clinic.clinic_schedule[0]?.saturday || {});
                          setSelectedClinicId(clinic.id);
                          setappointmentName(clinic.clinic_name);
                          setOfferList(clinic.offers || []);
                          setModalAppoint(true);
                          setDentistList(clinic.dentists)
                        }}
                        style={{
                          backgroundColor: "#00aa55",
                          paddingVertical: 12,
                          paddingHorizontal: 10,
                          borderRadius: 10,
                          alignItems: "center",
                          marginBottom: 2,
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
                          Create an Appointment
                        </Text>
                      </TouchableOpacity>

                      {/* Appointment Modal */}
                      <Modal
                        transparent
                        animationType="fade"
                        visible={modalAppoint}
                        onRequestClose={() => {
                          setModalAppoint(false);
                        }}
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
                              backgroundColor: "white",
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: "#ccc",
                              width: !isMobile ? "30%" : "90%",
                              maxHeight: "90%",
                            }}
                          >
                            <ScrollView
                              contentContainerStyle={{
                                padding: 20,
                                flexGrow: 1,
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 24,
                                  fontWeight: "bold",
                                  marginBottom: 20,
                                  alignSelf: "center",
                                  color: "#00505cff",
                                }}
                              >
                                APPOINTMENT
                              </Text>

                              <Text
                                style={{
                                  fontSize: 18,
                                  marginBottom: 20,
                                  textAlign: "center",
                                }}
                              >
                                {appointmentName}
                              </Text>

                              {/* View Clinic Schedule Button */}
                              <TouchableOpacity
                                style={{
                                  width: "100%",
                                  padding: 12,
                                  backgroundColor: "#e2e8f0",
                                  borderRadius: 6,
                                  marginBottom: 10,
                                }}
                                onPress={() => setShowScheduleModal(true)}
                              >
                                <Text style={{ textAlign: "center", color: "#333", fontWeight: "bold" }}>
                                  View Clinic Schedule
                                </Text>
                              </TouchableOpacity>

                              {/* Schedule Modal */}
                              <Modal
                                visible={showScheduleModal}
                                transparent
                                animationType="fade"
                                onRequestClose={() => setShowScheduleModal(false)}
                              >
                                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                                  <View
                                    style={{
                                      backgroundColor: "white",
                                      borderRadius: 12,
                                      padding: 20,
                                      width: isMobile ? "90%" : "40%",
                                      maxHeight: "80%",
                                      borderWidth: 1,
                                      borderColor: "#ccc",
                                    }}
                                  >
                                    <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: '#00505cff' }}>
                                      Clinic Schedule
                                    </Text>

                                    <ScrollView style={{ maxHeight: 400 }}>
                                      <View style={{ gap: 1 }}>
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
                                                      minute: day.time.from?.minute?.toString().padStart(2, "0"),
                                                    },
                                                    to: {
                                                      ...day.time.to,
                                                      minute: day.time.to?.minute?.toString().padStart(2, "0"),
                                                    },
                                                  }
                                                : undefined
                                            }
                                          />
                                        ))}

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
                                    </ScrollView>

                                    {/* Close Button */}
                                    <TouchableOpacity
                                      onPress={() => setShowScheduleModal(false)}
                                      style={{
                                        marginTop: 20,
                                        backgroundColor: "#2e7dccff",
                                        paddingVertical: 12,
                                        borderRadius: 6,
                                      }}
                                    >
                                      <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                                        Close
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </Modal>


                              {/* Date */}
                              <Text style={{ alignSelf: "flex-start", marginBottom: 5 }}>Date</Text>
                              <CalendarPicker
                                day={date.getDate()}
                                month={date.getMonth() + 1}
                                year={date.getFullYear()}
                                onDaySelect={(day, month, year) => {
                                  setAppointmentDate((prev) => {
                                    const time = new Date(prev);
                                    time.setDate(day);
                                    time.setMonth(month - 1);
                                    time.setFullYear(year);
                                    return time;
                                  });
                                }}
                              />

                              {/* Time */}
                              <Text style={{ alignSelf: "flex-start", marginBottom: 5 }}>Time</Text>
                              <TimePicker
                                minuteSkipBy={1}
                                onTimeSelected={(hh, mm, atm) => {
                                  setAppointmentDate((prev) => {
                                    const time = new Date(prev);
                                    const hourNum = Number(hh);
                                    const formatHour =
                                      atm === "AM"
                                        ? hourNum === 12 ? 0 : hourNum
                                        : hourNum === 12 ? 12 : hourNum + 12;

                                    time.setHours(formatHour);
                                    time.setMinutes(Number(mm));
                                    return time;
                                  });
                                }}
                                trigger={undefined}
                              />


{/* Choose Dentist */}
<Text style={{ alignSelf: "flex-start", marginBottom: 5, marginTop: 10 }}>
  Choose Dentist/Staff
</Text>                  

{/* Trigger Button to open Dentist Modal */}
<TouchableOpacity
  style={{
    width: "100%",
    padding: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    marginBottom: 10,
  }}
  onPress={() => {
    setTempSelectedDentists([...selectedDentists]);
    setShowDentistModal(true);
  }}
>
  <Text style={{ textAlign: "center", color: "#333", fontWeight: "bold" }}>
    Select Dentist/s, Staff...
  </Text>
</TouchableOpacity>

{/* Modal to select Dentists */}
<Modal
  visible={showDentistModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowDentistModal(false)}
>
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        width: isMobile ? "90%" : "40%",
        maxHeight: "80%",
        borderWidth: 1,
        borderColor: "#ccc",
      }}
    >
      <ScrollView>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15, color: '#00505cff' }}>
          Select Available Dentists and Staff
        </Text>

{(() => {

  return (
    <View>
      {/* Fixed Roles */}
      {fixedRoles.map((role, index) => {
        const selected = tempSelectedDentists.includes(role);
        return (
          <View key={`fixed-${index}`} style={{ marginBottom: 15 }}>
            <TouchableOpacity
              onPress={() => toggleTempDentist(role)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
            >
              <View style={{
                height: 20,
                width: 20,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#888",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
                backgroundColor: selected ? "#007bff" : "#fff",
              }}>
                {selected && <View style={{ width: 10, height: 10, backgroundColor: "#fff" }} />}
              </View>
              <Text style={{ fontWeight: "bold" }}>{role}</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Dentists List */}
      {parsedDentistList.map((dentist, index) => {
        const name = `Dr. ${dentist.name} (${dentist.specialty})`;
        const selected = tempSelectedDentists.includes(name);
        const todaySchedule = dentist?.weeklySchedule?.[today] ?? [];
        const hasTodaySchedule = todaySchedule.length > 0;

        return (
          <View key={`dentist-${index}`} style={{ marginBottom: 15 }}>
            {/* Dentist Row */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <TouchableOpacity
                onPress={() => toggleTempDentist(name)}
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: "#888",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                  backgroundColor: selected ? "#007bff" : "#fff",
                }}>
                  {selected && <View style={{ width: 10, height: 10, backgroundColor: "#fff" }} />}
                </View>
                <Text style={{ fontWeight: "bold" }}>{name}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => toggleSchedule(index)}>
                <Text style={{ fontSize: 12, color: "#007bff" }}>
                  {expandedDentistIndex === index ? "Hide" : "View"} Schedule
                </Text>
              </TouchableOpacity>
            </View>

            {/* Today’s Schedule or Warning */}
            {hasTodaySchedule ? (
              todaySchedule.map((time, i) => (
                <Text key={i} style={{ marginLeft: 30, fontSize: 12, color: "#444" }}>
                  🕒 {time}
                </Text>
              ))
            ) : (
              <Text style={{ marginLeft: 30, fontSize: 12, color: "#e67300" }}>
                ⚠️ No schedule today
              </Text>
            )}

            {/* Full Weekly Schedule */}
            {expandedDentistIndex === index && (
              <View style={{ marginTop: 6 }}>
                {daysOfWeek.map((day, i) => {
                  const schedule = dentist.weeklySchedule?.[day] || [];
                  return (
                    <Text key={i} style={{ marginLeft: 30, fontSize: 12, color: schedule.length ? "#444" : "#999" }}>
                      {day}: {schedule.length ? schedule.join(", ") : "No schedule"}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
})()}



      </ScrollView>

      {/* Buttons */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#b32020",
            paddingVertical: 12,
            borderRadius: 6,
            marginRight: 8,
          }}
          onPress={() => setShowDentistModal(false)}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#2e7dccff",
            paddingVertical: 12,
            borderRadius: 6,
            marginLeft: 8,
          }}
          onPress={() => {
            setSelectedDentists(tempSelectedDentists);
            setShowDentistModal(false);
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

                              {/* Message */}
                              <Text style={{ alignSelf: "flex-start", marginBottom: 5, marginTop: 10 }}>
                                Message to clinic: Reason of Appointment
                              </Text>

                              {/* Trigger Button to open Offer Modal */}
                              <TouchableOpacity
                                style={{
                                  width: "100%",
                                  padding: 12,
                                  backgroundColor: "#e2e8f0",
                                  borderRadius: 6,
                                  marginBottom: 10,
                                }}
                                onPress={() => {
                                  setTempSelectedReasons([...selectedReasons]);
                                  setShowOfferModal(true);
                                }}
                              >
                                <Text style={{ textAlign: "center", color: "#333", fontWeight: "bold" }}>
                                  Select Appointment Offer/s
                                </Text>
                              </TouchableOpacity>

                              <Modal
                                visible={showOfferModal}
                                transparent
                                animationType="fade"
                                onRequestClose={() => setShowOfferModal(false)}
                              >
                                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                                  <View
                                    style={{
                                      backgroundColor: "white",
                                      borderRadius: 12,
                                      padding: 20,
                                      width: isMobile ? "90%" : "40%",
                                      maxHeight: "80%",
                                      borderWidth: 1,
                                      borderColor: "#ccc",
                                    }}
                                  >
                                    <ScrollView>
                                      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15, color: '#00505cff'}}>
                                        Select Offer/s
                                      </Text>

                                      {(Array.isArray(offerList) ? offerList : offerList ? offerList.split("?") : []).map((offer) => {
                                        const trimmedOffer = offer.trim();
                                        if (!trimmedOffer) return null;

                                        return (
                                          <TouchableOpacity
                                            key={trimmedOffer}
                                            onPress={() => toggleTempReason(trimmedOffer)}
                                            style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
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
                                                backgroundColor: tempSelectedReasons.includes(trimmedOffer) ? "#007bff" : "#fff",
                                              }}
                                            >
                                              {tempSelectedReasons.includes(trimmedOffer) && (
                                                <View style={{ width: 10, height: 10, backgroundColor: "#fff" }} />
                                              )}
                                            </View>
                                            <Text>{trimmedOffer}</Text>
                                          </TouchableOpacity>
                                        );
                                      })}
                                    </ScrollView>

                                    {/* Buttons */}
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                                      <TouchableOpacity
                                        style={{
                                          flex: 1,
                                          backgroundColor: "#b32020",
                                          paddingVertical: 12,
                                          borderRadius: 6,
                                          marginRight: 8,
                                        }}
                                        onPress={() => {
                                          setShowOfferModal(false);
                                        }}
                                      >
                                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                                          Cancel
                                        </Text>
                                      </TouchableOpacity>

                                      <TouchableOpacity
                                        style={{
                                          flex: 1,
                                          backgroundColor: "#2e7dccff",
                                          paddingVertical: 12,
                                          borderRadius: 6,
                                          marginLeft: 8,
                                        }}
                                        onPress={() => {
                                          setSelectedReasons(tempSelectedReasons);
                                          setMessageToClinic(tempSelectedReasons.join(", "));
                                          setShowOfferModal(false);
                                        }}
                                      >
                                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                                          Save
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                              </Modal>

                              {/* "Others" checkbox */}
                              <View style={{ width: "100%" }}>
                                <TouchableOpacity
                                  onPress={() => {
                                    setIsOthersChecked(true);
                                    setTempMessage(tempMessage || "");
                                    setShowOthersModal(true);
                                  }}
                                  style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
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
                                      backgroundColor: isOthersChecked ? "#007bff" : "#fff",
                                    }}
                                  >
                                    {isOthersChecked && (
                                      <View style={{ width: 10, height: 10, backgroundColor: "#fff" }} />
                                    )}
                                  </View>
                                  <Text>Others</Text>
                                </TouchableOpacity>

                                {/* ✅ Combined Message Preview (selected checkboxes + others) */}
                                {messageToClinic.trim() !== "" && (
                                  <View
                                    style={{
                                      padding: 10,
                                      backgroundColor: "#f1f1f1",
                                      borderRadius: 6,
                                      marginBottom: 10,
                                      width: "100%",
                                    }}
                                  >
                                    <Text style={{ color: "#000" }}>{messageToClinic}</Text>
                                  </View>
                                )}

                                {/* Modal for "Others" input */}
                                <Modal
                                  transparent
                                  visible={showOthersModal}
                                  onRequestClose={() => setShowOthersModal(false)}
                                >
                                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                    <View
                                      style={{
                                        width: isMobile ? "80%" : "30%",
                                        backgroundColor: "white",
                                        borderRadius: 10,
                                        padding: 20,
                                        borderWidth: 1,
                                        borderColor: "#ccc",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Text style={{ fontSize: 18, marginBottom: 10 }}>
                                        Message to Clinic
                                      </Text>
                                      <TextInput
                                        value={tempMessage}
                                        onChangeText={setTempMessage}
                                        multiline
                                        style={{
                                          height: 100,
                                          width: "100%",
                                          borderColor: "#ccc",
                                          borderWidth: 1,
                                          borderRadius: 6,
                                          padding: 10,
                                          marginBottom: 20,
                                          textAlignVertical: "top",
                                        }}
                                        maxLength={350}
                                        autoFocus
                                      />

                                      <View
                                        style={{
                                          flexDirection: "row",
                                          justifyContent: "space-between",
                                          width: "100%",
                                        }}
                                      >
                                        <TouchableOpacity
                                          style={{
                                            flex: 1,
                                            marginRight: 8,
                                            backgroundColor: "#b32020",
                                            paddingVertical: 12,
                                            borderRadius: 6,
                                          }}
                                          onPress={() => {
                                            setShowOthersModal(false);
                                            setIsOthersChecked(false);
                                            setTempMessage("");

                                            // Update message with only selected reasons
                                            setMessageToClinic(selectedReasons.join(", "));
                                          }}
                                        >
                                          <Text
                                            style={{
                                              color: "white",
                                              textAlign: "center",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            Cancel
                                          </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                          style={{
                                            flex: 1,
                                            marginLeft: 8,
                                            backgroundColor: "#2e7dccff",
                                            paddingVertical: 12,
                                            borderRadius: 6,
                                          }}
                                          onPress={() => {
                                            const newMsg = tempMessage.trim();
                                            setTempMessage(newMsg);
                                            setIsOthersChecked(!!newMsg);
                                            setShowOthersModal(false);

                                            // Combine selected reasons with "others"
                                            const combined = [...selectedReasons];
                                            if (newMsg) {
                                              combined.push(newMsg);
                                            }
                                            setMessageToClinic(combined.join(", "));
                                          }}
                                        >
                                          <Text
                                            style={{
                                              color: "white",
                                              textAlign: "center",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            Save
                                          </Text>
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                  </View>
                                </Modal>
                              </View>

                              {/* Buttons */}
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  marginTop: 20,
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    flex: 1,
                                    backgroundColor: "#b32020",
                                    paddingVertical: 12,
                                    borderRadius: 8,
                                    marginRight: 8,
                                  }}
                                  onPress={() => {
                                    setMessageToClinic("");
                                    setModalAppoint(false);
                                    setIsOthersChecked(false);
                                    setTempMessage("");
                                    setSelectedReasons([]);
                                  }}
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

                                <TouchableOpacity
                                  style={{
                                    flex: 1,
                                    backgroundColor: "#2e7dccff",
                                    paddingVertical: 12,
                                    borderRadius: 8,
                                    marginLeft: 8,
                                  }}
                                  onPress={async () => {
                                    if (!selectedClinicId) return;

                                    if (!messageToClinic || !messageToClinic.trim()) {
                                      setShowMessageModal(true);
                                      return;
                                    }

                                    const now = new Date();

                                    // ✅ Check cooldown (2 minutes = 120000 ms)
                                    if (
                                      lastAppointmentTime &&
                                      now.getTime() - lastAppointmentTime.getTime() < 2 * 60 * 1000
                                    ) {
                                      const remainingMs = 2 * 60 * 1000 - (now.getTime() - lastAppointmentTime.getTime());
                                      const remainingSec = Math.ceil(remainingMs / 1000);

                                      setRemainingCooldownTime(remainingSec);
                                      setCooldownModalVisible(true);
                                      return;
                                    }

                                    if (appointmentDate < now) {
                                      setShowInvalidTimeModal(true);
                                      return;
                                    }

                                      if (!selectedDentists || selectedDentists.length === 0) {
                                        setShowDentistRequiredModal(true); // <-- show modal instead of alert
                                        return;
                                      }

                                    const { data, error } = await supabase
                                      .from("clinic_schedule")
                                      .select("*")
                                      .eq("clinic_id", selectedClinicId)
                                      .single();

                                    if (error || !data) {
                                      console.log("❌ Error fetching clinic schedule:", error);
                                      setShowOutOfScheduleModal(true);
                                      return;
                                    }

                                    const normalizeSchedule = (day) => {
                                      return day && day.from && day.to ? day : null;
                                    };

                                    const schedules = [
                                      normalizeSchedule(data.sunday),
                                      normalizeSchedule(data.monday),
                                      normalizeSchedule(data.tuesday),
                                      normalizeSchedule(data.wednesday),
                                      normalizeSchedule(data.thursday),
                                      normalizeSchedule(data.friday),
                                      normalizeSchedule(data.saturday),
                                    ];

                                    if (!isWithinClinicSchedule(appointmentDate, schedules)) {
                                      setShowOutOfScheduleModal(true);
                                      return;
                                    }

                                    const dayIndex = appointmentDate.getDay();
                                    const daySchedule = schedules[dayIndex];

                                    if (daySchedule && daySchedule.to) {
                                      const isValid = isAtLeast30MinsBeforeClosing(appointmentDate, daySchedule.to);
                                      if (!isValid) {
                                        setShowTooCloseModal(true);
                                        return;
                                      }
                                    }

                                    const diffMs = appointmentDate.getTime() - now.getTime();
                                    if (diffMs < 30 * 60 * 1000) {
                                      setShowCloseTimeModal(true);
                                      return;
                                    }

                                    // Validate dentist availability
                                    const appointmentDay = appointmentDate.toLocaleString("en-US", { weekday: "long" }); // e.g., "Monday"
                                    const appointmentTime = appointmentDate.getHours() * 60 + appointmentDate.getMinutes(); // convert to minutes

                                    // Get selected dentists only (filter out receptionist, owner)
                                    const selectedDentistNames = tempSelectedDentists.filter(name => name.startsWith("Dr."));

                                    const parsedDentistList = typeof dentistList === "string" ? JSON.parse(dentistList) : dentistList || [];

                                    // Function to convert time string to minutes since midnight
                                    const parseTimeToMinutes = (timeStr) => {
                                      const [time, meridian] = timeStr.split(" ");
                                      let [hours, minutes] = time.split(":").map(Number);
                                      if (meridian === "PM" && hours !== 12) hours += 12;
                                      if (meridian === "AM" && hours === 12) hours = 0;
                                      return hours * 60 + minutes;
                                    };

                                    let unavailableDentists = [];

                                    for (const name of selectedDentistNames) {
                                      const match = name.match(/^Dr\. (.+?) \((.+)\)$/);
                                      if (!match) continue;
                                      const [_, dentistName, specialty] = match;

                                      const dentist = parsedDentistList.find(
                                        (d) => d.name === dentistName && d.specialty === specialty
                                      );

                                      const scheduleForDay = dentist?.weeklySchedule?.[appointmentDay] || [];

                                      const isAvailable = scheduleForDay.some((slot) => {
                                        const [from, to] = slot.split(" - ");
                                        const fromMinutes = parseTimeToMinutes(from);
                                        const toMinutes = parseTimeToMinutes(to);
                                        return appointmentTime >= fromMinutes && appointmentTime <= toMinutes;
                                      });

                                      if (!isAvailable) {
                                        unavailableDentists.push(name);
                                      }
                                    }

                                    if (unavailableDentists.length > 0) {
                                      setUnavailableDentists(unavailableDentists); // you can store this in state if you want to show names
                                      setShowDentistUnavailableModal(true); // trigger a modal
                                      return;
                                    }

                                    // ✅ Create the appointment
                                    await createAppointment(selectedClinicId, appointmentDate, messageToClinic, parsedDentistList);

                                    // ✅ Save cooldown time
                                    await AsyncStorage.setItem(COOLDOWN_KEY, now.toISOString());
                                    setLastAppointmentTime(now);

                                    // ✅ Reset UI
                                    setModalAppoint(false);
                                    setaIndicator(true);
                                    setMessageToClinic("");
                                    setIsOthersChecked(false);
                                    setTempMessage("");
                                    setSelectedReasons([]);
                                  }}


                                >
                                  <Text
                                    style={{
                                      color: "white",
                                      fontWeight: "bold",
                                      textAlign: "center",
                                    }}
                                  >
                                    Appoint
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </ScrollView>
                          </View>
                        </View>
                      </Modal>

                      <Modal
                        visible={showDentistRequiredModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowDentistRequiredModal(false)}
                      >
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: isMobile ? "90%" : "40%", maxWidth: 400 }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
                              Select Dentist Required
                            </Text>
                            <Text style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
                              Please select at least one dentist before proceeding with the appointment.
                            </Text>
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#2e7dccff",
                                paddingVertical: 10,
                                borderRadius: 6,
                              }}
                              onPress={() => setShowDentistRequiredModal(false)}
                            >
                              <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                                OK
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>


                      <Modal
                        visible={showDentistUnavailableModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowDentistUnavailableModal(false)}
                      >
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 20,
                              borderRadius: 12,
                              width: isMobile ? "90%" : "40%",
                              maxWidth: 400,
                              borderColor: "#ccc",
                              borderWidth: 1,
                            }}
                          >
                            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#b32020" }}>
                              Dentist Not Available
                            </Text>

                            <Text style={{ marginBottom: 10 }}>
                              The following dentist(s) are not available on the selected date and time:
                            </Text>

                            {unavailableDentists.map((name, idx) => (
                              <Text key={idx} style={{ color: "#444", marginLeft: 10 }}>
                                • {name}
                              </Text>
                            ))}

                            <TouchableOpacity
                              onPress={() => setShowDentistUnavailableModal(false)}
                              style={{
                                marginTop: 20,
                                backgroundColor: "#2e7dccff",
                                paddingVertical: 10,
                                borderRadius: 6,
                              }}
                            >
                              <Text style={{ textAlign: "center", color: "white", fontWeight: "bold" }}>OK</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>



                      {/* too Close Appointment */}
                      <Modal
                        transparent
                        visible={showCloseTimeModal}
                        animationType="fade"
                        onRequestClose={() => setShowCloseTimeModal(false)}
                      >
                        <View style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 20,
                        }}>
                          <View style={{
                            backgroundColor: "white",
                            padding: 20,
                            borderRadius: 10,
                            width:  isMobile ? "90%" : "40%",
                            maxWidth: 400,
                            alignItems: "center",
                          }}>
                            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" }}>
                              Appointment Too Soon
                            </Text>
                            <Text style={{ fontSize: 16, marginBottom: 20, textAlign: "center" }}>
                              Appointment must be booked at least 30 minutes before the scheduled time.
                            </Text>

                            <TouchableOpacity
                              style={{
                                backgroundColor: "#2e7dccff",
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 6,
                              }}
                              onPress={() => setShowCloseTimeModal(false)}
                            >
                              <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                                OK
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>

                      {/* cooldown modal */}
                      <Modal
                        transparent
                        animationType="fade"
                        visible={cooldownModalVisible}
                        onRequestClose={() => setCooldownModalVisible(false)}
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
                              backgroundColor: "white",
                              padding: 20,
                              borderRadius: 10,
                              alignItems: "center",
                              width:  isMobile ? "90%" : "40%",
                              borderWidth: 1,
                              borderColor: "#ccc",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginBottom: 10,
                                color: "#b32020",
                                textAlign: "center",
                              }}
                            >
                              Please wait
                            </Text>

                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: "center",
                                marginBottom: 20,
                              }}
                            >
                              You can't make another appointment right now. Please wait{" "}
                              <Text style={{ fontWeight: "bold" }}>{remainingCooldownTime}</Text> seconds.
                            </Text>

                            <TouchableOpacity
                              onPress={() => setCooldownModalVisible(false)}
                              style={{
                                backgroundColor: "#2e7dccff",
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 6,
                              }}
                            >
                              <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>


                      {/* Closing Time Modal */}
                      <Modal
                        transparent
                        visible={showTooCloseModal}
                        animationType="fade"
                        onRequestClose={() => setShowTooCloseModal(false)}
                      >
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 20,
                              borderRadius: 10,
                              borderWidth: 1,
                              borderColor: "#ccc",
                              width: isMobile ? "90%" : "40%",
                              alignItems: "center",
                            }}
                          >
                            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#b32020" }}>
                              Appointment too close to closing time!
                            </Text>
                            <Text style={{ textAlign: "center", fontSize: 16 }}>
                              Please choose a time at least 30 minutes before the clinic closes.
                            </Text>
                            <TouchableOpacity
                              onPress={() => setShowTooCloseModal(false)}
                              style={{
                                marginTop: 20,
                                backgroundColor: "#2e7dcc",
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 6,
                              }}
                            >
                              <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>

                      {/* Message Required Modal */}
                      <Modal
                        transparent
                        animationType="fade"
                        visible={showMessageModal}
                        onRequestClose={() => setShowMessageModal(false)}
                      >
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 24,
                              borderRadius: 12,
                              width: isMobile ? "90%" : "40%",
                              alignItems: "center",
                              borderWidth: 1,
                              borderColor: "#ccc"
                            }}
                          >
                            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Message Required</Text>
                            <Text style={{ textAlign: "center", marginBottom: 20 }}>
                              Please write a message to the clinic before creating the appointment.
                            </Text>
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#2e7dccff",
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                              }}
                              onPress={() => setShowMessageModal(false)}
                            >
                              <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>

                      {/* Invalid Time Modal */}
                      <Modal
                        transparent
                        animationType="fade"
                        visible={showInvalidTimeModal}
                        onRequestClose={() => setShowInvalidTimeModal(false)}
                      >
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 24,
                              borderRadius: 12,
                              width: isMobile ? "90%" : "40%",
                              alignItems: "center",
                              borderWidth: 1,
                              borderColor: "#ccc"
                              
                            }}
                          >
                            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Invalid Appointment Time</Text>
                            <Text style={{ textAlign: "center", marginBottom: 20 }}>
                              You cannot create an appointment in the past. Please select a future date and time.
                            </Text>
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#2e7dccff",
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                              }}
                              onPress={() => setShowInvalidTimeModal(false)}
                            >
                              <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>

                      {/* Out of Schedule Modal */}
                      <Modal
                        transparent
                        animationType="fade"
                        visible={showOutOfScheduleModal}
                        onRequestClose={() => setShowOutOfScheduleModal(false)}
                      >
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 24,
                              borderRadius: 12,
                              width: isMobile ? "90%" : "40%",
                              alignItems: "center",
                              borderWidth: 1,
                              borderColor: "#ccc"
                            }}
                          >
                            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Outside Clinic Schedule</Text>
                            <Text style={{ textAlign: "center", marginBottom: 20 }}>
                              The clinic is closed at the selected time. Please choose a time within the clinic's working hours. You can view the Clinic's Schedule.
                            </Text>
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#2e7dccff",
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                              }}
                              onPress={() => setShowOutOfScheduleModal(false)}
                            >
                              <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>

                      {/* Success Indicator */}
                      <Modal
                        transparent
                        visible={aIndicator}
                        animationType="fade"
                        onRequestClose={() => setaIndicator(false)}
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
                              width: isMobile ? "90%" : "40%",
                              backgroundColor: "white",
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: "#ccc",
                              padding: 20,
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "600",
                                marginBottom: 20,
                                textAlign: "center",
                              }}
                            >
                              Appointment Request Successful
                            </Text>
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#007bff",
                                paddingVertical: 10,
                                paddingHorizontal: 30,
                                borderRadius: 8,
                              }}
                              onPress={() => setaIndicator(false)}
                            >
                              <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
                                OK
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>

                      {/* Map Button */}
                      <TouchableOpacity
                        onPress={() => {
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

                      {/* Map Modal */}
                      <Modal
                        transparent
                        animationType="fade"
                        visible={modalMap}
                        onRequestClose={() => {
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
                color: "#00505cff",
              }}
            >
              Appointments
            </Text>

            {isMobile ? (
              // Mobile card layout
              <ScrollView contentContainerStyle={{ paddingHorizontal: 12 }}>
                {appointmentsCurrentList.length === 0 ? (
                  <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                    <Text style={{ fontSize: 20, color: "gray" }}>- No Appointments -</Text>
                  </View>
                ) : (
                  appointmentsCurrentList.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        backgroundColor: "#f9f9f9",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: "#ccc",
                      }}
                    >
                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Clinic Name:</Text>
                      <Text style={{ marginBottom: 10 }}>{item.clinic_profiles.clinic_name}</Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Message:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {item.message.length > 20 ? (
                          <>
                            {item.message.slice(0, 20) + "... "}
                            <Text
                              onPress={() => {
                                setSelectedMessage(item.message);
                                setModalMessage(true);
                              }}
                              style={{ color: "blue", textDecorationLine: "underline" }}
                            >
                              See More
                            </Text>
                          </>
                        ) : (
                          item.message
                        )}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Request:</Text>
                      <TouchableOpacity onPress={() => openRequestView(item.request)} style={{ marginBottom: 10 }}>
                        <Text style={{ color: "#0056b3", textDecorationLine: "underline" }}>View Request</Text>
                      </TouchableOpacity>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Request Date & Time:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {new Date(item.date_time).toLocaleString(undefined, {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Created At:</Text>
                      <Text>{new Date(item.created_at || 0).toLocaleString()}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            ) : (
              // Desktop/table layout
              <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ flex: 1, minWidth: 900 }}>
                  <FlatList
                    data={appointmentsCurrentList}
                    keyExtractor={(e) => e.id.toString()}
                    contentContainerStyle={{
                      alignItems: "stretch",
                      paddingHorizontal: 12,
                    }}
                    ListHeaderComponent={() => (
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: "#00505cff",
                          paddingVertical: 16,
                          paddingHorizontal: 20,
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          minWidth: "100%",
                        }}
                      >
                        <Text style={{ flex: 1, fontWeight: "700", color: 'white' }}>Clinic Name</Text>
                        <Text style={{ flex: 1, fontWeight: "700", color: 'white' }}>Message</Text>
                        <Text style={{ flex: 1, fontWeight: "700", color: 'white' }}>Request</Text>
                        <Text style={{ flex: 1, fontWeight: "700", color: 'white' }}>Request Date & Time</Text>
                        <Text style={{ flex: 1, fontWeight: "700", color: 'white' }}>Created At</Text>
                      </View>
                    )}
                    renderItem={({ item, index }) => (
                      <View
                        style={{
                          flexDirection: "row",
                          borderBottomWidth: 1,
                          borderColor: "#ccc",
                          paddingVertical: 20,
                          paddingHorizontal: 20,
                          backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ flex: 1 }}>{item.clinic_profiles.clinic_name}</Text>

                        <Text style={{ flex: 1 }}>
                          {item.message.length > 20 ? (
                            <>
                              {item.message.slice(0, 20) + "... "}
                              <Text
                                onPress={() => {
                                  setSelectedMessage(item.message);
                                  setModalMessage(true);
                                }}
                                style={{ color: "#0056b3", textDecorationLine: "underline" }}
                              >
                                See More
                              </Text>
                            </>
                          ) : (
                            item.message
                          )}
                        </Text>

                        <TouchableOpacity style={{ flex: 1 }} onPress={() => openRequestView(item.request)}>
                          <Text style={{ color: "#0056b3", textDecorationLine: "underline" }}>View Request</Text>
                        </TouchableOpacity>

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

                        <Text style={{ flex: 1 }}>{new Date(item.created_at || 0).toLocaleString()}</Text>
                      </View>
                    )}
                    ListEmptyComponent={() => (
                      <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                        <Text style={{ fontSize: 20, color: "gray" }}>- No Appointments -</Text>
                      </View>
                    )}
                  />
                </View>
              </ScrollView>
            )}
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

            {isMobile ? (
              // Mobile card layout
              <ScrollView contentContainerStyle={{ paddingHorizontal: 12 }}>
                {appointmentsList.length === 0 ? (
                  <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                    <Text style={{ fontSize: 20, color: "gray" }}>- No Pending -</Text>
                  </View>
                ) : (
                  appointmentsList.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        backgroundColor: "#fffce9ff",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: "#ddd",
                      }}
                    >
                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Clinic Name:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {wrapText(item.clinic_profiles.clinic_name, 40)}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Patient:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {wrapText(`${item.profiles.first_name} ${item.profiles.last_name}`, 40)}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Request Date & Time:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {new Date(item.date_time).toLocaleString(undefined, {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Message:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {item.message.length > 20 ? (
                          <>
                            {item.message.slice(0, 20) + "... "}
                            <Text
                              onPress={() => {
                                setSelectedMessage(item.message);
                                setModalMessage(true);
                              }}
                              style={{ color: "#0056b3", textDecorationLine: "underline" }}
                            >
                              See More
                            </Text>
                          </>
                        ) : (
                          item.message
                        )}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Request:</Text>
                      <TouchableOpacity
                        onPress={() => openRequestView(item.request)}
                        style={{ marginBottom: 10 }}
                      >
                        <Text style={{ color: "#0056b3", textDecorationLine: "underline" }}>
                          View Request
                        </Text>
                      </TouchableOpacity>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Created At:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {new Date(item.created_at || 0).toLocaleString()}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            ) : (
              // Desktop/table layout
              <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ flex: 1, minWidth: 900 }}>
                  <FlatList
                    data={appointmentsList}
                    keyExtractor={(e) => e.id.toString()}
                    contentContainerStyle={{
                      alignItems: "stretch",
                      paddingHorizontal: 12,
                    }}
                    ListHeaderComponent={() => (
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: "#ffe680",
                          paddingVertical: 16,
                          paddingHorizontal: 20,
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          minWidth: "100%",
                        }}
                      >
                        <Text style={{ flex: 1, fontWeight: "700" }}>Clinic Name</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Patient</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Request Date & Time</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Message</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Request</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Created At</Text>
                      </View>
                    )}
                    renderItem={({ item, index }) => (
                      <View
                        style={{
                          flexDirection: "row",
                          borderBottomWidth: 1,
                          borderColor: "#ccc",
                          paddingVertical: 20,
                          paddingHorizontal: 20,
                          backgroundColor: index % 2 === 0 ? "#fffce9ff" : "#fff",
                        }}
                      >
                        <Text style={{ flex: 1 }}>{wrapText(item.clinic_profiles.clinic_name, 40)}</Text>
                        <Text style={{ flex: 1 }}>
                          {wrapText(`${item.profiles.first_name} ${item.profiles.last_name}`, 40)}
                        </Text>
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
                        <Text style={{ flex: 1 }}>
                          {item.message.length > 20 ? (
                            <>
                              {item.message.slice(0, 20) + "... "}
                              <Text
                                onPress={() => {
                                  setSelectedMessage(item.message);
                                  setModalMessage(true);
                                }}
                                style={{ color: "#0056b3", textDecorationLine: "underline" }}
                              >
                                See More
                              </Text>
                            </>
                          ) : (
                            item.message
                          )}
                        </Text>
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => openRequestView(item.request)}
                        >
                          <Text style={{ color: "#0056b3", textDecorationLine: "underline" }}>
                            View Request
                          </Text>
                        </TouchableOpacity>
                        <Text style={{ flex: 1 }}>
                          {new Date(item.created_at || 0).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    ListEmptyComponent={() => (
                      <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                        <Text style={{ fontSize: 20, color: "gray" }}>- No Pending -</Text>
                      </View>
                    )}
                  />
                </View>
              </ScrollView>
            )}
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
                color: "#00505cff",
              }}
            >
              History
            </Text>

            <TouchableOpacity
              onPress={() => setDownloadModal(true)}
              style={{
                backgroundColor: "#00505cff",
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

            {/* Download Confirmation Modal */}
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
                  <Text style={{ fontSize: 16, marginBottom: 24, textAlign: "center" }}>
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

            {isMobile ? (
              // 📱 Mobile: card-style vertical list
              <ScrollView contentContainerStyle={{ paddingHorizontal: 12 }}>
                {appointmentsPast.length === 0 ? (
                  <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                    <Text style={{ fontSize: 20, color: "gray" }}>- No History -</Text>
                  </View>
                ) : (
                  appointmentsPast.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        backgroundColor: item.isAccepted ? "#e4ffe0" : "#ffe0e0",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: "#ddd",
                      }}
                    >
                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Clinic Name:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {wrapText(item.clinic_profiles.clinic_name, 40)}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Patient:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {wrapText(item.profiles.last_name, 40)}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>
                        Request Date & Time:
                      </Text>
                      <Text style={{ marginBottom: 10 }}>
                        {new Date(item.date_time).toLocaleString(undefined, {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Message:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {item.message.length > 20 ? (
                          <>
                            {item.message.slice(0, 20) + "... "}
                            <Text
                              onPress={() => {
                                setSelectedMessage(item.message);
                                setModalMessage(true);
                              }}
                              style={{ color: "#0056b3", textDecorationLine: "underline" }}
                            >
                              See More
                            </Text>
                          </>
                        ) : (
                          item.message
                        )}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Request:</Text>
                      <TouchableOpacity
                        onPress={() => openRequestView(item.request)}
                        style={{ marginBottom: 10 }}
                      >
                        <Text style={{ color: "#0056b3", textDecorationLine: "underline" }}>
                          View Request
                        </Text>
                      </TouchableOpacity>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Status:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {item.isAccepted ? "Accepted" : "Rejected"}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Rejection Note:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {item.isAccepted === false
                          ? item.rejection_note || "No rejection note"
                          : "-"}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Created At:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {new Date(item.created_at || 0).toLocaleString()}
                      </Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Attendance:</Text>
                      <Text style={{ marginBottom: 10 }}>
                        {item.isAttended === true
                          ? "Attended"
                          : item.isAttended === false
                          ? "Not Attended"
                          : "Not Attended"}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            ) : (
              // 🖥 Desktop: table view
              <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ flex: 1, minWidth: 1000 }}>
                  <FlatList
                    data={appointmentsPast}
                    keyExtractor={(e) => e.id}
                    contentContainerStyle={{
                      alignItems: "stretch",
                      paddingHorizontal: 12,
                    }}
                    ListHeaderComponent={() => (
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: "#ffffffff",
                          paddingVertical: 16,
                          paddingHorizontal: 20,
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          minWidth: "100%",
                          gap: 16,
                        }}
                      >
                        <Text style={{ flex: 1, fontWeight: "700" }}>Clinic Name</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Patient</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Request Date & Time</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Message</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Request</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Status</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Rejection Note</Text>
                        <Text style={{ flex: 1, fontWeight: "700" }}>Created At</Text>
                        <Text style={{ flex: 1, fontWeight: "700", textAlign: "center" }}>
                          Attendance
                        </Text>
                      </View>
                    )}
                    renderItem={({ item }) => (
                      <View
                        style={{
                          flexDirection: "row",
                          borderBottomWidth: 1,
                          borderColor: "#ccc",
                          paddingVertical: 18,
                          paddingHorizontal: 20,
                          backgroundColor: item.isAccepted ? "#e4ffe0ff" : "#ffe0e0ff",
                          gap: 16,
                          alignItems: "center",
                          minWidth: "100%",
                        }}
                      >
                        {/* Clinic Name */}
                        <Text style={{ flex: 1, color: "#333" }}>
                          {wrapText(item.clinic_profiles.clinic_name, 40)}
                        </Text>

                        {/* Patient */}
                        <Text style={{ flex: 1, color: "#333" }}>
                          {wrapText(item.profiles.last_name, 40)}
                        </Text>

                        {/* Request Date & Time */}
                        <Text style={{ flex: 1, color: "#333" }}>
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
                          <Text style={{ flex: 1, color: "#000" }}>
                            {item.message.slice(0, 20) + "... "}
                            <Text
                              onPress={() => {
                                setSelectedMessage(item.message);
                                setModalMessage(true);
                              }}
                              style={{ color: "#0056b3", textDecorationLine: "underline" }}
                            >
                              See More
                            </Text>
                          </Text>
                        ) : (
                          <Text style={{ flex: 1, color: "#333" }}>{item.message}</Text>
                        )}

                        {/* Request */}
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => openRequestView(item.request)}
                        >
                          <Text style={{ color: "#0056b3", textDecorationLine: "underline" }}>
                            View Request
                          </Text>
                        </TouchableOpacity>

                        {/* Status */}
                        <Text style={{ flex: 1, color: "#333" }}>
                          {item.isAccepted ? "Accepted" : "Rejected"}
                        </Text>

                        {/* Rejection Note */}
                        <Text style={{ flex: 1, color: "#333" }}>
                          {item.isAccepted === false
                            ? wrapText(item.rejection_note || "No rejection note", 40)
                            : "-"}
                        </Text>

                        {/* Created At */}
                        <Text style={{ flex: 1, color: "#333" }}>
                          {new Date(item.created_at || 0).toLocaleString()}
                        </Text>

                        {/* Attendance */}
                        <Text style={{ flex: 1, color: "#333", textAlign: "center" }}>
                          {item.isAttended === true
                            ? "Attended"
                            : item.isAttended === false
                            ? "Not Attended"
                            : "Not Attended"}
                        </Text>
                      </View>
                    )}
                    ListEmptyComponent={
                      <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                        <Text style={{ fontSize: 20, color: "gray" }}>- No History -</Text>
                      </View>
                    }
                  />
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* Request View Modal */}
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
              padding: 16,
            }}
          >
            <View
              style={{
                width: "90%",
                maxWidth: 400,
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
                  textAlign: "center",
                }}
              >
                Requested Dentists/Staff
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 20,
                  textAlign: "center",
                  whiteSpace: "pre-line",
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
            <ChatView key={`chat-${Date.now()}`} role="patient" />
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
              color: "#00505cff",
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
          color: "#00505cff",
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
          color: "#00505cff",
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
            color: "#00505cff",
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
            color: "#00505cff",
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
          backgroundColor: "#00505cff",
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
                color: "#00505cff",
              }}
            >
              Meet the Team
            </Text>

            <View
              style={{
                alignItems: "center",
                marginBottom: 30,
                backgroundColor: "#00505cff",
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

              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginTop: 8 }}>
                Miguel Del Rosario
              </Text>
              <Text style={{ fontSize: 16, color: "white", }}>
                Project Manager
              </Text>
            </View>
            <View
              style={{
                alignItems: "center",
                marginBottom: 30,
                backgroundColor: "#00505cff",
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

              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginTop: 8 }}>
                Paala James
              </Text>
              <Text style={{ fontSize: 16, color: "white",}}>
                Programmer Specialist
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                marginBottom: 30,
                backgroundColor: "#00505cff",
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

              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginTop: 8 }}>
                Elbert Rosales
              </Text>
              <Text style={{ fontSize: 16, color: "white",}}>
                Quality Assurance
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                marginBottom: 30,
                backgroundColor: "#00505cff",
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

              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginTop: 8 }}>
                Rex Carlo Rosales
              </Text>
              <Text style={{ fontSize: 16, color: "white",}}>
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
    <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#00505cff" }}>
      SMILE STUDIO
    </Text>


    {/* Divider */}
    <View style={{ marginVertical: 20, borderBottomWidth: 1, borderBottomColor: "#ccc" }} />

    {/* Privacy Policy Title */}
    <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#00505cff" }}>
      Privacy Policy
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


          {/* Divider */}
          <View style={{ marginVertical: 20, borderBottomWidth: 1, borderBottomColor: "#ccc" }} />

          {/* Privacy Policy Title */}
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#00505cff" }}>
            Privacy Policy
          </Text>

          {/* Full Privacy Policy Content */}
          <Text style={{ fontSize: 14, color: "#444", lineHeight: 22 }}>
            <Text style={{ fontWeight: "bold" }}>Effective Date:</Text> May 8, 2025{"\n\n"}

            This Privacy Policy outlines how Smile Studio (“we”, “our”, or “us”) collects, uses, stores, and protects your personal information when you access or use our platform.

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>1. Information We Collect</Text>{"\n"}
            We collect the following types of information from users:{"\n"}
            • Personal identification (name, age, contact number, address){"\n"}
            • Appointment data (scheduled date/time, clinic, purpose){"\n"}
            • Optional medical details you provide{"\n"}
            • Usage data (device type, IP address, app interactions){"\n"}
            • AR Filter image interactions (not stored or transmitted)

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>2. How We Use Your Information</Text>{"\n"}
            Your information is used to:{"\n"}
            • Schedule and manage dental appointments{"\n"}
            • Send notifications and reminders{"\n"}
            • Improve system performance and user experience{"\n"}
            • Provide academic insights for capstone research (anonymized){"\n"}
            • Ensure compliance with dental service requirements

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>3. Legal Basis for Processing</Text>{"\n"}
            We process your personal data based on:{"\n"}
            • Your explicit consent when signing up and booking{"\n"}
            • Legitimate interest in providing the platform{"\n"}
            • Compliance with local laws and academic guidelines

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>4. Data Sharing & Disclosure</Text>{"\n"}
            • Your personal data is shared only with authorized dental clinics that you book with.{"\n"}
            • We do not sell, rent, or disclose your data to third parties.{"\n"}
            • Data may be accessed by developers strictly for technical support and improvement.

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>5. Data Retention Policy</Text>{"\n"}
            • We retain personal data for 12 months after your last activity.{"\n"}
            • After this period, data is automatically deleted or anonymized.{"\n"}
            • You may request earlier deletion at any time.

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>6. Security Measures</Text>{"\n"}
            We protect your data using:{"\n"}
            • Secure server connections (HTTPS){"\n"}
            • Encrypted data storage and password protection{"\n"}
            • Access restrictions for authorized personnel only{"\n"}
            • Regular app maintenance and data privacy training

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>7. Your Rights Under RA 10173</Text>{"\n"}
            Under the Philippine Data Privacy Act of 2012, you have the right to:{"\n"}
            • Be informed about data collection and usage{"\n"}
            • Access your personal data{"\n"}
            • Correct inaccurate or outdated information{"\n"}
            • Object to data processing{"\n"}
            • Withdraw consent at any time{"\n"}
            • Lodge a complaint with the National Privacy Commission

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>8. Children’s Privacy</Text>{"\n"}
            The platform is open to minors with parental or guardian consent. We do not knowingly collect data from users under 13 without verified adult approval.

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>9. Third-Party Links & Integrations</Text>{"\n"}
            Smile Studio may link to third-party clinics or systems. We are not responsible for how those parties handle your data. Always review their own privacy practices.

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>10. Changes to This Privacy Policy</Text>{"\n"}
            We may revise this policy as needed. Updates will be reflected in the app and are effective immediately upon posting.

            {"\n\n"}<Text style={{ fontWeight: "bold" }}>11. Contact Us</Text>{"\n"}
            For questions or concerns, contact:{"\n"}
            Smile Studio Support{"\n"}
            Scuba Scripter and Pixel Cowboy Team{"\n"}
            (+63) 921-888-1835{"\n"}
            San Jose Del Monte, Bulacan, Philippines
          </Text>

  </ScrollView>

            <TouchableOpacity
              onPress={() => setTermsOfUse(false)}
              style={{
                marginTop: 20,
                backgroundColor: "#00505cff",
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

        {/* Dashboard Augmented Reality --------------------------------------------------------------------------------------- */}

        {dashboardView === "ar" && (
        <View
          style={[
            styles.dashboard,
            {
              width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
              right: dashboardView === "ar" ? 11 : 20000,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              alignSelf: isMobile ? "center" : "flex-start",
              color: "#00505cff",
            }}
          >
            Augmented Reality
          </Text>
          {Platform.OS !== "android" && Platform.OS !== "ios" && (
            <View style={{ paddingVertical: "20%" }}>
              <Text
                style={{
                  fontSize: 24,
                  justifyContent: "center",
                  alignSelf: "center",
                  color: "#484848ff",
                }}
              >
                Augmented Reality in Web is not supported by the system :C
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  justifyContent: "center",
                  alignSelf: "center",
                  color: "#484848ff",
                }}
              >
                Download our app!
              </Text>
            </View>
          )}
        </View>
        )}

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
    alignItems: "center",
    width: 4000,
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
    marginTop: 5,
    marginBottom: 0,
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  
  buttonText: {
    color: "#000000ff",
    fontSize: 14,
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

  containerCL: {
    padding: 10,
  },
  cardCL: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  imageCL: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  nameCL: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 3,
  },
  textCL: {
    fontSize: 13,
    color: "#555",
  },
  loadingContainerCL: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
