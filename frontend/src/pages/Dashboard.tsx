import { useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { FunnelChart } from "../components/FunnelChart";

const stats = {
  discovered: 1247,
  qualified: 342,
  tierA: 87,
  tierB: 156,
  tierC: 99,
  lastRefresh: "2h ago"
};

const funnel = [
  { label: "Discovered", value: 1247 },
  { label: "Reviewed", value: 897 },
  { label: "Qualified", value: 634 },
  { label: "Approved", value: 342 }
];

const activity = [
  "Imported 23 new leads from Yahoo Finance",
  "Updated 12 existing companies with fresh revenue data",
  "Tagged 5 companies as Tier A",
  "Refreshed GNews signal classification",
  "Saved filter changes for manufacturing sector"
];

export function Dashboard() {
  const [company, setCompany] = useState("Aether Industries Limited");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchError("");
    setIsSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch(`/api/insights/company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Search failed. Please try again.");
      }

      setSearchResult(payload);
    } catch (error: any) {
      setSearchError(error?.message || "Unable to fetch search results.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-card__header">
          <span className="section-card__eyebrow">Company search</span>
          <h2>Search NSE-listed companies for annual report insights</h2>
        </div>

        <form className="search-panel" onSubmit={handleSearch}>
          <label htmlFor="company-input">Company name</label>
          <div className="search-panel__row">
            <input
              id="company-input"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Enter a company name"
            />
            <button type="submit" disabled={isSearching || !company.trim()}>
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
          {searchError ? <p className="error-banner">{searchError}</p> : null}
          {searchResult ? (
            <div className="metric-grid" style={{ marginTop: 16 }}>
              <div className="metric">
                <span className="metric__label">Company</span>
                <strong className="metric__value">{searchResult.companyDiscovery?.companyName || "Unknown"}</strong>
              </div>
              <div className="metric">
                <span className="metric__label">Annual report results</span>
                <strong className="metric__value">{searchResult.reportEngine?.candidates?.length ?? 0}</strong>
              </div>
              <div className="metric">
                <span className="metric__label">Report selected</span>
                <strong className="metric__value">{searchResult.reportEngine?.selectedReport?.title || "None"}</strong>
              </div>
            </div>
          ) : null}
        </form>
      </section>

      {/* <div className="dashboard-grid">
        <MetricCard label="Total Discovered" value={stats.discovered} />
        <MetricCard label="Qualified" value={stats.qualified} />
        <MetricCard label="Tier A" value={stats.tierA} />
        <MetricCard label="Last Refresh" value={stats.lastRefresh} />
      </div> */}

      <div className="dashboard-columns">
        <section className="section-card">
          <div className="section-card__header">
            <span className="section-card__eyebrow">Qualification Funnel</span>
            <h2>Lead progression</h2>
          </div>
          <FunnelChart data={funnel} />
        </section>

        <section className="section-card">
          <div className="section-card__header">
            <span className="section-card__eyebrow">Tier Breakdown</span>
            <h2>Current tier mix</h2>
          </div>
          <div className="tier-breakdown">
            <div className="tier-pill tier-pill--a">A = 87</div>
            <div className="tier-pill tier-pill--b">B = 156</div>
            <div className="tier-pill tier-pill--c">C = 99</div>
          </div>
          <div className="activity-feed">
            <h3>Recent activity</h3>
            <ul>
              {activity.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
