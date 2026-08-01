import { spawn } from "child_process";
import os from "os";
import path from "path";

const DEFAULT_PYTHON = process.env.PYTHON_EXECUTABLE || (
  process.platform === "win32"
    ? path.join(
        os.homedir(),
        ".cache",
        "codex-runtimes",
        "codex-primary-runtime",
        "dependencies",
        "python",
        "python.exe"
      )
    : "python3"
);

const SCRIPT_PATH = path.resolve("src", "scripts", "nse_annual_reports.py");

function runPython(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(DEFAULT_PYTHON, [SCRIPT_PATH, ...args], {
      cwd: process.cwd(),
      env: process.env
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || stdout.trim() || `python exited with code ${code}`));
        return;
      }

      resolve(stdout.trim());
    });
  });
}

function extractYear(candidate) {
  const fromYear = Number(candidate.fromYr);
  const toYear = Number(candidate.toYr);
  return Number.isFinite(toYear) ? toYear : Number.isFinite(fromYear) ? fromYear : null;
}

function scoreCandidate(candidate) {
  let score = 0;
  if (candidate.fileName?.toLowerCase().includes(".pdf")) score += 10;
  if ((candidate.submission_type || "").toLowerCase() === "original") score += 5;
  if ((candidate.submission_type || "").toLowerCase() === "revised") score += 3;

  const year = extractYear(candidate);
  if (year) score += Math.max(0, year - 2000);

  return score;
}

export async function findAnnualReportPDF(symbol, downloadFolder) {
  try {
    const raw = await runPython(["list", symbol, downloadFolder]);
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.data) ? parsed.data : [];

    const candidates = items
      .filter((item) => item.fileName)
      .map((item) => ({
        title: `${item.companyName || symbol} Annual Report ${item.fromYr}-${item.toYr}`,
        text: item.broadcast_dttm || "",
        url: item.fileName,
        year: extractYear(item),
        fromYear: item.fromYr,
        toYear: item.toYr,
        submissionType: item.submission_type,
        fileSize: item.attFileSize,
        broadcastDateTime: item.broadcast_dttm,
        score: scoreCandidate(item),
        raw: item
      }))
      .sort((a, b) => b.score - a.score);

    return {
      symbol,
      referer: "python-nse-client",
      userAgent: "python-nse-client",
      cookies: [],
      candidates
    };
  } catch (error) {
    return {
      symbol,
      referer: "python-nse-client",
      userAgent: "python-nse-client",
      cookies: [],
      error: error.message,
      candidates: []
    };
  }
}

export async function downloadAnnualReport(reportUrl, downloadFolder) {
  const raw = await runPython(["download", reportUrl, downloadFolder]);
  return JSON.parse(raw);
}
