import { useQuery } from "@tanstack/react-query";
import { fetchFilters } from "../services/filterAPI";

export function useFilters() {
  return useQuery({
    queryKey: ["filters"],
    queryFn: fetchFilters,
    staleTime: 1000 * 60 * 10
  });
}
