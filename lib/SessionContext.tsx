import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type PatientProfile = {
  first_name: string;
  last_name: string;
  gender: string;
  birthdate: string;
  photo_url?: string;
  mobile_number: string;
};

type ClinicProfile = {
  clinic_name: string;
  mobile_number: string;
  address: string;
  clinic_photo_url?: string;
  license_photo_url?: string;
};

type SessionContextType = {
  isAuthenticated: boolean;
  session: Session | null;
  isLoading: boolean;
  role : string,
  signIn: (email: string, password: string) => void;
  signUp: (
    email: string,
    password: string,
    profile: PatientProfile
  ) => Promise<void>;
  signUpClinic: (
    email: string,
    password: string,
    clinicProfile: ClinicProfile
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  isAuthenticated: false,
  session: null,
  isLoading: true,
  role : "",
  signIn: async (email: string, password: string) => {},
  signUp: async (
    email: string,
    password: string,
    profile: PatientProfile
  ) => {},
  signUpClinic: async (
    email: string,
    password: string,
    clinicProfile: ClinicProfile
  ) => {},
  signOut: async () => {},
});

export const useSession = () => useContext(SessionContext);

// 📸 Upload photo to Supabase storage
const uploadPhoto = async (
  uri: string,
  folder: string
): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ext = uri.split(".").pop()?.split("?")[0] || "jpg";
    const filePath = `${folder}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("clinic-photos")
      .upload(filePath, blob, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("clinic-photos")
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl ?? null;
  } catch (err) {
    console.error("Upload exception:", err);
    return null;
  }
};

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<string>("");

  const signUp = async (
    email: string,
    password: string,
    profile: PatientProfile
  ) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes("user already") ||
          msg.includes("email already") ||
          msg.includes("duplicate")
        ) {
          alert("🚫 This email is already taken.");
          return;
        }

        alert(`Sign-up failed: ${error.message}`);
        throw error;
      }

      await AsyncStorage.setItem("temp_profile", JSON.stringify(profile));
    } catch (err: any) {
      console.error("Sign-up error:", err);
      throw err;
    }
  };

  const signUpClinic = async (
    email: string,
    password: string,
    clinicProfile: ClinicProfile
  ) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes("user already") ||
          msg.includes("email already") ||
          msg.includes("duplicate")
        ) {
          alert("🚫 This email is already taken.");
          return;
        }

        alert(`Sign-up failed: ${error.message}`);
        throw error;
      }

      await AsyncStorage.setItem(
        "temp_clinic_profile",
        JSON.stringify(clinicProfile)
      );
      alert(
        "✅ Clinic account created. Please verify your email. If you did not receive a verification, try to use other email."
      );
    } catch (err: any) {
      console.error("Clinic sign-up error:", err);
      throw err;
    }
  };

  const signIn = async (
    email: string,
    password: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { session, user } = data;
      if (!session || !user) throw new Error("No session or user returned.");


      // Your existing logic to handle temp profiles insertion

      const { data: patientProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!patientProfile) {
        const storedProfile = await AsyncStorage.getItem("temp_profile");
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          await supabase.from("profiles").insert([
            {
              id: user.id,
              first_name: parsed.first_name,
              last_name: parsed.last_name,
              gender: parsed.gender,
              birthdate: parsed.birthdate,
              avatar_url: parsed.photo_url || null,
              mobile_number: parsed.mobile_number,
              role: "Patient",
            },
          ]);
          await AsyncStorage.removeItem("temp_profile");
        }
      }

      const { data: clinicProfile } = await supabase
        .from("clinic_profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!clinicProfile) {
        const storedClinic = await AsyncStorage.getItem("temp_clinic_profile");
        if (storedClinic) {
          const parsed = JSON.parse(storedClinic);

          const uploadedClinicPhotoUrl = parsed.clinic_photo_url
            ? await uploadPhoto(parsed.clinic_photo_url, "clinic")
            : null;

          const uploadedLicensePhotoUrl = parsed.license_photo_url
            ? await uploadPhoto(parsed.license_photo_url, "license")
            : null;

          const { error: insertError } = await supabase
            .from("clinic_profiles")
            .insert([
              {
                id: user.id,
                clinic_name: parsed.clinic_name,
                address: parsed.address,
                mobile_number: parsed.mobile_number,
                clinic_photo_url: uploadedClinicPhotoUrl,
                license_photo_url: uploadedLicensePhotoUrl,
                role: "Clinic",
              },
            ]);

          if (insertError) {
            console.error("Clinic insert error:", insertError);
          } else {
            await AsyncStorage.removeItem("temp_clinic_profile");
          }
        }
      }

    const adminCheck = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const clinicCheck = await supabase
      .from("clinic_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const patientCheck = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    let role = ""; // default role

    if (adminCheck.data?.role?.toLowerCase() === "admin") {
      role = "admin";
    }
    if (clinicCheck.data?.role) {
      role = "clinic";
    }
    if (patientCheck.data?.role) {
      role = "patient";
    }

      // Optionally save role for later use
      await AsyncStorage.multiSet([
        ["access_token", session.access_token],
        ["refresh_token", session.refresh_token],
        ["user_id", user.id],
        ["user_role", role]
      ]);

      setRole(role);
      setSession(session);
      setAuthenticated(true);
    } catch (err: any) {
      console.error("Sign-in error:", err?.message || err);
      if (err?.message?.toLowerCase().includes("invalid login credentials")) {
        alert("❌ Invalid email or password.");
      } else {
        alert("⚠️ An error occurred while signing in.");
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setAuthenticated(false);
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        "user_id",
        "user_role"
      ]);
    } catch (err: any) {
      console.error("Sign-out error:", err.message || err);
      throw err;
    }
  };

  useEffect(() => {
  let authSubscription: ReturnType<typeof supabase.auth.onAuthStateChange>["data"]["subscription"];

  const restoreSession = async () => {
    try {
      const [[, accessToken], [, refreshToken], [, storedRole]] = await AsyncStorage.multiGet([
        "access_token",
        "refresh_token",
        "user_role",
      ]);

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("🔁 Session restore error:", error.message);
          setAuthenticated(false);
          setSession(null);
        } else {
          setSession(data.session);
          setAuthenticated(true);
        }
      }

      // Always try to update role from storage (even if session fails)
      if (storedRole) {
        setRole(storedRole);
      }
    } catch (err) {
      console.error("⚠️ Session restore exception:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToAuthChanges = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await AsyncStorage.multiSet([
          ["access_token", session.access_token],
          ["refresh_token", session.refresh_token],
        ]);

        const storedRole = await AsyncStorage.getItem("user_role");
        if (storedRole) {
          setRole(storedRole);
        } else {
          setRole(""); // fallback
        }

        setSession(session);
        setAuthenticated(true);
      } else {
        setSession(null);
        setAuthenticated(false);
        setRole("");
      }
    });

    authSubscription = subscription;
  };

  restoreSession();
  subscribeToAuthChanges();

  return () => {
    if (authSubscription) authSubscription.unsubscribe();
  };
}, []);


  return (
    <SessionContext.Provider
      value={{
        isAuthenticated,
        session,
        isLoading,
        role,
        signIn,
        signUp,
        signUpClinic,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
