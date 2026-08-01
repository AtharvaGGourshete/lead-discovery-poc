# Lead Discovery Backend

This backend now follows the requested architecture:

- `Frontend (React)` calls the API
- `Express Backend API` orchestrates the flow
- `Lead Discovery Engine` resolves the company and applies financial filters
- `Report Engine` uses the Python `nse` client to fetch the real NSE annual report attachment URL, downloads it, extracts text, and detects expansion signals
- `Contact Discovery Engine` extracts executive and C-suite references from the report text

## Main endpoint

`POST /insights/company`

Body:

```json
{
  "company": "Aether Industries"
}
```

Response includes:

- `companyDiscovery`
- `reportEngine`
- `contactDiscovery`
- `leadDiscovery`
- `summary`

## Backward-compatible endpoint

`POST /reports`

This now uses the same company-analysis pipeline, so older frontend code can keep working while the React UI is migrated.

## Notes

- Annual report discovery uses Python `nse` (`NSE.annual_reports` and `download_document`) instead of browser scraping.
- PDF text extraction uses `pdf-parse`.
- If a report cannot be downloaded or parsed, the API still returns company discovery and financial data.
