import axios from "axios";
import type { FilterSettings } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" }
});

export async function fetchFilters() {
  const response = await api.get<FilterSettings>("/filters");
  return response.data;
}

export async function updateFilters(filters: FilterSettings) {
  const response = await api.post<FilterSettings>("/filters", filters);
  return response.data;
}
