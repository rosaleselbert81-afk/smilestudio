import { useSession } from '@/lib/SessionContext';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, router } from 'expo-router';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, Agenda } from 'react-native-calendars';
import * as FileSystem from "expo-file-system";
import MapPickerView from "../view/MapPickerView";
import DayScheduleView from "../view/DayScheduleView";
import { FontAwesome } from '@expo/vector-icons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { FontAwesome5 } from '@expo/vector-icons';

export default function Account() {
  const { session, isLoading, signOut } = useSession();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const [adminName, setNameAdmin] = useState('')
  const [avatarAdmin, setAvatarAdmin] = useState('')

  const [moved, setMoved] = useState(false)
  const [mobilemoved, mobilesetMoved] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [userCount, setUserCount] = useState<number | null>(null);
  const [clinicCount, setClinicCount] = useState<number | null>(null);
  const { width, height } = useWindowDimensions();
  const isMobile = width < 480;
  const isTablet = width >= 480 && width < 768;
  const isDesktop = width >= 768;
  const drawerWidth = isMobile ? 370 : isTablet ? 300 : 350;
  const [modalMap, setModalMap] = useState(false);

  const [selectedSunday, setSelectedSunday] = useState("");
  const [selectedMonday, setSelectedMonday] = useState("");
  const [selectedTuesday, setSelectedTuesday] = useState("");
  const [selectedWednesday, setSelectedWednesday] = useState("");
  const [selectedThursday, setSelectedThursday] = useState("");
  const [selectedFriday, setSelectedFriday] = useState("");
  const [selectedSaturday, setSelectedSaturday] = useState("");

  const [userName, setUserName] = useState("");
  const [notifmessage, setNotifMessage] = useState("");

  const [tempID, setTempID] = useState("");
  const [tempWarn, setTempwarn] = useState(false);
  const [tempBan, setTempBan] = useState(false);

  const [modalType, setModalType] = useState<"warn" | "ban" | null>(null);
  const [userMessage, setUserMessage] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [reason, setReason] = useState('');

  const [clinicMessage, setClinicMessage] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);

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

  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [denialModalVisible, setDenialModalVisible] = useState(false);
  const [selectedClinicForAction, setSelectedClinicForAction] = useState<any>(null);
  const [denialReason, setDenialReason] = useState("");

  const [selectedClinicId, setSelectedClinicId] = useState<string>();
  const [messageToClinic, setMessageToClinic] = useState<string>();
  const [mapView, setMapView] = useState<[number | undefined, number| undefined]>([undefined,undefined]);

  const offset = moved ? -320 : 0
  const moboffset = moved ? -370 : 0
  const mobbutoffset = moved ? -305: 0

  const [fullProfile, setFullProfile] = useState(false);
  const [viewClinic, setviewClinic] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSignout, setModalSignout] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  
  const [dashboardView, setDashboardView] = useState('profile');

  const [clinicList, setClinicList] = useState<any[]>([]);

  const [tMap, setTMap] = useState(false);
  const [verified, setVerified] = useState(false);

  const [dentistList, setDentistList] = useState<Dentist[]>([]);
  const [patientUsers, setPatientUsers] = useState<any[]>([]);
  const [showAllClinics, setShowAllClinics] = useState(false);


useEffect(() => {
  const fetchPatientUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Patient');

      if (error) throw error;
      setPatientUsers(data || []);
    } catch (err) {
      console.error("Error fetching patient users:", err);
    }
  };

  fetchPatientUsers();
}, []);


const warnUser = async (id, currentStatus, reason) => {
  const newStatus = !currentStatus;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        isWarning: newStatus,
        notif_message: newStatus ? reason : null,
        isStriked: true,
      })
      .eq('id', id);

    if (error) throw error;

    setPatientUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, isWarning: newStatus, notif_message: newStatus ? reason : null }
          : u
      )
    );
  } catch (err) {
    console.error('Failed to warn/unwarn user:', err);
  }
};

const banUser = async (id, currentStatus, reason) => {
  const newStatus = !currentStatus;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        isBan: newStatus,
        notif_message: newStatus ? reason : null,
      })
      .eq('id', id);

    if (error) throw error;

    setPatientUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, isBan: newStatus, notif_message: newStatus ? reason : null }
          : u
      )
    );
  } catch (err) {
    console.error('Failed to ban/unban user:', err);
  }
};
  
