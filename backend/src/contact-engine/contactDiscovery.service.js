const ROLE_PATTERNS = [
  /(?:chief executive officer|ceo)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  /(?:chief financial officer|cfo)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  /(?:managing director|md)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  /(?:chairman(?:\s+and\s+managing\s+director)?|executive chairman)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  /(?:company secretary|secretary)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  /(?:whole[-\s]?time director|wtd)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i
];

function uniqueByName(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.name}-${entry.role}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function discoverContactsFromText(text = "", companyName = "") {
  const contacts = [];

  for (const pattern of ROLE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;

    const role = match[0].split(":")[0].split("-")[0].trim();
    const name = match[1].trim();

    contacts.push({
      name,
      role,
      source: "annual_report",
      evidence: match[0],
      companyName
    });
  }

  return {
    companyName,
    contacts: uniqueByName(contacts),
    hasExecutiveSignals: contacts.length > 0,
    summary: contacts.length
      ? `Found ${contacts.length} executive reference(s) in the report.`
      : "No clear executive references found in the report text."
  };
}
