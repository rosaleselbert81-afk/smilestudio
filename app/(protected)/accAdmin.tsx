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

  const [selectedClinicName, setSelectedClinicName] = useState("");
  const [selectedClinicEmail, setSelectedClinicEmail] = useState("");
  const [selectedClinicSlogan, setSelectedClinicSlogan] = useState("");
  const [selectedClinicAddress, setSelectedClinicAddress] = useState("");
  const [selectedClinicMobile, setSelectedClinicMobile] = useState("");
  const [selectedClinicCreatedAt, setSelectedClinicCreatedAt] = useState("");
  const [selectedClinicRole, setSelectedClinicRole] = useState("");
  const [selectedClinicDentist, setSelectedClinicDentist] = useState(false);
  const [selectedClinicImage, setSelectedClinicImage] = useState();

  const [selectedClinicId, setSelectedClinicId] = useState<string>();
  const [messageToClinic, setMessageToClinic] = useState<string>();
  const [mapView, setMapView] = useState<[number | undefined, number| undefined]>([undefined,undefined]);

  const offset = moved ? -320 : 0
  const moboffset = moved ? -370 : 0
  const mobbutoffset = moved ? -305: 0

  const [viewClinic, setviewClinic] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSignout, setModalSignout] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  
  const [dashboardView, setDashboardView] = useState('profile');

  const [clinicList, setClinicList] = useState<any[]>([]);

  const [tMap, setTMap] = useState(false);

  
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
      <View style={{width: drawerWidth, left: 0, top: 0, flexDirection: 'row', height: '100%', position: 'absolute', zIndex: 1, transform: [{ translateX: isMobile ? mobbutoffset : offset }]}}>
        <LinearGradient
            style={{ ...styles.glider,  bottom: 0, left: 0, top: 0, width: drawerWidth }}
            colors={['#003a3aff', '#2f4f2fff']}
          >
          <View style={{flex: 1}}>
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
            <ScrollView contentContainerStyle={{   
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100%',
              paddingBottom: 60, }}> 
            <Image
              source={require('../../assets/favicon.ico.png')}
              style={styles.logo}
            />

            <Text style={{fontWeight: 'bold', fontSize: 30, marginTop: -40, marginBottom: 30, color: 'white', textAlign: 'center', }}>SMILE STUDIO</Text>
            <View style={{ ...styles.container, width: '100%' }}>
              <Text style={{fontWeight: 'bold', fontSize: 20, color: 'white', textAlign: 'center', marginBottom: 4}}>Welcome back Admin!</Text>
                <Text
                  style={{
                    outlineWidth: 0,
                    width: 215,
                    fontWeight: 'bold',
                    fontSize: 15, // initial font size
                    color: '#ffd445ff',
                    textAlign: 'center',
                    marginBottom: 7,
                  }}
                  numberOfLines={1} // Only one line, don't wrap
                  adjustsFontSizeToFit={true} // Automatically shrink to fit
                >{session?.user?.email}</Text>

                <TouchableOpacity
                  style={{...styles.mar3, width: "90%"}}
                  onPress={() => setModalUpdate(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator animating color={"black"} />
                  ) : (
                    <Text style={{...styles.buttonTextUpdate, textAlign: "center"}}>Edit Information</Text>
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
                        <Text style={{textAlign: 'center'}}>Username: {adminName}</Text>
                        <Text style={{textAlign: 'center'}}>Bio: {website}</Text>
                      </View>

                      <Text style={{textAlign: 'center', marginTop: 25, fontWeight: 'bold'}}>Bio</Text>
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
                    setDashboardView("profile")
                    if (isMobile) {
                      setMoved((prev) => !prev);
                      setExpanded((prev) => !prev);
                    }
                  }}
                  style={styles.mar2}
                  disabled={loading}
                >
                  {
                    loading ? <ActivityIndicator animating color={"black"}/> : <Text style={{...styles.buttonText, color: "#ffff"}}>Profile</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDashboardView("clinics")
                    if (isMobile) {
                      setMoved((prev) => !prev);
                      setExpanded((prev) => !prev);
                    }
                  }}
                  style={styles.mar2}
                  disabled={loading}
                >
                  {
                    loading ? <ActivityIndicator animating color={"black"}/> : <Text style={{...styles.buttonText, color: "#ffff"}}>Clinics</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDashboardView("authusers")
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
                    <Text style={{...styles.buttonText, color: "#ffff"}}>Auth Users</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDashboardView("authclinics")
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
                    <Text style={{...styles.buttonText, color: "#ffff"}}>Auth Clinics</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setDashboardView("chats")
                    if (isMobile) {
                      setMoved((prev) => !prev);
                      setExpanded((prev) => !prev);
                    }
                  }}
                  style={styles.mar2} 
                  disabled={loading}>
                  {loading ? <ActivityIndicator animating color={'black'} /> : <Text style={{...styles.buttonText, color: "#ffff"}}>Chats</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDashboardView("team")
                    if (isMobile) {
                      setMoved((prev) => !prev);
                      setExpanded((prev) => !prev);
                    }
                  }}
                  style={styles.mar2}
                  disabled={loading}
                >
                  {
                    loading ? <ActivityIndicator animating color={"black"}/> : <Text style={{...styles.buttonText, color: "#ffff"}}>Team</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDashboardView("ar");
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
                      Augmented Reality
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
                  <MaterialIcons name="keyboard-arrow-right" size={34} color="black" />
                ) : (
                  <MaterialIcons name="keyboard-arrow-left" size={34} color="black" />
                )}
              </TouchableOpacity>
            </View>
          )}
      </View>

     

      {/* Dashboard */}
      <LinearGradient style={{ flex: 1, position: 'relative' }} colors={['#87ffd9ff', '#bdeeffff']}>

    
          {/* Dashboard Profile --------------------------------------------------------------------------------------- */}
    

        <View style={[styles.dashboard, { width: !isDesktop ? '95%' : expanded ? '80%' : '95%', right: dashboardView === 'profile' ? 11 : 20000}]}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, alignSelf: isMobile ? 'center' : 'flex-start', color: '#003f30ff'}}>
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
                    <Text style={{ fontWeight: 'bold', fontSize: 50, textAlign: 'center'}}>
                      {userCount !== null ? userCount : '...'}
                    </Text>
                    <Text style={{ textAlign: 'center', marginTop: 6, fontSize: isMobile ? 15 : 25 }}>
                      TOTAL PATIENTS
                    </Text>
                </View>
                <View style={styles.card}>
                    <Text style={{ fontWeight: 'bold', fontSize: 50, textAlign: 'center'}}>
                      {clinicCount !== null ? clinicCount : '...'}
                    </Text>
                    <Text style={{ textAlign: 'center', marginTop: 6, fontSize: isMobile ? 15 : 25 }}>
                      SJDM CLINICS
                    </Text>
                </View>
                <View style={styles.card}>
                  <View style={{flexDirection: 'column',}}>
                  <View>
                      <Text style={{ textAlign: 'center', marginTop: 6, fontSize: isMobile ? 15 : 25 }}>
                        (Not Finished)
                      </Text>
                    </View>
                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                      <TouchableOpacity
                        style={styles.redButton}
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={{...styles.buttonText1, fontSize: isMobile ? 10 : 25 }}>Overview</Text>
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
    
            <View style={[styles.dashboard, { width: !isDesktop ? '95%' : expanded ? '80%' : '95%', right: dashboardView === 'clinics' ? 11 : 20000}]}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, alignSelf: isMobile ? 'center' : 'flex-start', color: '#003f30ff'}}>
                    Clinics
                </Text>
                <View
                    style={
                      {
                        width: !isDesktop ? '100%' : expanded ? '90%' : '95%',
                        alignSelf: 'center',
                        position: 'absolute',
                        height: isMobile ? "90%" : "85%",
                        marginTop: 80,
                        padding: 14,
                        shadowColor: '#00000045',
                        shadowRadius: 2,
                        shadowOffset: { width: 4, height: 4 },
                        backgroundColor: '#e5ffceff',
                        borderRadius: 12,
                      }
                    }
                  >
                    <ScrollView>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: 'bold',
                          marginBottom: 20,
                          color: '#003f30ff',
                          alignSelf: 'center',
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
        }}
      >
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
            <Text style={{ fontSize: 11, color: "#226064ff", marginBottom: 6}}>{selectedClinicRole || "N/A"}</Text>
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
          <Text style={{ fontSize: 14, fontWeight: 500 }}>📍 {selectedClinicAddress || "No address provided"}</Text>
          <Text style={{ fontSize: 14, fontWeight: 500 }}>📞 {selectedClinicMobile || "No contact"}</Text>
          <Text style={{ fontSize: 14, fontWeight: 500 }}>🗓️ Joined: {selectedClinicCreatedAt || "N/A"}</Text>
          <Text style={{ fontSize: 14, fontWeight: 500 }}>
            🦷 Dentist Availability: {selectedClinicDentist ? "Yes" : "No"}
          </Text>
        </View>

          {/* Schedule */}
          <Text style={{ fontSize: 14, fontWeight: 500, marginTop: 12 }}>
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

            {/* Only show if all days have no schedule */}
            {[
              selectedSunday,
              selectedMonday,
              selectedTuesday,
              selectedWednesday,
              selectedThursday,
              selectedFriday,
              selectedSaturday,
            ].every(
              (day) =>
                !day || day.from == null || day.to == null
            ) && (
              <Text style={{ color: "#999", fontSize: 14, textAlign: "center", marginTop: 8 }}>
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
              // 👉 put your message logic here
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

          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setviewClinic(false)}
            style={{
              flex: 1,
              marginLeft: 8,
              backgroundColor: "#e74c3c",
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
          </TouchableOpacity>
        </View>
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
              color: "#003f30ff",
            }}
          >
            Auth Users
          </Text>
        </View>

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
              color: "#003f30ff",
            }}
          >
            Auth Clinics
          </Text>
        </View>

    
          {/* Dashboard Chats --------------------------------------------------------------------------------------- */}
    
          <View style={[styles.dashboard, { width: !isDesktop ? '95%' : expanded ? '80%' : '95%', right: dashboardView === 'chats' ? 11 : 20000}]}>
         <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              alignSelf: isMobile ? "center" : "flex-start",
              color: "#003f30ff",
            }}
          >
            Chats
          </Text>
          </View>
    
          {/* Dashboard Team --------------------------------------------------------------------------------------- */}
    
          <View style={[styles.dashboard, { width: !isDesktop ? '95%' : expanded ? '80%' : '95%', right: dashboardView === 'team' ? 11 : 20000}]}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                marginBottom: 20,
                textAlign: 'center',
                color: '#003f30',
              }}>
                Meet the Team
              </Text>

                <View
                  style={{
                    alignItems: 'center',
                    marginBottom: 30,
                    backgroundColor: '#f0fff0',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >

                  <Image
                    source={
                      require('../../assets/team/migueldel.png') // fallback/default image
                    }
                    style={{
                      width: 170,
                      height: 170,
                      borderRadius: 60,
                      borderWidth: 2,
                      borderColor: '#00bcd4',
                      backgroundColor: '#eaeaea',
                    }}
                  />
                  
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Miguel Del Rosario</Text>
                  <Text style={{ fontSize: 16, color: '#555' }}>Project Manager</Text>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    marginBottom: 30,
                    backgroundColor: '#f0fff0',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >

                  <Image
                    source={
                      require('../../assets/team/paala.png') // fallback/default image
                    }
                    style={{
                      width: 170,
                      height: 170,
                      borderRadius: 60,
                      borderWidth: 2,
                      borderColor: '#00bcd4',
                      backgroundColor: '#eaeaea',
                    }}
                  />
                  
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Paala James</Text>
                  <Text style={{ fontSize: 16, color: '#555' }}>Programmer Specialist</Text>
                </View>

                                <View
                  style={{
                    alignItems: 'center',
                    marginBottom: 30,
                    backgroundColor: '#f0fff0',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >

                  <Image
                    source={
                      require('../../assets/team/elbert.png') // fallback/default image
                    }
                    style={{
                      width: 170,
                      height: 170,
                      borderRadius: 60,
                      borderWidth: 2,
                      borderColor: '#00bcd4',
                      backgroundColor: '#eaeaea',
                    }}
                  />
                  
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Elbert Rosales</Text>
                  <Text style={{ fontSize: 16, color: '#555' }}>Quality Assurance</Text>
                </View>

                                <View
                  style={{
                    alignItems: 'center',
                    marginBottom: 30,
                    backgroundColor: '#f0fff0',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >

                  <Image
                    source={
                      require('../../assets/team/rex.png') // fallback/default image
                    }
                    style={{
                      width: 170,
                      height: 170,
                      borderRadius: 60,
                      borderWidth: 2,
                      borderColor: '#00bcd4',
                      backgroundColor: '#eaeaea',
                    }}
                  />
                  
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Rex Carlo Rosales</Text>
                  <Text style={{ fontSize: 16, color: '#555' }}>System Analyst</Text>
                </View>
                
            </ScrollView>
          </View>

          {/* Dashboard Augmented Reality --------------------------------------------------------------------------------------- */}
  
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
                color: "#003f30ff",
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
    backgroundColor: '#fff',
    borderRadius: 12,
    alignContent: 'center',
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
    borderBottomWidth: 1,      // thickness of line
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
