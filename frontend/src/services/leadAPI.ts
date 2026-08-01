import axios from "axios";
import type { Lead, QualificationResult, NewsSignal } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" }
});

export async function fetchLeads(params: Record<string, string | number | undefined>) {
  const response = await api.get<{ data: Lead[]; total: number }>("/leads", { params });
  return response.data;
}

export async function fetchLeadById(id: string) {
  const response = await api.get<Lead>(`/leads/${id}`);
  return response.data;
}

export async function fetchLeadQualification(id: string) {
  const response = await api.get<QualificationResult>(`/leads/${id}/qualification`);
  return response.data;
}

export async function fetchLeadNews(id: string) {
  const response = await api.get<NewsSignal[]>(`/leads/${id}/news`);
  return response.data;
}
