export type Tier = "A" | "B" | "C";

export interface Lead {
  id: string;
  name: string;
  sector: string;
  revenue: number;
  growth: number;
  tier: Tier;
  source: string;
  dateAdded: string;
  symbol: string;
}

export interface QualificationResult {
  tier: Tier;
  score: number;
  filterResults: Record<string, boolean>;
  newsSignals: NewsSignal[];
}

export interface NewsSignal {
  id: string;
  title: string;
  source: string;
  date: string;
  signalType: string;
}

export interface FilterSettings {
  revenueThreshold: number;
  growthThreshold: number;
  sectors: string[];
  geographies: string[];
  sources: string[];
  refreshSchedule: string;
}

export interface RefreshEntry {
  id: string;
  date: string;
  status: "success" | "failed";
  newLeads: number;
  updatedLeads: number;
  removedLeads: number;
}

export interface RefreshStatus {
  schedule: string;
  nextRefresh: string;
  history: RefreshEntry[];
  health: {
    yahoo: string;
    gnews: string;
    market: string;
  };
  stats: {
    total: number;
    qualified: number;
    tierA: number;
    tierB: number;
    tierC: number;
    unqualified: number;
  };
}
