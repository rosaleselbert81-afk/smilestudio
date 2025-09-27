import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import TimePicker from "@/components/TimePicker";
import Checkbox from "expo-checkbox";
import { supabase } from "@/lib/supabase";

type WeekScheduleEditorProps = {
  clinicId: string | undefined;
  onSave: () => void;
};

type ClockScheduleType = {
  hour: number;
  minute: number;
  atm: "AM" | "PM";
};

type DayScheduleType = {
  hasSchedule: boolean;
  from: ClockScheduleType;
  to: ClockScheduleType;
};

type DayScheduleView = {
  title: string;
  hasSchedule : boolean,
  from: ClockScheduleType | undefined;
  to: ClockScheduleType| undefined;
  onValuesChange: (
    from: ClockScheduleType,
    to: ClockScheduleType,
    hasSchedule: boolean
  ) => void;
};

type WeekScheduleType = {
    clinic_id? : string,
    sunday? : DayScheduleType,
    monday? : DayScheduleType,
    tuesday? : DayScheduleType,
    wednesday? : DayScheduleType,
    thursday? : DayScheduleType,
    friday? : DayScheduleType,
    saturday? : DayScheduleType
}

const WeekScheduleEditor = (props: WeekScheduleEditorProps) => {
const { width } = useWindowDimensions();
  const [sun, setSun] = useState<DayScheduleType>();
  const [mon, setMon] = useState<DayScheduleType>();
  const [tue, setTue] = useState<DayScheduleType>();
  const [wed, setWed] = useState<DayScheduleType>();
  const [thu, setThu] = useState<DayScheduleType>();
  const [fri, setFri] = useState<DayScheduleType>();
  const [sat, setSat] = useState<DayScheduleType>();

  const getClnicSchedule = async () => {
    const { data, error } = await supabase
      .from("clinic_schedule")
      .select(`*`)
      .limit(1)
      .eq("clinic_id", props.clinicId)

    if (error) {
      console.log(`ERR mod getClnicSchedule : ${error}`);
      return;
    }

    setSun(data[0]?.sunday)
    setMon(data[0]?.monday)
    setTue(data[0]?.tuesday)
    setWed(data[0]?.wednesday)
    setThu(data[0]?.thursday)
    setFri(data[0]?.friday)
    setSat(data[0]?.saturday)
  };

const updateSchedule = async () => {
  const { data, error } = await supabase
    .from("clinic_schedule")
    .select("*")
    .eq("clinic_id", props.clinicId);

  if (error) {
    console.log(`ERR clinic record schedule : ${error}`);
  }

function getMinutesSinceMidnight(hour: number, minute: number, atm: "AM" | "PM"): number {
  const isPM = atm === "PM";
  const adjustedHour = hour % 12 + (isPM ? 12 : 0); // 12 AM => 0, 12 PM => 12
  return adjustedHour * 60 + minute;
}

function isValidSchedule(
  from: ClockScheduleType,
  to: ClockScheduleType
): boolean {
  const fromMinutes = getMinutesSinceMidnight(from.hour, from.minute, from.atm);
  const toMinutes = getMinutesSinceMidnight(to.hour, to.minute, to.atm);
  return toMinutes - fromMinutes >= 30;
}

  // Construct queryBody conditionally
const validateDay = (day: DayScheduleType | undefined, name: string): DayScheduleType | null => {
  if (!day?.hasSchedule) return null;

  const valid = isValidSchedule(day.from, day.to);
  if (!valid) {
    alert(`${name} schedule must be at least 30 minutes.`);
    throw new Error(`${name} schedule invalid`);
  }

  return day;
};

let queryBody: WeekScheduleType;

try {
  queryBody = {
    clinic_id: props.clinicId,
    sunday: validateDay(sun, "Sunday"),
    monday: validateDay(mon, "Monday"),
    tuesday: validateDay(tue, "Tuesday"),
    wednesday: validateDay(wed, "Wednesday"),
    thursday: validateDay(thu, "Thursday"),
    friday: validateDay(fri, "Friday"),
    saturday: validateDay(sat, "Saturday"),
  };
} catch (err) {
  console.log(err);
  return; // Stop update if any invalid
}


  // Update or insert
  if (data?.length !== 0) {
    const { error } = await supabase
      .from("clinic_schedule")
      .update(queryBody)
      .eq("clinic_id", props.clinicId);

    if (error) {
      console.log(`ERR mod updateSchedule : ${error}`);
      return;
    }
  } else {
    const { error } = await supabase
      .from("clinic_schedule")
      .insert(queryBody);

    if (error) {
      console.log(`ERR mod updateSchedule : ${error}`);
      return;
    }
  }

  // Close dialog if saved correctly
  props.onSave();
};


  useEffect(() => {
    getClnicSchedule();
  }, []);

  return (
<View
  style={{
    ...(width > 720
    ? {
        width: 500,
    }
    : {
        width: 370,
    }),
    height: "85%",
    padding: 20,
    minHeight: 500,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc"

  }}
>
  <Text
    style={{
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: "#003f30",
      textAlign: "center",
    }}
  >
    Edit Weekly Schedule
  </Text>

  <ScrollView
    style={{
      width: "100%",
      marginTop: 12,
      gap: 12,
      paddingHorizontal: 4,
    }}
  >
    <DayScheduleView
      hasSchedule={sun?.hasSchedule || false}
      title="Sunday"
      from={sun?.from}
      to={sun?.to}
      onValuesChange={(from, to, hasSchedule) => setSun({ from, to, hasSchedule })}
    />
    <DayScheduleView
      hasSchedule={mon?.hasSchedule || false}
      title="Monday"
      from={mon?.from}
      to={mon?.to}
      onValuesChange={(from, to, hasSchedule) => setMon({ from, to, hasSchedule })}
    />
    <DayScheduleView
      hasSchedule={tue?.hasSchedule || false}
      title="Tuesday"
      from={tue?.from}
      to={tue?.to}
      onValuesChange={(from, to, hasSchedule) => setTue({ from, to, hasSchedule })}
    />
    <DayScheduleView
      hasSchedule={wed?.hasSchedule || false}
      title="Wednesday"
      from={wed?.from}
      to={wed?.to}
      onValuesChange={(from, to, hasSchedule) => setWed({ from, to, hasSchedule })}
    />
    <DayScheduleView
      hasSchedule={thu?.hasSchedule || false}
      title="Thursday"
      from={thu?.from}
      to={thu?.to}
      onValuesChange={(from, to, hasSchedule) => setThu({ from, to, hasSchedule })}
    />
    <DayScheduleView
      hasSchedule={fri?.hasSchedule || false}
      title="Friday"
      from={fri?.from}
      to={fri?.to}
      onValuesChange={(from, to, hasSchedule) => setFri({ from, to, hasSchedule })}
    />
    <DayScheduleView
      hasSchedule={sat?.hasSchedule || false}
      title="Saturday"
      from={sat?.from}
      to={sat?.to}
      onValuesChange={(from, to, hasSchedule) => setSat({ from, to, hasSchedule })}
    />
  </ScrollView>

  <TouchableOpacity
    style={{
    ...(width > 720
    ? {
        paddingVertical: 20,
        height: 30,
    }
    : {
        width: 500,
        height: 40,
        marginTop: 15,
    }),
      width: "100%",
      alignSelf: "center",
      backgroundColor: "green",
    
      borderRadius: 10,
      shadowColor: "#000",
    }}
    onPress={() => {
      // SAVE DATA TO DB
      // CLOSE WHEN STATUS = OK
      props.onSave();
      updateSchedule();
    }}
  >
    <Text
      style={{
        color: "white",
        fontWeight: "700",
        textAlign: "center",
        fontSize: 16,
         ...(width > 720
        ? {
            bottom: 10,
        }
        : {
            top: 10,
        }),
            }}
    >
      Save
    </Text>
  </TouchableOpacity>
  
</View>

  );
};

