import { chromium } from "playwright";
import * as cheerio from "cheerio";

const NSE_HOME = "https://www.nseindia.com";
const NSE_ANNUAL_REPORTS =
  "https://www.nseindia.com/companies-listing/corporate-filings-annual-reports";

function extractYear(text = "") {
  const match = text.match(/(20\d{2})/);
  return match ? Number(match[1]) : null;
}

function scoreCandidate(candidate) {
  const text = `${candidate.title} ${candidate.text} ${candidate.url}`.toLowerCase();
  let score = 0;

  if (text.includes("annual report")) score += 30;
  if (text.includes("annual")) score += 15;
  if (text.includes("investor")) score += 8;
  if (text.includes(".pdf")) score += 5;

  const year = extractYear(text);
  if (year) score += Math.max(0, year - 2000);

  return score;
}

export async function findAnnualReportPDF(symbol) {
  if (!symbol) {
    return {
      symbol: null,
      referer: NSE_HOME,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      cookies: [],
      candidates: []
    };
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
  });

  const candidates = [];

  try {
    await page.goto(
      `${NSE_ANNUAL_REPORTS}?symbol=${encodeURIComponent(symbol)}&tabIndex=equity`,
      {
        waitUntil: "load",
        timeout: 60000
      }
    );

    await page.waitForTimeout(3000);

    const html = await page.content();
    const $ = cheerio.load(html);

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (!href) return;

      const absoluteUrl = new URL(href, page.url()).href;
      if (!absoluteUrl.toLowerCase().includes(".pdf")) return;

      const text = $(element).text().trim();
      const title = text || "Annual Report";
      candidates.push({
        title,
        text,
        url: absoluteUrl,
        year: extractYear(`${title} ${absoluteUrl}`)
      });
    });

    if (candidates.length === 0) {
      const links = await page.locator("a").evaluateAll((anchors) =>
        anchors
          .map((anchor) => ({
            text: anchor.textContent?.trim() || "",
            href: anchor.getAttribute("href") || ""
          }))
          .filter((item) => item.href.toLowerCase().includes(".pdf"))
      );

      for (const link of links) {
        candidates.push({
          title: link.text || "Annual Report",
          text: link.text || "",
          url: new URL(link.href, page.url()).href,
          year: extractYear(`${link.text} ${link.href}`)
        });
      }
    }

    return {
      symbol,
      referer: page.url(),
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      cookies: await page.context().cookies(),
      candidates: candidates
      .map((candidate) => ({
        ...candidate,
        score: scoreCandidate(candidate)
      }))
      .sort((a, b) => b.score - a.score)
    };
  } catch (error) {
    return {
      symbol,
      referer: `${NSE_ANNUAL_REPORTS}?symbol=${encodeURIComponent(symbol)}&tabIndex=equity`,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      cookies: [],
      error: error.message,
      candidates: []
    };
  } finally {
    await browser.close();
  }
}
