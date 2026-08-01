import axios from "axios";
import fs from "fs";
import path from "path";

function buildCookieHeader(cookies = []) {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

export async function downloadReport(report, company, options = {}) {
  if (!report?.url) {
    throw new Error("report url is required");
  }

  const dir = path.resolve("storage", "reports");
  fs.mkdirSync(dir, { recursive: true });

  const safeCompany = (company || "company").replace(/[^\w.-]+/g, "_");
  const yearPart = report.year ? `_${report.year}` : "";
  const filePath = path.join(dir, `${safeCompany}${yearPart}.pdf`);

  const response = await axios({
    url: report.url,
    method: "GET",
    responseType: "arraybuffer",
    timeout: 60000,
    headers: {
      "user-agent":
        options.userAgent ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      referer: options.referer || "https://www.nseindia.com/",
      cookie: buildCookieHeader(options.cookies)
    }
  });

  fs.writeFileSync(filePath, Buffer.from(response.data));

  return {
    filePath,
    buffer: Buffer.from(response.data)
  };
}
