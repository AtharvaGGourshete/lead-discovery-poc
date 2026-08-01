import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchLeadById, fetchLeadQualification, fetchLeadNews } from "../services/leadAPI";
import { TierBadge } from "../components/TierBadge";

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();

  const leadQuery = useQuery(["lead", id], () => fetchLeadById(id ?? ""), { enabled: Boolean(id) });
  const qualificationQuery = useQuery(["qualification", id], () => fetchLeadQualification(id ?? ""), { enabled: Boolean(id) });
  const newsQuery = useQuery(["news", id], () => fetchLeadNews(id ?? ""), { enabled: Boolean(id) });

  const lead = leadQuery.data;
  const qualification = qualificationQuery.data;
  const news = newsQuery.data ?? [];

  if (leadQuery.isLoading) {
    return <div className="page-grid">Loading lead details...</div>;
  }

  if (!lead) {
    return <div className="page-grid">Lead not found.</div>;
  }

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="detail-header">
          <div>
            <p className="section-card__eyebrow">Lead detail</p>
            <h2>{lead.name}</h2>
            <div className="detail-meta">
              <span>{lead.sector}</span>
              <TierBadge tier={lead.tier} />
            </div>
          </div>
          <button className="button-outline">Edit Tier</button>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h3>Financial data</h3>
            <dl>
              <dt>Revenue</dt>
              <dd>₹{lead.revenue.toLocaleString("en-IN")} B</dd>
              <dt>Growth</dt>
              <dd>{lead.growth.toFixed(1)}%</dd>
              <dt>Symbol</dt>
              <dd>{lead.symbol}</dd>
              <dt>Source</dt>
              <dd>{lead.source}</dd>
              <dt>Last Updated</dt>
              <dd>{lead.dateAdded}</dd>
            </dl>
          </div>

          <div className="detail-card">
            <h3>Qualification analysis</h3>
            <p>Tier: {qualification?.tier ?? "—"}</p>
            <p>Score: {qualification?.score ?? "—"}</p>
            <div className="filter-checklist">
              {qualification
                ? Object.entries(qualification.filterResults).map(([key, passed]) => (
                    <div key={key} className={passed ? "filter-pass" : "filter-fail"}>
                      <span>{passed ? "✓" : "✗"}</span>
                      <span>{key}</span>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>

        <section className="section-card">
          <h3>News & signals</h3>
          <div className="news-grid">
            {news.length === 0 ? (
              <p>No news signals found.</p>
            ) : (
              news.map((item) => (
                <article key={item.id} className="news-card">
                  <div>
                    <strong>{item.signalType}</strong>
                    <p>{item.title}</p>
                  </div>
                  <div>
                    <span>{item.source}</span>
                    <span>{item.date}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
