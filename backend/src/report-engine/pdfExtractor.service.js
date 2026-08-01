import { PDFParse } from "pdf-parse";
import fs from "fs";

export async function extractPdfText(input) {
  const buffer = Buffer.isBuffer(input)
    ? input
    : fs.readFileSync(input);

  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();

  return {
    text: parsed.text || "",
    info: parsed.info || {},
    metadata: parsed.metadata || {},
    numpages: parsed.total || 0
  };
}
