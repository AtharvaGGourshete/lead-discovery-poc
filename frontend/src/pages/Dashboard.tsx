import { useState, type FormEvent } from "react";
import { MetricCard } from "../components/MetricCard";
import { FunnelChart } from "../components/FunnelChart";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5000";

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

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchError("");
    setIsSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/insights/company`, {
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

  const companyName = searchResult?.companyDiscovery?.companyName || "Waiting for a company search";
  const reportCount = searchResult?.reportEngine?.candidates?.length ?? 0;
  const selectedReport = searchResult?.reportEngine?.selectedReport?.title || "No report selected";
  const evidenceCount = searchResult?.reportEngine?.analysis?.evidence?.length ?? 0;

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-card__header">
          <span className="section-card__eyebrow">Control Center</span>
          <h2>Search NSE-listed companies for annual report insights</h2>
          <p>Use the same backend pipeline that powers the main analysis screen, but with a lighter operational dashboard feel.</p>
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
          <p className="search-panel__hint">A quick search will return company discovery, report selection, and extracted signals.</p>
          {searchError ? <p className="error-banner">{searchError}</p> : null}

          {searchResult ? (
            <div className="metric-grid" style={{ marginTop: 8 }}>
              <div className="metric">
                <span className="metric__label">Company</span>
                <strong className="metric__value">{companyName}</strong>
                <span className="metric__hint">Resolved from the lookup layer</span>
              </div>
              <div className="metric">
                <span className="metric__label">Annual report results</span>
                <strong className="metric__value">{reportCount}</strong>
                <span className="metric__hint">Candidates returned by the report engine</span>
              </div>
              <div className="metric">
                <span className="metric__label">Selected report</span>
                <strong className="metric__value">{selectedReport}</strong>
                <span className="metric__hint">Document chosen for analysis</span>
              </div>
              <div className="metric">
                <span className="metric__label">Signals extracted</span>
                <strong className="metric__value">{evidenceCount}</strong>
                <span className="metric__hint">Expansion evidence found in the report</span>
              </div>
            </div>
          ) : null}
        </form>
      </section>

      <section className="content-grid">
        <MetricCard label="Discovered" value="1,247" hint="Companies sourced across feeds" />
        <MetricCard label="Qualified" value="342" hint="Passed the viability filter" />
        <MetricCard label="Tier A" value="87" hint="Highest-priority opportunities" />
        <MetricCard label="Last refresh" value="2h ago" hint="Most recent pipeline update" />
      </section>

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
