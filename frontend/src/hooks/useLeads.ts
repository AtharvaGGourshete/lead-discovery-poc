import { useQuery } from "@tanstack/react-query";
import type { Lead } from "../types";
import { fetchLeads } from "../services/leadAPI";

export function useLeads(filters: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => fetchLeads(filters),
    keepPreviousData: true
  });
}
