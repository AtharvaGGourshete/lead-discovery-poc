import { findAnnualReportPDF } from "./report-engine/pdfFinder.service.js";

const pdfs = await findAnnualReportPDF(
    "https://www.infosys.com/investors/reports-filings.html"
);

console.log("Found PDFs:");

console.table(pdfs);