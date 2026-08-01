import { discoverCompany } from "../services/companyDiscovery.service.js";
import { downloadAnnualReport, findAnnualReportPDF } from "./nsePythonClient.service.js";
import { extractPdfText } from "./pdfExtractor.service.js";
import { analyzeReportText } from "./reportAnalyzer.service.js";
import { discoverContactsFromText } from "../contact-engine/contactDiscovery.service.js";
import { scoreArchitectureLead } from "../services/companyLead.service.js";
import path from "path";

export async function processCompany(company) {
  if (!company || !company.trim()) {
    throw new Error("company is required");
  }

  const companyDiscovery = await discoverCompany(company);
  const symbol = companyDiscovery.finance?.ticker || companyDiscovery.match?.company?.ticker;
  const reportStorageDir = path.resolve("storage", "reports");
  const reportSearch = symbol ? await findAnnualReportPDF(symbol, reportStorageDir) : null;
  const reportCandidates = reportSearch?.candidates ?? [];
  const selectedReport = reportCandidates[0] ?? null;

  let downloadedReport = null;
  let extracted = { text: "" };
  let reportAnalysis = {
    companyName: companyDiscovery.companyName,
    hasExpansionPlans: false,
    confidence: 0,
    signalCount: 0,
    matchedSignals: [],
    evidence: [],
    summary: "No report was located for this company."
  };
  let contactDiscovery = {
    companyName: companyDiscovery.companyName,
    contacts: [],
    hasExecutiveSignals: false,
    summary: "No report was located for this company."
  };

  if (selectedReport) {
    try {
      downloadedReport = await downloadAnnualReport(selectedReport.url, reportStorageDir);
      extracted = await extractPdfText(downloadedReport.filePath);
      reportAnalysis = analyzeReportText(extracted.text, companyDiscovery.companyName);
      contactDiscovery = discoverContactsFromText(extracted.text, companyDiscovery.companyName);
    } catch (error) {
      reportAnalysis = {
        ...reportAnalysis,
        summary: `Report was found, but could not be fully processed: ${error.message}`
      };
    }
  }

  const leadOutcome = scoreArchitectureLead(
    companyDiscovery,
    companyDiscovery.finance,
    reportAnalysis
  );

  return {
    success: true,
    input: {
      company: company.trim()
    },
    companyDiscovery,
    reportEngine: {
      symbol,
      error: reportSearch?.error ?? null,
      candidates: reportCandidates,
      selectedReport,
      downloadedReport: downloadedReport
        ? {
            filePath: downloadedReport.filePath
          }
        : null,
      extracted: {
        numpages: extracted.numpages ?? 0
      },
      analysis: reportAnalysis
    },
    contactDiscovery,
    leadDiscovery: leadOutcome,
    summary: {
      expansionLikely: reportAnalysis.hasExpansionPlans,
      qualifiedLead: leadOutcome.qualified,
      priority: leadOutcome.priority,
      leadScore: leadOutcome.leadScore
    }
  };
}
