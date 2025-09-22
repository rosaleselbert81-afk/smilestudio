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

  const [viewFirst, setviewFirst] = useState(false);
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

  const [dashboardView, setDashboardView] = useState("profile");

  const [clinicList, setClinicList] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>();
  const [messageToClinic, setMessageToClinic] = useState<string>();
  const [modalMessage, setModalMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');

  const [appointmentsList, setAppointmentList] = useState<Appointment[]>();
  const [appointmentsCurrentList, setAppointmentCurrentList] =
    useState<Appointment[]>();
  const [appointmentsPast, setAppointmentPast] = useState<Appointment[]>();

  const [mapView, setMapView] = useState<[number | undefined, number| undefined]>([undefined,undefined]);

  const [showMapPickerModal, setShowMapPicketModal] = useState(false);

  const [rejectAppointmentId, setRejectAppointmentID] = useState<string>();
  const [rejectMsg, setRejectMsg] = useState<string>();

  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);

  const [tMap, setTMap] = useState(false);

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
    const { data, error } = await supabase
      .from("appointments")
      .update({ isAccepted: true })
      .eq("id", appointmentId)
      .select(); // Optional: returns the updated row(s)

    if (error) {
      console.error("Error updating appointment status:", error.message);
      return null;
    }

    //Reload
    fetchAppointments();
    console.log("Updated appointment status:", data);
  };

  const rejectAppointment = async (
    appointmentId: string,
    rejectionMsg: string
  ) => {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        isAccepted: false,
        rejection_note: rejectionMsg,
      })
      .eq("id", appointmentId)
      .select(); // Optional: returns the updated row(s)

    if (error) {
      console.error("Error updating appointment status:", error.message);
      return null;
    }

    console.log("Updated appointment status:", data);
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

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`id ,username, website, avatar_url, isFirst`)
        .eq("id", session?.user.id)
        .single();

      const { error: updateError } = await supabase
        .from("clinic_profiles")
        .update({ email: session?.user?.email }) // 👈 changed here
        .eq("id", session.user.id); 

      if (error && status !== 406) throw error;

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);

      if (data.isFirst !== viewFirst) {
        setviewFirst(true);
      }
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
          `clinic_name, mobile_number, address, clinic_photo_url, license_photo_url`
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
            <FontAwesome5 name="user-edit" size={isMobile ? 75 : 150} color="#ccc" />
            <Text
              style={{
                fontSize: 16,
                alignSelf: "center",
                color: "#ccc",
              }}
            >
              Wanna edit/setup your information? let me guide you!
            </Text>
            <Text
              style={{
                fontSize: 16,
                alignSelf: "center",
                color: "#ccc",
              }}
            >
              You can pin your location in our map!
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 20,
                alignSelf: "center",
                color: "#ccc",
              }}
            >
              Set up your schedule so your patients can appoint!
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
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Sure, take me there!</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>
      {/* Glider Panel */}
      <View
        style={{
          width: drawerWidth,
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
          colors={["#003a3aff", "#2f4f2fff"]}
        >
          <View style={{ flex: 1 }}>
            <TouchableOpacity
            onPress={() => setModalSignout(true)}
            style={{alignSelf: 'flex-end', marginRight: isMobile ? -30 : -40}}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator animating color={"white"} />
            ) : (
              <MaterialIcons name="logout" size={24} color="white" />
            )}
          </TouchableOpacity>
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
                paddingBottom: 60,
              }}
            >
              <Image
                source={require("../../assets/favicon.ico.png")}
                style={styles.logo}
              />

              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 30,
                  marginTop: -40,
                  marginBottom: 30,
                  color: "white",
                  textAlign: "center",
                }}
              >
                SMILE STUDIO
              </Text>
              <View style={{ ...styles.container, width: "100%" }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    color: "white",
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  Welcome back Clinic!
                </Text>
                <Text
                  style={{
                    outlineWidth: 0,
                    width: 215,
                    fontWeight: "bold",
                    fontSize: 15, // initial font size
                    color: "#ffd445ff",
                    textAlign: "center",
                    marginBottom: 7,
                  }}
                  numberOfLines={1} // Only one line, don't wrap
                  adjustsFontSizeToFit={true} // Automatically shrink to fit
                >
                  {session?.user?.email}
                </Text>

                <TouchableOpacity
                  style={{ ...styles.mar3, width: "90%" }}
                  onPress={() => setModalUpdate(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"black"} />
                  ) : (
                    <Text
                      style={{
                        ...styles.buttonTextUpdate,
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
                        <Text style={{ textAlign: "center" }}>
                          Username: {clinicName}
                        </Text>
                        <Text style={{ textAlign: "center" }}>
                          Slogan: {website}
                        </Text>
                      </View>

                      <Text
                        style={{
                          textAlign: "center",
                          marginTop: 25,
                          fontWeight: "bold",
                          marginBottom: 6,
                        }}
                      >
                        Slogan
                      </Text>
                      <TextInput
                        style={{
                          ...styles.contentsmenu,
                          outlineWidth: 0,
                          width: "100%",
                        }}
                        placeholder="add slogan..."
                        placeholderTextColor="black"
                        value={website}
                        onChangeText={setWebsite}
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
                            backgroundColor: "#2e7dccff",
                            paddingVertical: 5,
                            borderRadius: 8,
                            marginTop: -8,
                            marginBottom: 45,
                          }}
                          onPress={() => {
                            console.log("Updating...");
                            setModalUpdate(false);
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
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          width: "100%",
                          gap: 5,
                        }}
                      >
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: "#728d64ff",
                          paddingVertical: 5,
                          borderRadius: 8,
                          marginBottom: 8,
                          height: isMobile? 28 : 30,
                        }}
                        onPress={() => {
                          setShowMapPicketModal(true);
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >{"Edit in map"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setShowWeeklySchedule(true);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: "#728d64ff",
                          paddingVertical: 5,
                          borderRadius: 8,
                          marginBottom: 8,
                          height: isMobile? 28 : 30,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}>Edit Schedule</Text>
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
                            Cancel
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
                  style={styles.mar2}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"black"} />
                  ) : (
                    <Text style={{ ...styles.buttonText, color: "#ffff" }}>
                      Profile
                    </Text>
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
                  style={styles.mar2}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"black"} />
                  ) : (
                    <Text style={{ ...styles.buttonText, color: "#ffff" }}>
                      Clinics
                    </Text>
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
                  style={styles.mar2}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"black"} />
                  ) : (
                    <Text style={{ ...styles.buttonText, color: "#ffff" }}>
                      Appointments
                    </Text>
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
                  style={styles.mar2}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"black"} />
                  ) : (
                    <Text style={{ ...styles.buttonText, color: "#ffff" }}>
                      Pendings
                    </Text>
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
                  style={styles.mar2}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"black"} />
                  ) : (
                    <Text style={{ ...styles.buttonText, color: "#ffff" }}>
                      History
                    </Text>
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
                  style={styles.mar2}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"black"} />
                  ) : (
                    <Text style={{ ...styles.buttonText, color: "#ffff" }}>
                      Chats
                    </Text>
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
                  style={styles.mar2}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"black"} />
                  ) : (
                    <Text style={{ ...styles.buttonText, color: "#ffff" }}>
                      Others
                    </Text>
                  )}
                </TouchableOpacity>


              </View>
            </ScrollView>
          </View>
        </LinearGradient>
        {/* Toggle Button */}
        {(Platform.OS === "android" || Platform.OS === "ios") && (
          <View style={[styles.toggleButtonWrapper, { height: 60 }]}>
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                backgroundColor: "rgba(86, 187, 255, 1)",
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
                  color="black"
                />
              ) : (
                <MaterialIcons
                  name="keyboard-arrow-left"
                  size={34}
                  color="black"
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Dashboard */}
      <LinearGradient
        style={{ flex: 1, position: "relative" }}
        colors={["#87ffd9ff", "#bdeeffff"]}
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
                color: "#003f30ff",
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
                  borderRadius: 60,
                  borderWidth: 5,
                  borderColor: "#d1d1d1ff",
                  backgroundColor: "#eaeaea",
                }}
              />
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  color: "black",
                  textAlign: "center",
                  marginBottom: 4,
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
                  }}
                >
                  {userCount !== null ? userCount : "..."}
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 6,
                    fontSize: isMobile ? 15 : 25,
                  }}
                >
                  TOTAL PATIENTS
                </Text>
              </View>
              <View style={styles.card}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 50,
                    textAlign: "center",
                  }}
                >
                  {clinicCount !== null ? clinicCount : "..."}
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 6,
                    fontSize: isMobile ? 15 : 25,
                  }}
                >
                  SJDM CLINICS
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
                      }}
                    >
                      RUNNING APPOINTMENTS
                    </Text>
                  </View>
                  <View style={{ marginTop: 20, alignItems: "center" }}>
                    <TouchableOpacity
                      style={styles.redButton}
                      onPress={() => setModalVisible(true)}
                    >
                      <Text
                        style={{
                          ...styles.buttonText1,
                          fontSize: isMobile ? 10 : 25,
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
                                  {e.item.message.length > 20 ? (
                                    <TouchableOpacity
                                      style={{ flex: 1 }}
                                      onPress={() => {
                                        setSelectedMessage(e.item.message);
                                        setModalMessage(true);
                                      }}
                                    >
                                      <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                                        {e.item.message.slice(0, 20) + "..."}
                                      </Text>
                                    </TouchableOpacity>
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
                                    {`Day/Time Request : \n${new Date(
                                      e.item.date_time
                                    ).toLocaleString()}`}
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
                  backgroundColor: "#e6f7ff",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#b3e5fc",
                  minWidth: 330,
                   height: isMobile ? null : 400,
                }}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    fontWeight: "bold",
                    fontSize: 24,
                    color: "#003f30ff",
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
                        padding: 5,
                        backgroundColor: "#ffffd7ff",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#ffe680",
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Patient's Name :</Text>
                      <Text>{`${e.item.profiles.first_name} ${e.item.profiles.last_name}`}</Text>

                      <Text style={{ fontWeight: "bold" }}>Date & Time of Appointment :</Text>
                      <Text>{`Date : ${new Date(e.item.date_time).toLocaleString()}`}</Text>

                      <View
                        style={{
                          marginTop: 10,
                          padding: 8,
                          borderRadius: 6,
                          backgroundColor: "#fffce9ff", // light yellow background
                          borderWidth: 1,
                          borderColor: "#ffe680",
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>Message :</Text>
                        {e.item.message.length > 20 ? (
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => {
                            setSelectedMessage(e.item.message);
                            setModalMessage(true);
                          }}
                        >
                          <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                            {e.item.message.slice(0, 20) + "..."}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={{ flex: 1 }}>
                          {e.item.message}
                        </Text>
                      )}
                      </View>

                      <View
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          gap: 10,
                          justifyContent: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setRejectAppointmentID(e.item.id);
                          }}
                          style={{
                            alignSelf: "flex-start",
                            backgroundColor: "red",
                            borderRadius: 14,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            alignItems: "center",
                            width: "45%",
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
                            Reject
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => acceptAppointment(e.item.id)}
                          style={{
                            alignSelf: "flex-start",
                            backgroundColor: "green",
                            borderRadius: 14,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            alignItems: "center",
                            width: "45%",
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
                            Accept
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
                      - No Appointments -
                    </Text>
                  }
                />

                {/* 👇 Show "view all" message only if mobile AND more than 3 */}
                {isMobile && (appointmentsList?.length ?? 0) > 3 && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: "blue",
                      marginTop: 10,
                      textAlign: "center",
                    }}
                  >
                    ...navigate to pendings to view all
                  </Text>
                )}

              </View>
              <View
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: 16,
                  backgroundColor: "#e6f7ff",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#b3e5fc",
                  height: isMobile ? null : 400,
                }}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    fontWeight: "bold",
                    fontSize: 24,
                    color: "#003f30ff",
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
                        padding: 5,
                        backgroundColor: e.item.isAccepted ? "#e4ffe0ff" : "#ffe0e0ff",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: !e.item.isAccepted ? "#ffcccc" : "#b6e4beff",
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Patient Name :</Text>
                      <Text>{`${e.item.profiles.first_name} ${e.item.profiles.last_name}`}</Text>

                      <Text style={{ fontWeight: "bold" }}>Date & Time:</Text>
                      <Text>{`${new Date(e.item.date_time).toLocaleString()}`}</Text>

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
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => {
                            setSelectedMessage(e.item.message);
                            setModalMessage(true);
                          }}
                        >
                          <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                            {e.item.message.slice(0, 20) + "..."}
                          </Text>
                        </TouchableOpacity>
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
                          : "-"}
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
                {clinicList.map((clinic, index) => (
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
              {selectedClinicRole || "N/A"}
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
        <View style={{ marginBottom: 16, gap: 8 }}>
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
              alert(`Messaging ${selectedClinicName}`);
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
        {/* Clinic Details Title */}
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
            {selectedClinicRole || "Clinic"}
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
          onPress={() => alert(`Messaging ${selectedClinicName}`)}
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
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => {
                        setSelectedMessage(item.message);
                        setModalMessage(true);
                      }}
                    >
                      <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                        {item.message.slice(0, 20) + "..."}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ flex: 1 }}>
                      {item.message}
                    </Text>
                  )}
                  <Text style={{ flex: 1 }}>
                    {new Date(item.date_time).toLocaleString()}
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
            Pending
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
                  {new Date(item.date_time).toLocaleString()}
                </Text>

                {/* Message */}
                {item.message.length > 20 ? (
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => {
                        setSelectedMessage(item.message);
                        setModalMessage(true);
                      }}
                    >
                      <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                        {item.message.slice(0, 20) + "..."}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ flex: 1 }}>
                      {item.message}
                    </Text>
                  )}

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
          <FlatList
            data={appointmentsPast}
            keyExtractor={(e) => e.id}
            style={{ width: "100%" }}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "stretch", // keep rows full width
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
                <Text style={{ flex: 1, fontWeight: "700" }}>Status</Text>
                <Text style={{ flex: 1, fontWeight: "700" }}>
                  Rejection Note
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
                  backgroundColor: item.isAccepted ? "#e4ffe0" : "#ffe0e0",
                  alignSelf: "stretch",
                }}
              >
                {/* Patient */}
                <Text style={{ flex: 1 }}>
                  {`${item.profiles.first_name} ${item.profiles.last_name}`}
                </Text>

                {/* Date & Time */}
                <Text style={{ flex: 1 }}>
                  {new Date(item.date_time).toLocaleString()}
                </Text>

                {/* Message */}
                  {item.message.length > 20 ? (
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => {
                        setSelectedMessage(item.message);
                        setModalMessage(true);
                      }}
                    >
                      <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                        {item.message.slice(0, 20) + "..."}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ flex: 1 }}>
                      {item.message}
                    </Text>
                  )}

                {/* Status */}
                <Text style={{ flex: 1 }}>
                  {item.isAccepted ? "Accepted" : "Rejected"}
                </Text>

                {/* Rejection Note (only if rejected) */}
                <Text style={{ flex: 1 }}>
                  {item.isAccepted === false
                    ? item.rejection_note || "No rejection note"
                    : "-"}
                </Text>

                {/* Created At */}
                <Text style={{ flex: 1 }}>
                  {new Date(item.created_at || 0).toLocaleString()}
                </Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <View
                style={{ width: "100%", alignItems: "center", marginTop: 40 }}
              >
                <Text style={{ fontSize: 20, color: "gray" }}>
                  - No History -
                </Text>
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
            Others
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
              SmileStudio - Terms of Use
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 10, color: "#444" }}>
              <Text style={{ fontWeight: "bold" }}>Last Updated:</Text> May 8, 2025{"\n"}
              <Text style={{ fontWeight: "bold" }}>Effective Immediately</Text>
            </Text>

            <Text style={{ fontSize: 14, color: "#444", lineHeight: 22 }}>
              By accessing or using SmileStudio, owned and operated by Scuba Scripter and Pixel Cowboy Team, User agree to be legally bound by these Terms of Use. These Terms govern your use of SmileStudio, a Web-Based Dental Appointment System with Automated Messaging Follow-Up Reminders via AI Chatbot in San Jose Del Monte Bulacan.
              If you do not agree with any part of these Terms, you must immediately cease all use of the Platform. Continued access constitutes unconditional acceptance of these Terms and any future modifications.{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>1. Definitions{"\n"}</Text>
              "Appointment"– A scheduled medical consultation booked through SmileStudio.{"\n"}
              "No-Show"– Failure to attend a booked Appointment without prior cancellation.{"\n"}
              "Grace Period"– A 15-minute window after a scheduled Appointment time during which a late arrival may still be accommodated.{"\n"}
              "Malicious Activity"– Any action that disrupts, exploits, or harms the Platform, its users, or affiliated clinics (e.g., hacking, fake bookings, harassment).{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>2. Eligibility & Account Registration{"\n"}</Text>
              <Text style={{ fontWeight: "bold" }}>2.1 Age Requirement</Text>{" "}
              The Platform is accessible to users of all ages but is currently intended for non-commercial, academic/capstone project use only. Minors (under 18) must obtain parental/guardian consent before booking Appointments.{"\n"}
              <Text style={{ fontWeight: "bold" }}>2.2 Account Responsibility</Text>{" "}
              Users must provide accurate, current, and complete information during registration. You are solely responsible for:{"\n"}
              - Maintaining the confidentiality of your login credentials.{"\n"}
              - All activities conducted under your account.{"\n"}
              - Immediately notify us of any unauthorized account use.{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>3. Permitted & Prohibited Use{"\n"}</Text>
              <Text style={{ fontWeight: "bold" }}>3.1 Acceptable Use</Text>{" "}
              You may use SmileStudio only for lawful purposes, including:{"\n"}
              Booking legitimate medical Appointments at partner clinics in San Jose Del Monte, Bulacan.{"\n"}
              Accessing clinic information, availability, Location, Pricing, Services and AI chatbot reminder assistance.{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>3.2 Strictly Prohibited Conduct</Text>{" "}
              Violations will result in immediate account suspension or termination. You agree NOT to:{"\n"}
              - Create fake or duplicate Appointments (e.g., under false names).{"\n"}
              - Engage in hacking, phishing, or data scraping (automated or manual).{"\n"}
              - Harass clinic staff or other users (e.g., trolling, abusive messages).{"\n"}
              - Upload malicious software (viruses, spyware) or disrupt server operations.{"\n"}
              - Misrepresent your identity or medical needs.{"\n"}
              - Circumvent appointment limits (e.g., creating multiple accounts).{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>4. Appointment Policies{"\n"}</Text>
              <Text style={{ fontWeight: "bold" }}>4.1 Booking & Cancellation</Text>{" "}
              Appointments operate on a "First-Appoint, First-Served" basis. No downpayment is required ("Appoint Now, Pay Later"). Cancellations must be made at least 24 hours in advance via the Platform.{"\n"}
              <Text style={{ fontWeight: "bold" }}>4.2 No-Show & Late Arrival Policy</Text>{" "}
              AI Chatbot Reminder: Users receive 2 automated alerts:{"\n"}
              - 2 hours before the Appointment.{"\n"}
              - Grace Period: A 15-minute late arrival window is permitted. After this:{"\n"}
              - The Appointment is automatically forfeited.{"\n"}
              - The slot is released to other patients.{"\n"}
              - The User must reschedule.{"\n"}
              Strike System:{"\n"}
              - 5 No-Shows = 1-month account suspension.{"\n"}
              - Suspended accounts cannot book new Appointments but may view clinic information.{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>5. Intellectual Property Rights{"\n"}</Text>
              <Text style={{ fontWeight: "bold" }}>5.1 Ownership</Text>{" "}
              All text, graphics, logos, clinic data, and AI chatbot software APIs are the exclusive property of SmileStudio and its partner clinics. No commercial use (e.g., reselling clinic slots, redistributing data) is permitted.{"\n"}
              <Text style={{ fontWeight: "bold" }}>5.2 Limited License</Text>{" "}
              Users are granted a revocable, non-exclusive license to: Access the Platform for personal, non-commercial healthcare purposes.{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>6. Privacy & Data Security{"\n"}</Text>
              Our Privacy Policy (Will be added Soon) details how we collect, store, and protect your data. Clinic Confidentiality: All medical information shared during Appointments is protected under HIPAA-equivalent Philippine laws.{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>7. Disclaimers & Limitation of Liability{"\n"}</Text>
              <Text style={{ fontWeight: "bold" }}>7.1 No Medical Guarantees</Text>{" "}
              SmileStudio is not a healthcare provider. We do not guarantee diagnosis accuracy, treatment outcomes, or clinic availability.{"\n"}
              <Text style={{ fontWeight: "bold" }}>7.2 Platform "As Is"</Text>{" "}
              The Platform may experience downtime, bugs, or delays.{"\n"}
              <Text style={{ fontWeight: "bold" }}>7.3 No Financial Liability</Text>{" "}
              We do not charge users and do not handle payments, medical services, or clinic operations. We are not liable for:{"\n"}
              - User misconduct (e.g., no-shows, fake bookings).{"\n"}
              - Clinic errors (e.g., overbooking, misdiagnosis).{"\n"}
              - Indirect damages (e.g., lost time, travel costs).{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>8. Termination & Enforcement{"\n"}</Text>
              <Text style={{ fontWeight: "bold" }}>8.1 By SmileStudio</Text>{" "}
              We may suspend or terminate accounts for: Breach of these Terms (e.g., fake Appointments, harassment). Malicious Activity (e.g., hacking attempts). Excessive No-Shows (per Section 4.2).{"\n"}
              <Text style={{ fontWeight: "bold" }}>8.2 By Users</Text>{" "}
              You may deactivate your account at any time by contacting: (+63) 921-888-1835{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>9. Governing Law & Dispute Resolution{"\n"}</Text>
              These Terms are governed by Philippine law (Republic Act No. 10173, Data Privacy Act). Disputes must first undergo mediation in San Jose Del Monte, Bulacan. Unresolved disputes will be settled in Philippine courts.{"\n\n"}

              <Text style={{ fontWeight: "bold" }}>10. Contact Information{"\n"}</Text>
              For inquiries or violations, contact:{"\n"}
              Scuba Scripter and Pixel Cowboy Team{"\n"}
              (+63) 921-888-1835{"\n"}
              San Jose Del Monte, Bulacan, Philippines
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
    backgroundColor: "#fff",
    borderRadius: 12,
    alignContent: "center",
  },
  mar2: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderBottomColor: "#fff", // white line
    borderBottomWidth: 1, // thickness of line
  },
  mar3: {
    backgroundColor: "#45b4ffff", // fallback solid color
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    height: 40,
    alignSelf: "center",
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
    backgroundColor: "#f0f0f0",
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
