import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLeads } from "../hooks/useLeads";
import { TierBadge } from "../components/TierBadge";
import type { Lead } from "../types";

const tierOptions = ["A", "B", "C"];
const sectors = ["Tech", "Manufacturing", "Healthcare", "Retail", "Logistics"];
const sources = ["Yahoo", "GNews", "Internal"];

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")} Cr`;
}

export function LeadList() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useLeads({
    page,
    limit: 20,
    tier: tier || undefined,
    sector: sector || undefined,
    source: source || undefined,
    search: search || undefined
  });

  const leads = data?.data ?? [];
  const total = data?.total ?? 0;

  const pages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  return (
    <div className="page-grid">
      <section className="section-card">
        <div className="section-card__header">
          <span className="section-card__eyebrow">Lead List</span>
          <h2>Active opportunities</h2>
        </div>

        <div className="filter-row">
          <input
            type="search"
            placeholder="Search company name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={tier} onChange={(event) => setTier(event.target.value)}>
            <option value="">All tiers</option>
            {tierOptions.map((option) => (
              <option key={option} value={option}>
                Tier {option}
              </option>
            ))}
          </select>
          <select value={sector} onChange={(event) => setSector(event.target.value)}>
            <option value="">All sectors</option>
            {sectors.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="">All sources</option>
            {sources.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Sector</th>
                <th>Revenue</th>
                <th>Growth %</th>
                <th>Tier</th>
                <th>Source</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>Loading leads...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7}>No leads found.</td>
                </tr>
              ) : (
                leads.map((lead: Lead) => (
                  <tr key={lead.id} className="lead-row">
                    <td>
                      <Link to={`/leads/${lead.id}`} className="lead-link">
                        {lead.name}
                      </Link>
                    </td>
                    <td>{lead.sector}</td>
                    <td>{formatCurrency(lead.revenue)}</td>
                    <td>{lead.growth.toFixed(1)}%</td>
                    <td>
                      <TierBadge tier={lead.tier} />
                    </td>
                    <td>{lead.source}</td>
                    <td>{lead.dateAdded}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button disabled={page >= pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
