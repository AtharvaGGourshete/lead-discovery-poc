import { FormEvent, useEffect, useState } from "react";
import { MetricCard } from "./components/MetricCard";
import { FunnelChart } from "./components/FunnelChart";

const DEFAULT_COMPANY = "Aether Industries Limited";

function formatValue(value: unknown, suffix = "") {
  if (value == null || value === "") return "N/A";
  if (typeof value === "number") {
    const formatted = value.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });
    return suffix === "crores" ? `₹${formatted} Cr` : `${formatted}${suffix}`;
  }
  return `${value}`;
}

function normalizeEvidence(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function StatusPill({ tone, label }: { tone: "good" | "neutral" | "warn"; label: string }) {
  return <span className={`status-pill status-pill--${tone}`}>{label}</span>;
}

function Metric({ label, value, hint }: { label: string; value: unknown; hint?: string }) {
  return (
    <div className="metric">
      <span className="metric__label">{label}</span>
      <strong className="metric__value">{value}</strong>
      {hint ? <span className="metric__hint">{hint}</span> : null}
    </div>
  );
}

function SectionCard({ eyebrow, title, description, children, className = "" }: { eyebrow: string; title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`section-card ${className}`.trim()}>
      <div className="section-card__header">
        <span className="section-card__eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function EvidenceList({ evidence }: { evidence?: Array<{ type: string; pattern: string; evidence: string }> }) {
  if (!evidence?.length) {
    return <p className="empty-state">No supporting report evidence was extracted yet.</p>;
  }

  return (
    <div className="evidence-list">
      {evidence.map((item, index) => (
        <article key={`${item.type}-${index}`} className="evidence-item">
          <div className="evidence-item__topline">
            <div>
              <strong>{item.type}</strong>
              <div className="evidence-item__pattern">Matched phrase: {item.pattern}</div>
            </div>
            <span className="evidence-badge">Signal</span>
          </div>
          <p className="evidence-item__text">{normalizeEvidence(item.evidence)}</p>
        </article>
      ))}
    </div>
  );
}

function ContactList({ contacts }: { contacts?: Array<{ name: string; role: string; evidence: string }> }) {
  if (!contacts?.length) {
    return <p className="empty-state">No executive references were found in the annual report.</p>;
  }

  return (
    <div className="contact-list">
      {contacts.map((contact, index) => (
        <article key={`${contact.name}-${index}`} className="contact-card">
          <strong>{contact.name}</strong>
          <span>{contact.role}</span>
          <p>{contact.evidence}</p>
        </article>
      ))}
    </div>
  );
}

function ReportCandidates({ candidates, selectedReport }: { candidates?: Array<{ url: string; title: string; fromYear: string; toYear: string; submissionType?: string; fileSize?: string }>; selectedReport?: { url: string; title: string } }) {
  if (!candidates?.length) {
    return <p className="empty-state">No annual report candidates were returned for this company.</p>;
  }

  return (
    <div className="candidate-list">
      {candidates.map((candidate, index) => {
        const isSelected = selectedReport?.url === candidate.url;
        return (
          <article key={`${candidate.url}-${index}`} className={`candidate-card ${isSelected ? "candidate-card--selected" : ""}`}>
            <div className="candidate-card__title-row">
              <strong>{candidate.title}</strong>
              {isSelected ? <StatusPill tone="good" label="Selected" /> : null}
            </div>
            <div className="candidate-card__meta">
              <span>{candidate.fromYear} to {candidate.toYear}</span>
              <span>{candidate.submissionType || "Original"}</span>
              <span>{candidate.fileSize || "Unknown size"}</span>
            </div>
            <a href={candidate.url} target="_blank" rel="noreferrer">
              Open report
            </a>
          </article>
        );
      })}
    </div>
  );
}

const DEFAULT_STATS = {
  discovered: 1247,
  qualified: 342,
  tierA: 87,
  tierB: 156,
  tierC: 99,
  lastRefresh: "2h ago"
};

const FUNNEL_DATA = [
  { label: "Discovered", value: 1247 },
  { label: "Reviewed", value: 897 },
  { label: "Qualified", value: 634 },
  { label: "Approved", value: 342 }
];

const ACTIVITY_LOG = [
  "Imported 23 new leads from Yahoo Finance",
  "Updated 12 existing companies with fresh revenue data",
  "Tagged 5 companies as Tier A",
  "Refreshed GNews signal classification",
  "Saved filter changes for manufacturing sector"
];

export function App() {
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function prime() {
      try {
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error("Backend health check failed");
        }
      } catch {
        if (!ignore) {
          setError("Backend is not reachable. Start the Express server on port 5000.");
        }
      }
    }

    prime();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/insights/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || `Request failed with status ${response.status}`);
      }
      setResult(payload);
    } catch (requestError: any) {
      setError(requestError?.message || "Unable to analyze the company.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const companyDiscovery = result?.companyDiscovery;
  const finance = companyDiscovery?.finance;
  const reportEngine = result?.reportEngine;
  const leadDiscovery = result?.leadDiscovery;
  const summary = result?.summary;
  const contactDiscovery = result?.contactDiscovery;

  return (
    <div className="app-shell">
      <div className="hero">
        <div className="hero__copy">
          <span className="hero__eyebrow">Lead Discovery Intelligence</span>
          <h1>Turn an NSE-listed company name into report-backed expansion signals.</h1>
          <p>
            This dashboard talks to the Express backend, resolves the company,
            fetches the latest annual report from NSE, downloads the PDF, and
            surfaces expansion and executive signals in one place.
          </p>
        </div>

        <form className="search-panel" onSubmit={handleSubmit}>
          <label htmlFor="company-input">Company name</label>
          <div className="search-panel__row">
            <input
              id="company-input"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Enter an NSE-listed company"
            />
            <button type="submit" disabled={isSubmitting || !company.trim()}>
              {isSubmitting ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {error ? <p className="error-banner">{error}</p> : null}
        </form>
      </div>

      <main className="dashboard">
        {/* <section className="summary-grid">
          <MetricCard label="Total Discovered" value={DEFAULT_STATS.discovered} />
          <MetricCard label="Qualified" value={DEFAULT_STATS.qualified} />
          <MetricCard label="Tier A" value={DEFAULT_STATS.tierA} />
          <MetricCard label="Last Refresh" value={DEFAULT_STATS.lastRefresh} />
        </section> */}

        <section className="content-grid">
          <SectionCard
            eyebrow="Company Discovery"
            title={companyDiscovery?.companyName || "Waiting for analysis"}
            description="Resolver confidence, listing status, and financial context from the enrichment layer."
          >
            <div className="metric-grid">
              <Metric label="Listed" value={companyDiscovery ? (companyDiscovery.listed ? "Yes" : "No") : "N/A"} />
              <Metric label="Match Type" value={companyDiscovery?.match?.matchType || "N/A"} />
              <Metric label="Ticker" value={finance?.ticker || "N/A"} />
              <Metric label="Country" value={finance?.country || "N/A"} />
              <Metric label="Industry" value={finance?.industry || "N/A"} />
              <Metric label="Analyst Rating" value={finance?.analystRating || "N/A"} />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Report Engine"
            title="Annual report retrieval"
            description={reportEngine?.error || "The latest NSE annual report candidates and selected document."}
          >
            <ReportCandidates
              candidates={reportEngine?.candidates}
              selectedReport={reportEngine?.selectedReport}
            />
          </SectionCard>
        </section>

        <section className="content-grid">
          <SectionCard
            eyebrow="Lead Discovery"
            title="Qualification snapshot"
            description="Business filters, report score, and why the company did or did not qualify."
          >
            <div className="metric-grid">
              <Metric label="Revenue (B)" value={formatValue(finance?.revenue, "billion")} />
              <Metric label="Growth %" value={formatValue(leadDiscovery?.growthPercentage, "%")} />
              <Metric label="Report Score" value={formatValue(leadDiscovery?.reportScore?.score)} />
              <Metric label="Qualified" value={leadDiscovery ? (leadDiscovery.qualified ? "Yes" : "No") : "N/A"} />
            </div>
            <div className="tag-list">
              {(leadDiscovery?.failedReasons || []).length ? (
                leadDiscovery.failedReasons.map((reason: string) => (
                  <span key={reason} className="tag tag--warn">{reason}</span>
                ))
              ) : (
                <span className="tag tag--good">No failed filters</span>
              )}
            </div>
          </SectionCard>
        </section>

        <section className="content-grid">
          <SectionCard
            eyebrow="PDF Intelligence"
            title="Expansion evidence"
            description={reportEngine?.analysis?.summary || "Waiting for report analysis."}
            className="content-grid__wide"
          >
            <EvidenceList evidence={reportEngine?.analysis?.evidence} />
          </SectionCard>

          <SectionCard
            eyebrow="Contact Discovery"
            title="Executive references"
            description={contactDiscovery?.summary || "Waiting for report contact analysis."}
          >
            <ContactList contacts={contactDiscovery?.contacts} />
          </SectionCard>
        </section>
      </main>
    </div>
  );
}
