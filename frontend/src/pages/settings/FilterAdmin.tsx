import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFilters, updateFilters } from "../../services/filterAPI";
import { useFilters } from "../../hooks/useFilters";
import { useNotification } from "../../hooks/useNotification";

export function FilterAdmin() {
  const { data, isLoading } = useFilters();
  const [revenue, setRevenue] = useState(1250);
  const [growth, setGrowth] = useState(10);
  const [sectors, setSectors] = useState<string[]>(["Tech", "Manufacturing"]);
  const queryClient = useQueryClient();
  const notify = useNotification();

  const mutation = useMutation(updateFilters, {
    onSuccess: (updated) => {
      queryClient.setQueryData(["filters"], updated);
      notify("Filter updated successfully. Affects X leads.", "success");
    },
    onError: () => {
      notify("Unable to save favorite filters.", "error");
    }
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setRevenue(data.revenueThreshold ?? 1250);
    setGrowth(data.growthThreshold ?? 10);
    setSectors(data.sectors ?? ["Tech", "Manufacturing"]);
  }, [data]);

  if (isLoading) {
    return <div className="page-grid">Loading filter settings...</div>;
  }

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-card__header">
          <span className="section-card__eyebrow">Filter Admin</span>
          <h2>Qualification thresholds</h2>
        </div>

        <div className="settings-grid">
          <label>
            Revenue threshold
            <input type="number" value={revenue} onChange={(event) => setRevenue(Number(event.target.value))} />
          </label>
          <label>
            Growth threshold (%)
            <input type="number" value={growth} onChange={(event) => setGrowth(Number(event.target.value))} />
          </label>
          <label>
            Sectors
            <input type="text" value={sectors.join(", ")} onChange={(event) => setSectors(event.target.value.split(",").map((item) => item.trim()))} />
          </label>
        </div>

        <div className="settings-actions">
          <button onClick={() => mutation.mutate({
            revenueThreshold: revenue,
            growthThreshold: growth,
            sectors,
            geographies: data?.geographies ?? [],
            sources: data?.sources ?? [],
            refreshSchedule: data?.refreshSchedule ?? "Twice weekly"
          })}>
            Save
          </button>
        </div>
      </section>
    </div>
  );
}