export default WeekScheduleEditor;

const DayScheduleView = (props: DayScheduleView) => {
  const [fromHour, setFromHour] = useState<number>(12);
  const [fromMinute, setFromMinute] = useState<number>(0);
  const [fromAtm, setFromAtm] = useState<"AM" | "PM">("AM");

  const [toHour, setToHour] = useState<number>(props?.to?.hour || 1);
  const [toMinute, setToMinute] = useState<number>(props?.to?.minute || 0);
  const [toAtm, setToAtm] = useState<"AM" | "PM">(props?.to?.atm || "AM");

  const [hasSchedule, setHasSchedule] = useState<boolean>(false);

  useEffect(() => {
    props.onValuesChange(
      {
        hour: fromHour,
        minute: fromMinute,
        atm: fromAtm,
      },
      {
        hour: toHour,
        minute: toMinute,
        atm: toAtm,
      },
      hasSchedule
    );
  }, [fromHour, fromMinute, fromAtm, toHour, toMinute, toAtm, hasSchedule]);

  useEffect(()=>{
    if(!props.from || !props.to) return;

    setFromHour(props.from.hour)
    setFromMinute(props.from.minute)
    setFromAtm(props.from.atm)
    setToHour(props.to.hour)
    setToMinute(props.to.minute)
    setToAtm(props.to.atm)
    setHasSchedule(props.hasSchedule)

  },[props.from,props.to])

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        gap: 15,
      }}
    >
      <View
        style={{
          minWidth: 80,
          flexDirection: "row",
          gap: 5,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setHasSchedule(prev => !prev)}
        style={{ flexDirection: 'row', alignItems: 'center' }}
        >
        <Checkbox
            value={hasSchedule}
            onValueChange={(val) => setHasSchedule(val)} // use onValueChange for expo-checkbox
            style={{ pointerEvents: 'none' }} // ✅ prevents Checkbox from intercepting touches
        />
        </TouchableOpacity>
        <Text
          style={{
            minWidth: 60,
          }}
        >
          {props.title}
        </Text>
      </View>
      {hasSchedule && (
        <>
        <View
        style={{
            padding: 8,
            flexDirection: "column",
            alignItems: "center",
            gap: 2, // spacing between From and To
            marginVertical: 10,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "#ccc"
        }}
        >
        <View
            style={{
            flex: 1,
            gap: 5,
            }}
        >
            <Text
            style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#333",
            }}
            >
            From
            </Text>
            <TimePicker
            hour={fromHour.toString().padStart(2, "0")}
            minute={fromMinute.toString().padStart(2, "0")}
            atomicTime={fromAtm}
            trigger={undefined}
            minuteSkipBy={1}
            onTimeSelected={(hh, mm, atm) => {
                setFromHour(Number(hh));
                setFromMinute(Number(mm));
                setFromAtm(atm);
            }}
            />
        </View>

        <View
            style={{
            flex: 1,
            gap: 5,
            }}
        >
            <Text
            style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#333",
            }}
            >
            To
            </Text>
            <TimePicker
            hour={toHour.toString().padStart(2, "0")}
            minute={toMinute.toString().padStart(2, "0")}
            atomicTime={toAtm}
            trigger={undefined}
            minuteSkipBy={1}
            onTimeSelected={(hh, mm, atm) => {
                setToHour(Number(hh));
                setToMinute(Number(mm));
                setToAtm(atm);
            }}
            />
        </View>
        </View>

        </>
      )}
    </View>
  );
};
