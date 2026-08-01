import { chromium } from "playwright";
import * as cheerio from "cheerio";

export async function findAnnualReportPDF(irUrl) {

    const browser = await chromium.launch({
        headless: true
    });

    const page = await browser.newPage();

    console.log("Opening:", irUrl);

    const response = await page.goto(irUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000
    });

    console.log("Status:", response.status());

    console.log("Page Loaded");

    console.log("Current URL:", page.url());

    console.log("Page Title:", await page.title());

    const html = await page.content();

    console.log("HTML Length:", html.length);

    console.log("=================================");
    console.log(html);
    console.log("=================================");

    const $ = cheerio.load(html);

    const pdfs = [];

    $("a").each((_, element) => {

        const href = $(element).attr("href");

        if (!href) return;

        if (href.toLowerCase().includes(".pdf")) {

            pdfs.push({
                text: $(element).text().trim(),
                url: new URL(href, irUrl).href
            });

        }

    });

    await browser.close();

    return pdfs;
}