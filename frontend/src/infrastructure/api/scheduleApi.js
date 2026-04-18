import { requestJson } from "./httpClient.js";

export function fetchWeeklySchedule() {
  return requestJson("/api/horarios/semana");
}