useEffect(() => {
  async function fetchClinics() {
    try {
      const { data, error } = await supabase
        .from('clinic_profiles')
        .select('*, clinic_schedule(*)');

      if (error) throw error;
      setClinicList(data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  }

  fetchClinics();
}, []);

  useEffect(() => {
    getProfile()
    getAdmin()
  }, [])

  useEffect(() => {
  async function loadUserCount() {
    try {
      const { count, error } = await supabase
        .from('profiles')  // or 'auth.users' if you have access
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      setUserCount(count ?? 0);
    } catch (error) {
      console.error('Failed to fetch user count:', error);
    }
  }
  loadUserCount();
}, []);

useEffect(() => {
  async function loadClinicCount() {
    try {
      const { count, error } = await supabase
        .from('clinic_profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setClinicCount(count ?? 0);
    } catch (error) {
      console.error('Failed to fetch clinic count:', error);
    }
  }

  loadClinicCount();
}, []);

  useEffect(() => {
    if(!!isMobile){
      setMoved(true)
    }
}, []);


  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()

      if (error && status !== 406) throw error

      if (data) {
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

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

  async function getAdmin() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('admin_profiles')
        .select(`nameadmin, avatar_url`)
        .eq('id', session?.user.id)
        .single()

      if (error && status !== 406) throw error

      if (data) {
        setNameAdmin(data.nameadmin)
        setAvatarAdmin(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your photos to set a profile picture.');
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

  async function updateProfile({
    website,
    avatar_url,
  }: {
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        website,
        avatar_url,
        updated_at: new Date(),
      }

    const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

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
        await supabase.from("clinic_profiles")
          .update({ clinic_photo_url: publicUrl })
          .eq("id", session!.user.id);
  
        setAvatarUrl(publicUrl);
      }
    }
  
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


useEffect(() => {
  async function fetchRequestedClinics() {
    const { data, error } = await supabase
      .from('clinic_profiles')
      .select('*')
      .eq('request_verification', true);

    if (error) {
      console.error("Error fetching requested clinics:", error);
    } else {
      setClinicList(data || []);
    }
  }

  fetchRequestedClinics();
}, []);


  return (
    <LinearGradient
      colors={['#ffffffff', '#6ce2ffff']}
      style={{ 
        flex: 1, justifyContent: 'center',
        flexDirection: isMobile ? 'column' : 'row',
        width: isMobile ? '100%' : isTablet ? '100%' : '100%',
        position: 'relative',
        
      }}
    > 
      {/* Glider Panel */}
      <View style={{width: isMobile ? drawerWidth : "18%", left: 0, top: 0, flexDirection: 'row', height: '100%', position: 'absolute', zIndex: 1, transform: [{ translateX: isMobile ? mobbutoffset : offset }]}}>
        <LinearGradient
            style={{ ...styles.glider,  bottom: 0, left: 0, top: 0, width: drawerWidth }}
            colors={['#80c4c4ff', '#009b84ff']}
          >
          <View style={{flex: 1}}>

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
              source={require('../../assets/favicon.ico.png')}
              style={{...styles.logo, marginTop: isMobile ? -50  : null}}
            />

            <Text style={{fontWeight: 'bold', fontSize: 20, marginTop: -40, color: '#00505cff', textAlign: 'center', }}>SMILE STUDIO</Text>
            <Text style={{fontSize: 12, color: '#00505cff', textAlign: 'center', marginBottom: 7 }}>GRIN CREATORS</Text>
            <View style={{padding: 7, marginLeft: 40, marginRight: 40, backgroundColor: 'white', marginBottom: 30, borderRadius: 10}}>
              <Text style={{fontSize: 12, color: '#00505cff', textAlign: 'center'}}>ADMIN</Text>
            </View>
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
            <ScrollView 
              contentContainerStyle={{   
                flexGrow: 1,
                alignItems: "center",
                marginTop: 12,
              }}
              showsVerticalScrollIndicator={false}
              > 
            <View style={{ ...styles.container, width: '100%' }}>

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
                        style={styles.avatarContainer}>
                          {avatarUrl ? (
                            <Image
                              source={{ uri: avatarUrl ? `${avatarUrl}?t=${Date.now()}` : require("../../assets/default.png") }} // ✅ Type-safe (fallback empty string)
                              style={styles.avatar}
                            />
                          ) : (
                            <View style={styles.avatarPlaceholder}>
                              <MaterialIcons name="person" size={50} color="#ccc" />
                            </View>
                          )}
                          <View style={styles.cameraIcon}>
                            <MaterialIcons name="camera-alt" size={20} color="#007AFF" />
                          </View>
                        </TouchableOpacity>

                        <Text style={styles.avatarText}>Tap to change profile picture</Text>
                      </View>

                      {/* Rest of your profile content */}
                      <View>
                        <Text style={{fontWeight: "bold", fontStyle: "italic", fontSize: 16, textAlign: "center", color: "#003f30ff"}}>{adminName}</Text>
                        <Text style={{fontStyle: "italic", fontSize: 16, textAlign: "center", color: "#003f30ff"}}>{website}</Text>
                      </View>

                      <Text style={{fontWeight: "bold", fontSize: 16, textAlign: "center", color: "#003f30ff"}}>Bio</Text>
                      <TextInput
                        style={{
                          ...styles.contentsmenu,
                          outlineWidth: 0,
                          width: "100%",
                        }}
                        placeholder="add bio..."
                        placeholderTextColor="black"
                        value={website}
                        onChangeText={setWebsite}
                      />

                      <Text
                        style={{
                          fontSize: 18,
                          marginBottom: 20,
                          textAlign: "center",
                        }}
                      >
                        Do you wanna update it?
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

                        {/* SIGNOUT BUTTON */}
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: "#2e7dccff",
                            paddingVertical: 12,
                            borderRadius: 8,
                            marginLeft: 8,
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
    backgroundColor: dashboardView === "profile" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
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
    <ActivityIndicator animating color={"black"} />
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
    setDashboardView("authusers");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "authusers" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="users" size={24} color={dashboardView === "authusers" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "authusers" ? '#00505cff' : '#ffffff',
        marginLeft: 8,
      }}>
        Auth Users
      </Text>
    </View>
  )}
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setDashboardView("authclinics");
    if (isMobile) {
      setMoved((prev) => !prev);
      setExpanded((prev) => !prev);
    }
  }}
  style={{
    ...styles.mar2,
    backgroundColor: dashboardView === "authclinics" ? '#ffffff' : 'transparent',
    borderRadius: 15,
    padding: 10,
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="hospital-o" size={24} color={dashboardView === "authclinics" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "authclinics" ? '#00505cff' : '#ffffff',
        marginLeft: 8,
      }}>
        Auth Clinics
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
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="check-circle" size={24} color={dashboardView === "ar" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "ar" ? '#00505cff' : '#ffffff',
        marginLeft: 8,
      }}>
        Verify Clinics
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
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="comments" size={24} color={dashboardView === "chats" ? '#00505cff' : '#ffffff'} />
      <Text style={{
        ...styles.buttonText,
        color: dashboardView === "chats" ? '#00505cff' : '#ffffff',
        marginLeft: 8,
      }}>
        Support
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
    <ActivityIndicator animating color={"black"} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
      <FontAwesome name="cogs" size={24} color={dashboardView === "team" ? '#00505cff' : '#ffffff'} />
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

     

      {/* Dashboard */}
      <LinearGradient style={{ flex: 1, position: 'relative' }} colors={['#b9d7d3ff', '#00505cff']}>

    
          {/* Dashboard Profile --------------------------------------------------------------------------------------- */}
    

        <View style={[styles.dashboard, { width: !isDesktop ? '95%' : expanded ? '80%' : '95%', right: dashboardView === 'profile' ? 11 : 20000, backgroundColor: '#f1f5f9',}]}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, alignSelf: isMobile ? 'center' : 'flex-start', color: '#00505cff'}}>
            Profile
          </Text>
                    <View style={styles.proinfo}>
                        <Image
                          source={
                            avatarUrl
                              ? { uri: avatarUrl}
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
                        {adminName}
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
                          color: "#416e5dff",
                          fontStyle: "italic",
                          textAlign: "center",
                          marginBottom: 4,
                        }}
                      >
                        {website}
                      </Text>
                    </View>
              <View style={styles.cardRow}>
                <View style={styles.card}>
                    <Text style={{color: '#00505cff', fontWeight: 'bold', fontSize: 50, textAlign: 'center'}}>
                      {userCount !== null ? userCount : '...'}
                    </Text>
                    <Text style={{color: '#00505cff', textAlign: 'center', marginTop: 6, fontSize: isMobile ? 15 : 25 }}>
                      Total Patients
                    </Text>
                </View>
                <View style={styles.card}>
                    <Text style={{color: '#00505cff', fontWeight: 'bold', fontSize: 50, textAlign: 'center'}}>
                      {clinicCount !== null ? clinicCount : '...'}
                    </Text>
                    <Text style={{color: '#00505cff', textAlign: 'center', marginTop: 6, fontSize: isMobile ? 15 : 25 }}>
                      SJDM Registered Clinics
                    </Text>
                </View>
                <View style={styles.card}>
                  <View style={{flexDirection: 'column',}}>
                  <View>
                      <Text style={{color: '#00505cff', textAlign: 'center', marginTop: 6, fontSize: isMobile ? 15 : 25 }}>
                        (Not Finished)
                      </Text>
                    </View>
                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                      <TouchableOpacity
                        style={{...styles.redButton, backgroundColor: '#00505cff'}}
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={{...styles.buttonText1, color: '#ffffffff', fontSize: isMobile ? 10 : 25 }}>Overview</Text>
                      </TouchableOpacity>
                    </View>

                    <Modal
                      animationType="fade"
                      transparent={true}
                      visible={modalVisible}
                      onRequestClose={() => setModalVisible(false)} // for Android back button
                    >
                      <View style={styles.modalBackground}>
                        <View style={{...styles.modalContent, width: isMobile ? 350 : '40%'}}>
                          <Text style={{ fontSize: 20, marginBottom: 20 }}>Suggestion Overview</Text>
                          <View style={{ padding: 20 }}>

                            {/* Appointment Section */}
                            <View>
                              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Suggestions</Text>
                              <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 15, backgroundColor: '#f1f1f1' }}>
                                <Text style={{ fontWeight: '600' }}>Mark Ariya</Text>
                                <Text style={{ color: '#555' }}>Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum</Text>
                                <Text style={{ color: '#555' }}>8/22/25 - 10:00 AM</Text>
                              </View>

                              <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 15, backgroundColor: '#f1f1f1', marginTop: 10 }}>
                                <Text style={{ fontWeight: '600' }}>Jenny Rom</Text>
                                <Text style={{ color: '#555' }}>Lorem Ipsum Lorem Ipsum</Text>
                                <Text style={{ color: '#555' }}>8/22/25 - 2:30 PM</Text>
                              </View>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                          >
                            <Text style={styles.closeButtonText}>Close</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  </View>
                </View>
              </View>
              <View style={styles.infoSection}>
                <Text style={styles.infoText}>Further information can go here. (to be designed) </Text>
              </View>
            </View>
    
            
        {/* Dashboard Clinics --------------------------------------------------------------------------------------- */}
    
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
                backgroundColor: '#00505cff',
                marginBottom: 8,
                width: isMobile ? "91%" : "98%",
                height: 50,
                alignSelf: "center",
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setTMap(true);
              }}
            >
              <FontAwesome5 name="map-marked-alt" size={16} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                View All Registered Clinics in Map
              </Text>
            </TouchableOpacity>
            <Modal
              transparent
              animationType="fade"
              visible={tMap}
              onRequestClose={() => setTMap(false)}
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
                    width: isMobile ? "90%" : "80%",
                    maxHeight: "90%",
                    backgroundColor: "white",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 20,
                    position: "relative",
                  }}
                >
                  {/* ✅ Circular red "X" close button in top right */}
                  <TouchableOpacity
                    onPress={() => setTMap(false)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 10,
                      backgroundColor: "#e74c3c",
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 18,
                        lineHeight: 18,
                      }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>

                  <ScrollView
                    contentContainerStyle={{
                      paddingTop: 10,
                    }}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "bold",
                        marginBottom: 10,
                        color: "#00505cff",
                        alignSelf: isMobile ? "center" : "flex-start",
                      }}
                    >
                      Map
                    </Text>

                    <Text
                      style={{
                        fontSize: 15,
                        color: "#000",
                        fontStyle: "italic",
                        marginBottom: 10,
                        alignSelf: "flex-start",
                      }}
                    >
                      Click/Tap the pin to view dental clinic details
                    </Text>

                    <View
                      style={{
                        width: "100%",
                        height: isMobile ? 350 : 450,
                        marginBottom: 20,
                      }}
                    >
                      <MapPickerView allowEdit={false} pins={clinicList} />
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>

          {clinicList.length === 0 ? (
            <Text style={{ textAlign: "center" }}>No clinics found.</Text>
          ) : (
            <>
              <View
                style={{
                  flexDirection: isMobile ? "column" : "row",
                  flexWrap: isMobile ? "nowrap" : "wrap",
                  justifyContent: isMobile ? "flex-start" : "center",
                }}
              >
                {clinicList
                  .filter((clinic) => clinic.isFirst === false)
                  .slice(0, showAllClinics ? clinicList.length : 8) // Show only 8 clinics unless "showAllClinics" is true
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
  {clinic.clinic_photo_url ? (
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
  ) : (
    <View
      style={{
        width: isMobile ? 70 : 100,
        height: isMobile ? 70 : 100,
        borderRadius: 16,
        marginRight: 16,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FontAwesome5 name="clinic-medical" size={64} color="#4a878bff" />
    </View>
  )}

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
          backgroundColor: "white",
        }}
      >
        <TouchableOpacity onPress={() => setFullProfile(false)}>
          <MaterialIcons
            name="keyboard-arrow-left"
            size={34}
            color="#00505cff"
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginLeft: 12,
            color: "#00505cff",
            bottom: 2,
          }}
        >
          Clinic Profile
        </Text>
      </View>

      <ScrollView 
        style={{ backgroundColor: '#f1f5f9' }}
      >

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
            {!isMobile && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  paddingHorizontal: 16,
                  marginTop: 8,
                  backgroundColor: "transparent",
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
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesome5 name="map-marker-alt" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>View in Map</Text>
                </TouchableOpacity>
              </View>
            )}
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
      

    {isMobile && (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "white",
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
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <FontAwesome5 name="map-marker-alt" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>View in Map</Text>
        </TouchableOpacity>
      </View>
    )}
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
                        onRequestClose={() => setModalMap(false)}
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
                              padding: 20,
                              width: !isMobile ? "90%" : "100%",
                              position: "relative",
                            }}
                          >
                            {/* ✅ Circular red close button in upper right */}
                            <TouchableOpacity
                              onPress={() => setModalMap(false)}
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                zIndex: 10,
                                backgroundColor: "#e74c3c",
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Text style={{ color: "white", fontWeight: "bold", fontSize: 18, lineHeight: 18 }}>
                                ×
                              </Text>
                            </TouchableOpacity>

                            <Text
                              style={{
                                fontSize: 24,
                                fontWeight: "bold",
                                marginBottom: 20,
                                alignSelf: isMobile ? "center" : "flex-start",
                                color: "#00505cff",
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
                          </View>
                        </View>
                      </Modal>
                    </View>
                  </LinearGradient>
                ))}
              </View>
              {/* Show More / Show Less Button */}
              {clinicList.filter((clinic) => clinic.isFirst === false).length > 8 && (
                <View style={{ alignItems: "center", marginTop: 20, marginBottom: 20 }}>
                  <TouchableOpacity
                    onPress={() => setShowAllClinics(!showAllClinics)}
                    style={{
                      backgroundColor: "#00505cff",
                      paddingVertical: 12,
                      paddingHorizontal: 30,
                      borderRadius: 8,
                      shadowColor: "#000",
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 3,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                      {showAllClinics ? "Show Less" : `Show More (${clinicList.filter((clinic) => clinic.isFirst === false).length - 8} more)`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
            )}
            </ScrollView>
        </View>

        {/* Dashboard Auth Users --------------------------------------------------------------------------------------- */}

        <View
          style={[
            styles.dashboard,
            {
              width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
              right: dashboardView === "authusers" ? 11 : 20000,
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
            Auth Users
          </Text>
          {isMobile ? (
            // 📱 Mobile Layout (Card style)
            <ScrollView contentContainerStyle={{ padding: 12 }}>
              {patientUsers.length === 0 ? (
                <View style={{ alignItems: "center", marginTop: 40 }}>
                  <Text style={{ fontSize: 20, color: "gray" }}>- No Patients -</Text>
                </View>
              ) : (
                patientUsers.map((user, index) => (
                  <View
                    key={user.id}
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
                    <Text style={{ fontWeight: "700", marginBottom: 6 }}>Name:</Text>
                    <Text style={{ marginBottom: 10 }}>{`${user.first_name || ""} ${user.last_name || ""}`}</Text>

                    <Text style={{ fontWeight: "700", marginBottom: 6 }}>Gender:</Text>
                    <Text style={{ marginBottom: 10 }}>{user.gender || "N/A"}</Text>

                    <Text style={{ fontWeight: "700", marginBottom: 6 }}>Birthdate:</Text>
                    <Text style={{ marginBottom: 10 }}>{user.birthdate || "N/A"}</Text>

                    <Text style={{ fontWeight: "700", marginBottom: 6 }}>Mobile:</Text>
                    <Text style={{ marginBottom: 10 }}>{user.mobile_number || "N/A"}</Text>

                    <Text style={{ fontWeight: "700", marginBottom: 6 }}>Striked:</Text>
                    <Text style={{ marginBottom: 10 }}>{user.isStriked ? "Yes" : "No"}</Text>

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <TouchableOpacity
                        onPress={() => {
                          setModalType("warn");
                          setSelectedUser(user);
                          setUserMessage(true);
                        }}
                        style={{
                          backgroundColor: user.isWarning ? "#7f8c8d" : "#f39c12",
                          padding: 8,
                          borderRadius: 5,
                          flex: 1,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: "#fff", textAlign: "center" }}>
                          {user.isWarning ? "Unwarn" : "Warn"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setModalType("ban");
                          setSelectedUser(user);
                          setUserMessage(true);
                        }}
                        style={{
                          backgroundColor: user.isBan ? "#7f8c8d" : "#c0392b",
                          padding: 8,
                          borderRadius: 5,
                          flex: 1,
                        }}
                      >
                        <Text style={{ color: "#fff", textAlign: "center" }}>
                          {user.isBan ? "Unban" : "Ban"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          ) : (
          // 🖥️ Desktop / Tablet Patient Table
          <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1, minWidth: 900 }}>
              {patientUsers.length === 0 ? (
                <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                  <Text style={{ fontSize: 20, color: "gray" }}>- No Patients -</Text>
                </View>
              ) : (
                <>
                  {/* Header Row */}
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
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Name</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Gender</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Birthdate</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Mobile</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Striked?</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Actions</Text>
                  </View>

                  {/* Rows */}
                  <ScrollView>
                  {patientUsers.map((user, index) => (
                    <View
                      key={user.id}
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
                      <Text style={{ flex: 1 }}>{`${user.first_name || ""} ${user.last_name || ""}`}</Text>
                      <Text style={{ flex: 1 }}>{user.gender || "N/A"}</Text>
                      <Text style={{ flex: 1 }}>{user.birthdate || "N/A"}</Text>
                      <Text style={{ flex: 1 }}>{user.mobile_number || "N/A"}</Text>
                      <Text style={{ flex: 1 }}>{user.isStriked ? "Yes" : "No"}</Text>

                      <View style={{ flex: 1, flexDirection: "row" }}>
                        {/* Warn Button */}
                        <TouchableOpacity
                          onPress={() => {
                            setModalType("warn");
                            setSelectedUser(user);
                            setUserMessage(true);
                          }}
                          style={{
                            backgroundColor: user.isWarning ? "#7f8c8d" : "#f39c12",
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 4,
                            marginRight: 10,
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 12 }}>
                            {user.isWarning ? "Unwarn" : "Warn"}
                          </Text>
                        </TouchableOpacity>

                        {/* Ban Button */}
                        <TouchableOpacity
                          onPress={() => {
                            setModalType("ban");
                            setSelectedUser(user);
                            setUserMessage(true);
                          }}
                          style={{
                            backgroundColor: user.isBan ? "#7f8c8d" : "#c0392b",
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 4,
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 12 }}>
                            {user.isBan ? "Unban" : "Ban"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  </ScrollView>
                </>
              )}
            </View>
          </ScrollView>
          )}

        </View>

        {userMessage && (
          <Modal visible={userMessage} transparent animationType="fade">
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 20,
                  borderRadius: 8,
                  width: '80%',
                  maxWidth: 400,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  {modalType === 'warn'
                    ? selectedUser?.isWarning
                      ? `Unwarn ${selectedUser?.first_name} ${selectedUser?.last_name}`
                      : `Warn ${selectedUser?.first_name} ${selectedUser?.last_name}`
                    : selectedUser?.isBan
                    ? `Unban ${selectedUser?.first_name} ${selectedUser?.last_name}`
                    : `Ban ${selectedUser?.first_name} ${selectedUser?.last_name}`}
                </Text>

                {/* Reason input (only shown when issuing a warn or ban) */}
                {((modalType === 'warn' && !selectedUser?.isWarning) ||
                  (modalType === 'ban' && !selectedUser?.isBan)) && (
                  <>
                    <Text style={{ marginBottom: 5 }}>Reason:</Text>
                    <TextInput
                      placeholder="Enter reason"
                      value={reason}
                      onChangeText={setReason}
                      style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 5,
                        padding: 10,
                        marginBottom: 10,
                        height: 80,
                        textAlignVertical: 'top',
                      }}
                      multiline
                    />
                  </>
                )}

                {/* Confirmation text for unban/unwarn */}
                {((modalType === 'warn' && selectedUser?.isWarning) ||
                  (modalType === 'ban' && selectedUser?.isBan)) && (
                  <Text style={{ marginBottom: 10 }}>
                    Are you sure you want to {modalType === 'warn' ? 'unwarn' : 'unban'} this user?
                  </Text>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => {
                      setUserMessage(false);
                      setSelectedUser(null);
                      setReason('');
                    }}
                    style={{ marginRight: 15 }}
                  >
                    <Text style={{ color: '#888' }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      if (!selectedUser) return;

                      const needsReason =
                        (modalType === 'warn' && !selectedUser.isWarning) ||
                        (modalType === 'ban' && !selectedUser.isBan);

                      if (needsReason && reason.trim() === '') {
                        alert('Please enter a reason');
                        return;
                      }

                      if (modalType === 'warn') {
                        await warnUser(selectedUser.id, selectedUser.isWarning, reason);
                      } else if (modalType === 'ban') {
                        await banUser(selectedUser.id, selectedUser.isBan, reason);
                      }

                      setUserMessage(false);
                      setSelectedUser(null);
                      setReason('');
                    }}
                  >
                    <Text style={{ color: '#007BFF', fontWeight: 'bold' }}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}


        {/* Dashboard Auth Clinics --------------------------------------------------------------------------------------- */}

        <View
          style={[
            styles.dashboard,
            {
              width: !isDesktop ? "95%" : expanded ? "80%" : "95%",
              right: dashboardView === "authclinics" ? 11 : 20000,
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
            Auth Clinics
          </Text>
        {isMobile ? (
          // 📱 Mobile Layout (Card style)
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            {clinicList.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Text style={{ fontSize: 20, color: "gray" }}>- No Clinics -</Text>
              </View>
            ) : (
              clinicList.map((clinic, index) => (
                <View
                  key={clinic.id}
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
                  <Text style={{ marginBottom: 10 }}>{clinic.clinic_name || "N/A"}</Text>

                  <Text style={{ fontWeight: "700", marginBottom: 6 }}>Email:</Text>
                  <Text style={{ marginBottom: 10 }}>{clinic.email || "N/A"}</Text>

                  <Text style={{ fontWeight: "700", marginBottom: 6 }}>Mobile:</Text>
                  <Text style={{ marginBottom: 10 }}>{clinic.mobile_number || "N/A"}</Text>

                  <Text style={{ fontWeight: "700", marginBottom: 6 }}>Address:</Text>
                  <Text style={{ marginBottom: 10 }}>{clinic.address || "N/A"}</Text>

                  <Text style={{ fontWeight: "700", marginBottom: 6 }}>Striked:</Text>
                  <Text style={{ marginBottom: 10 }}>{clinic.IsStriked ? "Yes" : "No"}</Text>

                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalType("warn");
                        setSelectedClinic(clinic);
                        setClinicMessage(true);
                      }}
                      style={{
                        backgroundColor: clinic.isWarn ? "#7f8c8d" : "#f39c12",
                        padding: 8,
                        borderRadius: 5,
                        flex: 1,
                        marginRight: 8,
                      }}
                    >
                      <Text style={{ color: "#fff", textAlign: "center" }}>
                        {clinic.isWarn ? "Unwarn" : "Warn"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setModalType("ban");
                        setSelectedClinic(clinic);
                        setClinicMessage(true);
                      }}
                      style={{
                        backgroundColor: clinic.isBan ? "#7f8c8d" : "#c0392b",
                        padding: 8,
                        borderRadius: 5,
                        flex: 1,
                      }}
                    >
                      <Text style={{ color: "#fff", textAlign: "center" }}>
                        {clinic.isBan ? "Unban" : "Ban"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        ) : (
          // 🖥️ Desktop / Tablet Table Layout
          <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1, minWidth: 900 }}>
              {clinicList.length === 0 ? (
                <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                  <Text style={{ fontSize: 20, color: "gray" }}>- No Clinics -</Text>
                </View>
              ) : (
                <>
                  {/* Table Header */}
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
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Clinic Name</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Email</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Mobile</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Address</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Striked?</Text>
                    <Text style={{ flex: 1, fontWeight: "700", color: "white" }}>Actions</Text>
                  </View>

                  <ScrollView>
                    {clinicList.map((clinic, index) => (
                      <View
                        key={clinic.id}
                        style={{
                          flexDirection: "row",
                          borderBottomWidth: 1,
                          borderColor: "#ccc",
                          paddingVertical: 20,
                          paddingHorizontal: 20,
                          backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                          alignItems: "center",
                          gap: 10
                        }}
                      >
                        <Text
                          style={{ flex: 1 }}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.7}
                        >
                          {clinic.clinic_name || "N/A"}
                        </Text>

                        <Text
                          style={{ flex: 1 }}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.7}
                        >
                          {clinic.email || "N/A"}
                        </Text>

                        <Text
                          style={{ flex: 1 }}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.7}
                        >
                          {clinic.mobile_number || "N/A"}
                        </Text>

                        <Text
                          style={{ flex: 1 }}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.7}
                        >
                          {clinic.address || "N/A"}
                        </Text>

                        <Text
                          style={{ flex: 1 }}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.7}
                        >
                          {clinic.IsStriked ? "Yes" : "No"}
                        </Text>

                        <View style={{ flex: 1, flexDirection: "row" }}>
                          <TouchableOpacity
                            onPress={() => {
                              setModalType("warn");
                              setSelectedClinic(clinic);
                              setClinicMessage(true);
                            }}
                            style={{
                              backgroundColor: clinic.isWarn ? "#7f8c8d" : "#f39c12",
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 4,
                              marginRight: 10,
                            }}
                          >
                            <Text style={{ color: "#fff", fontSize: 12 }}>
                              {clinic.isWarn ? "Unwarn" : "Warn"}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setModalType("ban");
                              setSelectedClinic(clinic);
                              setClinicMessage(true);
                            }}
                            style={{
                              backgroundColor: clinic.isBan ? "#7f8c8d" : "#c0392b",
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 4,
                            }}
                          >
                            <Text style={{ color: "#fff", fontSize: 12 }}>
                              {clinic.isBan ? "Unban" : "Ban"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                </>
              )}
            </View>
          </ScrollView>
        )}

        {/* Modal for clinics */}
        <Modal visible={clinicMessage} transparent animationType="fade">
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
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 8,
                width: "80%",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                {modalType === "warn"
                  ? selectedClinic?.isWarn
                    ? `Unwarn ${selectedClinic?.clinic_name}`
                    : `Warn ${selectedClinic?.clinic_name}`
                  : selectedClinic?.isBan
                  ? `Unban ${selectedClinic?.clinic_name}`
                  : `Ban ${selectedClinic?.clinic_name}`}
              </Text>

              {/* If warning or banning, show reason input */}
              {((modalType === "warn" && !selectedClinic?.isWarn) ||
                (modalType === "ban" && !selectedClinic?.isBan)) && (
                <>
                  <Text style={{ marginBottom: 5 }}>Reason:</Text>
                  <TextInput
                    placeholder="Enter reason"
                    value={reason}
                    onChangeText={setReason}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 5,
                      padding: 10,
                      marginBottom: 10,
                    }}
                    multiline
                  />
                </>
              )}

              {/* Confirmation for un-warn/un-ban */}
              {((modalType === "warn" && selectedClinic?.isWarn) ||
                (modalType === "ban" && selectedClinic?.isBan)) && (
                <Text style={{ marginBottom: 10 }}>
                  Are you sure you want to {modalType === "warn" ? "unwarn" : "unban"} this clinic?
                </Text>
              )}

              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity
                  onPress={() => {
                    setClinicMessage(false);
                    setSelectedClinic(null);
                    setReason("");
                  }}
                  style={{ marginRight: 15 }}
                >
                  <Text style={{ color: "#888" }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    if (!selectedClinic) return;

                    const needsReason =
                      (modalType === "warn" && !selectedClinic.isWarn) ||
                      (modalType === "ban" && !selectedClinic.isBan);

                    if (needsReason && reason.trim() === "") {
                      alert("Please enter a reason");
                      return;
                    }

                    console.log("Updating clinic:", selectedClinic.id, modalType, reason);

                    if (modalType === "warn") {

                      const { data, error } = await supabase
                        .from("clinic_profiles")
                        .update({
                          isWarn: !selectedClinic.isWarn,
                          notif_message: !selectedClinic.isWarn ? reason : null,
                          IsStriked: true,
                        })
                        .eq("id", selectedClinic.id);
                      console.log("Warn update result:", data, error);
                    } else if (modalType === "ban") {
                      const { data, error } = await supabase
                        .from("clinic_profiles")
                        .update({
                          isBan: !selectedClinic.isBan,
                          notif_message: !selectedClinic.isBan ? reason : null,
                        })
                        .eq("id", selectedClinic.id);
                      console.log("Ban update result:", data, error);
                    }

                    // Refresh clinic list from DB
                    const { data: refreshed, error: refErr } = await supabase
                      .from("clinic_profiles")
                      .select("*");
                    if (refErr) {
                      console.error("Clinic refresh error:", refErr);
                    } else {
                      setClinicList(refreshed || []);
                    }

                    setClinicMessage(false);
                    setSelectedClinic(null);
                    setReason("");
                  }}
                >
                  <Text style={{ color: "#007BFF" }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        </View>

    
        {/* Dashboard Chats --------------------------------------------------------------------------------------- */}
    
          <View style={[styles.dashboard, { width: !isDesktop ? '95%' : expanded ? '80%' : '95%', right: dashboardView === 'chats' ? 11 : 20000}]}>
         <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              alignSelf: isMobile ? "center" : "flex-start",
              color: "#00505cff",
            }}
          >
            Support
          </Text>
          </View>
    
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
      flexDirection: !isMobile ? "row" : "column",
      flexWrap: !isMobile ? "wrap" : "nowrap",
      justifyContent: !isMobile ? "space-between" : "center",
    }}
  >
    {[
      {
        key: "miguel",
        image: require("../../assets/team/migueldel.png"),
        name: "Miguel Del Rosario",
        role: "Project Manager",
      },
      {
        key: "paala",
        image: require("../../assets/team/paala.png"),
        name: "Paala James",
        role: "Programmer Specialist",
      },
      {
        key: "elbert",
        image: require("../../assets/team/elbert.png"),
        name: "Elbert Rosales",
        role: "Quality Assurance",
      },
      {
        key: "rex",
        image: require("../../assets/team/rex.png"),
        name: "Rex Carlo Rosales",
        role: "System Analyst",
      },
    ].map(({ key, image, name, role }) => (
      <View
        key={key}
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
          width: !isMobile ? "48%" : "100%", // 2x2 grid for web, full width on mobile
          marginBottom: 20,
        }}
      >
        <Image
          source={image}
          style={{
            width: 170,
            height: 170,
            borderRadius: 60,
            borderWidth: 2,
            borderColor: "#00bcd4",
            backgroundColor: "#eaeaea",
          }}
        />

        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "white",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "white",
            textAlign: "center",
          }}
        >
          {role}
        </Text>
      </View>
    ))}
  </View>
