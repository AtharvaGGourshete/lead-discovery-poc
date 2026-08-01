export function ViabilityMatrix() {
  const scoreRows = [
    { label: "Revenue Growth", weight: 20, score: 18 },
    { label: "Profitability", weight: 20, score: 17 },
    { label: "Expansion Signals", weight: 30, score: 28 },
    { label: "News Sentiment", weight: 15, score: 13 },
    { label: "Data Freshness", weight: 15, score: 13 }
  ];

  const total = scoreRows.reduce((sum, row) => sum + row.weight * (row.score / 100), 0);

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-card__header">
          <span className="section-card__eyebrow">Viability Matrix</span>
          <h2>Tier scoring logic</h2>
        </div>

        <div className="viability-grid">
          <div className="matrix-card">
            <h3>Mandatory filters</h3>
            <ul>
              <li>Revenue threshold</li>
              <li>Growth threshold</li>
              <li>Sector match</li>
              <li>Source validation</li>
              <li>Data freshness</li>
            </ul>
          </div>
          <div className="matrix-card">
            <h3>Bonus signals</h3>
            <ul>
              <li>New office</li>
              <li>Factory expansion</li>
              <li>Digital transformation</li>
              <li>Executive hiring</li>
              <li>R&D investment</li>
              <li>Strategic partnerships</li>
            </ul>
          </div>
        </div>

        <div className="score-table">
          <h3>Scoring example: Reliance</h3>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Weight</th>
                <th>Score</th>
                <th>Weighted</th>
              </tr>
            </thead>
            <tbody>
              {scoreRows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.weight}</td>
                  <td>{row.score}</td>
                  <td>{((row.weight * row.score) / 100).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="score-total">
                <td colSpan={3}>Total</td>
                <td>{total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tier-definitions">
          <div className="tier-card tier-card--a">
            <h4>Tier A</h4>
            <p>80-100 = Hot</p>
          </div>
          <div className="tier-card tier-card--b">
            <h4>Tier B</h4>
            <p>60-79 = Warm</p>
          </div>
          <div className="tier-card tier-card--c">
            <h4>Tier C</h4>
            <p>&lt;60 = Cold</p>
          </div>
        </div>
      </section>
    </div>
  );
}
