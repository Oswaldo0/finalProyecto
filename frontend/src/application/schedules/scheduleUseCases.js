import { fetchWeeklySchedule } from "../../infrastructure/api/scheduleApi.js";

export function listWeeklySchedule() {
  return fetchWeeklySchedule();
}
