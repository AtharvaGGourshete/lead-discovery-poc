export function RefreshStatus() {
  const status = {
    schedule: "Twice weekly (Tue & Fri, 8 AM)",
    nextRefresh: "1d 3h",
    history: [
      { id: "1", date: "2026-07-31", status: "success", newLeads: 12, updatedLeads: 5, removedLeads: 0 },
      { id: "2", date: "2026-07-28", status: "success", newLeads: 18, updatedLeads: 8, removedLeads: 2 },
      { id: "3", date: "2026-07-25", status: "failed", newLeads: 0, updatedLeads: 0, removedLeads: 0 },
      { id: "4", date: "2026-07-22", status: "success", newLeads: 22, updatedLeads: 11, removedLeads: 1 },
      { id: "5", date: "2026-07-19", status: "success", newLeads: 15, updatedLeads: 7, removedLeads: 3 }
    ],
    health: { yahoo: "99.8%", gnews: "98.9%", market: "Cached" },
    stats: { total: 1247, qualified: 342, tierA: 87, tierB: 156, tierC: 99, unqualified: 905 }
  };

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-card__header">
          <span className="section-card__eyebrow">Refresh Status</span>
          <h2>Sync health</h2>
          <p>Track the cadence of the lead refresh pipeline and the freshness of its upstream sources.</p>
        </div>

        <div className="metric-grid">
          <div className="metric">
            <span className="metric__label">Total leads</span>
            <strong className="metric__value">{status.stats.total}</strong>
            <span className="metric__hint">Current lead pool in the system</span>
          </div>
          <div className="metric">
            <span className="metric__label">Qualified</span>
            <strong className="metric__value">{status.stats.qualified}</strong>
            <span className="metric__hint">Passed the qualification filters</span>
          </div>
          <div className="metric">
            <span className="metric__label">Unqualified</span>
            <strong className="metric__value">{status.stats.unqualified}</strong>
            <span className="metric__hint">Tracked but not yet promoted</span>
          </div>
          <div className="metric">
            <span className="metric__label">Next refresh</span>
            <strong className="metric__value">{status.nextRefresh}</strong>
            <span className="metric__hint">{status.schedule}</span>
          </div>
        </div>

        <div className="refresh-grid" style={{ marginTop: 18 }}>
          <div className="refresh-card">
            <p>Schedule</p>
            <strong>{status.schedule}</strong>
            <span>Next refresh: {status.nextRefresh}</span>
            <button className="button-primary">Trigger Now</button>
          </div>

          <div className="refresh-card">
            <h3>Source Health</h3>
            <div>Yahoo Finance OK - {status.health.yahoo}</div>
            <div>GNews API OK - {status.health.gnews}</div>
            <div>NSE/BSE Cached - {status.health.market}</div>
          </div>
        </div>

        <div className="section-card" style={{ marginTop: 18 }}>
          <div className="section-card__header">
            <span className="section-card__eyebrow">History</span>
            <h2>Recent refresh runs</h2>
          </div>
          <div className="history-grid">
            {status.history.map((entry) => (
              <div key={entry.id} className={`history-card ${entry.status === "success" ? "history-card--success" : "history-card--failed"}`}>
                <strong>{entry.date}</strong>
                <p>Status: {entry.status}</p>
                <p>New: {entry.newLeads}</p>
                <p>Updated: {entry.updatedLeads}</p>
                <p>Removed: {entry.removedLeads}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
