export type ClockScheduleType = {
  hour: number;
  minute: number;
  atm: "AM" | "PM";
};

export type DayScheduleType = {
  hasSchedule: boolean;
  from: ClockScheduleType;
  to: ClockScheduleType;
};