</View>

          </ScrollView>
        </View>
        )}

        {/* Dashboard Verify Clinic --------------------------------------------------------------------------------------- */}
  
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
            Verify Clinics
          </Text>

          {isMobile ? (
            // 📱 Mobile Card View
            <ScrollView contentContainerStyle={{ padding: 12 }}>
              {clinicList.filter(clinic => clinic.request_verification).length === 0 ? (
                <View style={{ alignItems: "center", marginTop: 40 }}>
                  <Text style={{ fontSize: 20, color: "gray" }}>- No Clinic Requests -</Text>
                </View>
              ) : (
                clinicList
                  .filter(clinic => clinic.request_verification === true)
                  .map((clinic, index) => (
                    <View
                      key={clinic.id}
                      style={{
                        backgroundColor: "#f9f9f9",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Clinic Name:</Text>
                      <Text style={{ marginBottom: 10 }}>{clinic.clinic_name || "N/A"}</Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Email:</Text>
                      <Text style={{ marginBottom: 10 }}>{clinic.email || "N/A"}</Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Mobile:</Text>
                      <Text style={{ marginBottom: 10 }}>{clinic.mobile_number || "N/A"}</Text>

                      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Address:</Text>
                      <Text style={{ marginBottom: 10 }}>{clinic.address || "N/A"}</Text>

                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        {/* Deny */}
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedClinicForAction(clinic);
                            setDenialReason("");
                            setDenialModalVisible(true);
                          }}
                          style={{
                            backgroundColor: "#c0392b",
                            padding: 8,
                            borderRadius: 5,
                            flex: 1,
                            marginRight: 8,
                          }}
                        >
                          <Text style={{ color: "#fff", textAlign: "center" }}>Deny</Text>
                        </TouchableOpacity>

                        {/* Verify */}
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedClinicForAction(clinic);
                            setVerificationModalVisible(true);
                          }}
                          style={{
                            backgroundColor: "#2ecc71",
                            padding: 8,
                            borderRadius: 5,
                            flex: 1,
                          }}
                        >
                          <Text style={{ color: "#fff", textAlign: "center" }}>Verify</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
              )}
            </ScrollView>
          ) : (
            // 🖥️ Desktop Table View
          <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1, minWidth: 1000 }}>
              {clinicList.filter(clinic => clinic.request_verification).length === 0 ? (
                <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                  <Text style={{ fontSize: 20, color: "gray" }}>- No Clinic Requests -</Text>
                </View>
              ) : (
                <>
                  {/* Header */}
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
                    {["Clinic Name", "Email", "Mobile", "Address", "Actions"].map((label, index) => (
                      <Text
                        key={index}
                        style={{ flex: 1, fontWeight: "700", color: "white" }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {label}
                      </Text>
                    ))}
                  </View>

                  {/* Rows */}
                  <ScrollView>
                    {clinicList
                      .filter(clinic => clinic.request_verification)
                      .map((clinic, index) => (
                        <View
                          key={clinic.id}
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
                          <Text style={{ flex: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                            {clinic.clinic_name || "N/A"}
                          </Text>
                          <Text style={{ flex: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                            {clinic.email || "N/A"}
                          </Text>
                          <Text style={{ flex: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                            {clinic.mobile_number || "N/A"}
                          </Text>
                          <Text style={{ flex: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                            {clinic.address || "N/A"}
                          </Text>

                          {/* Actions */}
                          <View style={{ flex: 1, flexDirection: "row" }}>
                            {/* Deny */}
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedClinicForAction(clinic);
                                setDenialReason("");
                                setDenialModalVisible(true);
                              }}
                              style={{
                                backgroundColor: "#c0392b",
                                paddingVertical: 6,
                                paddingHorizontal: 12,
                                borderRadius: 6,
                                marginRight: 10,
                              }}
                            >
                              <Text style={{ color: "#fff", fontSize: 14 }}>Deny</Text>
                            </TouchableOpacity>

                            {/* Verify */}
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedClinicForAction(clinic);
                                setVerificationModalVisible(true);
                              }}
                              style={{
                                backgroundColor: "#2ecc71",
                                paddingVertical: 6,
                                paddingHorizontal: 12,
                                borderRadius: 6,
                              }}
                            >
                              <Text style={{ color: "#fff", fontSize: 14 }}>Verify</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </ScrollView>
                </>
                
              )}
            </View>
          </ScrollView>
          )}
        </View>
                  {/* ⛔ Denial Modal */}
                  <Modal visible={denialModalVisible} transparent animationType="fade">
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
                      <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, width: isMobile ? "90%" : "40%" }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: '#00505cff' }}>
                          Reason for Denial
                        </Text>
                        <TextInput
                          placeholder="Enter reason..."
                          value={denialReason}
                          onChangeText={setDenialReason}
                          multiline
                          style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            borderRadius: 8,
                            padding: 10,
                            height: 100,
                            marginBottom: 20,
                          }}
                        />

                        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                          <TouchableOpacity
                            onPress={() => {
                              setDenialModalVisible(false);
                              setDenialReason("");
                              setSelectedClinicForAction(null);
                            }}
                            style={{ marginRight: 20 }}
                          >
                            <Text style={{ color: "#888" }}>Cancel</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={async () => {
                              if (!selectedClinicForAction) return;
                              if (denialReason.trim() === "") {
                                alert("Please enter a reason");
                                return;
                              }

                              const { error } = await supabase
                                .from("clinic_profiles")
                                .update({
                                  request_verification: false,
                                  denied_verification_reason: denialReason,
                                })
                                .eq("id", selectedClinicForAction.id);

                              if (error) {
                                alert("Error denying clinic.");
                                console.error(error);
                              } else {
                                setClinicList(prev =>
                                  prev.map(c =>
                                    c.id === selectedClinicForAction.id
                                      ? { ...c, request_verification: false }
                                      : c
                                  )
                                );
                              }

                              setDenialModalVisible(false);
                              setSelectedClinicForAction(null);
                              setDenialReason("");
                            }}
                          >
                            <Text style={{ color: "#c0392b", fontWeight: "bold" }}>Submit & Deny</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>

                  {/* ✅ Verification Modal */}
                  <Modal visible={verificationModalVisible} transparent animationType="fade">
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
                      <View
                        style={{
                          backgroundColor: "#fff",
                          padding: 20,
                          borderRadius: 10,
                          width: isMobile ? "90%" : "40%" ,
                          maxHeight: "90%",
                        }}
                      >
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: '#00505cff' }}>
                            Are you sure you want to verify{" "}
                            <Text style={{ fontWeight: "bold" }}>
                              {selectedClinicForAction?.clinic_name || "this clinic"}?
                            </Text>
                          </Text>

                          <View
                            style={{
                              marginTop: 15,
                              marginBottom: 20,
                              height: selectedClinicForAction?.license_photo_url ? 450 : undefined,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {selectedClinicForAction?.license_photo_url ? (
                              <Image
                                source={{ uri: selectedClinicForAction.license_photo_url }}
                                resizeMode="contain"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: 10,
                                  borderWidth: 1,
                                  borderColor: "#ccc",
                                }}
                              />
                            ) : (
                              <Text style={{ color: "#c0392b", fontStyle: "italic" }}>
                                This clinic did not provide a Business Permit.
                              </Text>
                            )}
                          </View>

                          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                            <TouchableOpacity
                              onPress={() => {
                                setVerificationModalVisible(false);
                                setSelectedClinicForAction(null);
                              }}
                              style={{ marginRight: 20 }}
                            >
                              <Text style={{ color: "#888" }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={async () => {
                                if (!selectedClinicForAction) return;

                                const { error } = await supabase
                                  .from("clinic_profiles")
                                  .update({
                                    request_verification: false,
                                    denied_verification_reason: null,
                                    isVerified: true,
                                  })
                                  .eq("id", selectedClinicForAction.id);

                                if (error) {
                                  alert("Error verifying clinic.");
                                  console.error(error);
                                } else {
                                  setClinicList(prev =>
                                    prev.map(c =>
                                      c.id === selectedClinicForAction.id
                                        ? { ...c, request_verification: false, isVerified: true }
                                        : c
                                    )
                                  );
                                }

                                setVerificationModalVisible(false);
                                setSelectedClinicForAction(null);
                              }}
                            >
                              <Text style={{ color: "#2ecc71", fontWeight: "bold" }}>Verify</Text>
                            </TouchableOpacity>
                          </View>
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
      </LinearGradient>
    </LinearGradient>
  )
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
    justifyContent: 'flex-start',
    alignItems: 'center',          // Make it higher than dashboard
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
    overflow: 'hidden'
  },
  dashboard: {
    position: 'absolute',
    right: 11,
    height: '90%',
    marginTop: 40,
    padding: 14,
    shadowColor: '#00000045',
    shadowRadius: 2,
    shadowOffset: { width: 4, height: 4 },
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignContent: 'center',
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
    color: '#000000ff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonTextUpdate: {
    color: '#000000ff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contentsmenu: {
    shadowColor: "#00000045",
    shadowRadius: 2,
    shadowOffset: { width: 2, height: 2 },
    borderRadius: 3,
    borderColor: 'rgba(0, 0, 0, 1)',
    width: '100%',
    padding: 5,
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(163, 255, 202, 1)',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 50,
    resizeMode: 'contain',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'nowrap',
    width: '100%',
    paddingHorizontal: 8,
    height: '30%',
  },
  card: {
    flex: 1,
    marginHorizontal: 8,
    height: 240,
    backgroundColor: '#ffffffff',
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
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b3e5fc',
    marginHorizontal: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  proinfo: {
    flexDirection: 'column',         // stack children vertically
    justifyContent: 'flex-start',    // align from top to bottom
    alignItems: 'center',            // center horizontally
    marginBottom: 20,
    flexWrap: 'nowrap',
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 5,             // add some vertical padding
    minHeight: 150,                  // ensure space for multiple items
  },
  redButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText1: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '20%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },

        avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatarText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
})
