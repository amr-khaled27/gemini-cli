import fs from 'fs'
import { question } from 'readline-sync';
import { model } from './app.js';

async function pdf() {
  const url_or_path = question("Enter a path or url: ");
  let pdf;
  let summary;

  try {
    const url = new URL(url_or_path);
    pdf = await fetch(url_or_path)
      .then((response) => response.arrayBuffer());
    console.log("PDF loaded!");
    summary = await model.generateContent([
    {
        inlineData: {
            data: Buffer.from(pdf).toString("base64"),
            mimeType: "application/pdf",
        },
    },
    "Summarize this PDF thoroughly for future reference, without extra generated text, just the summary!",
    ]);
  } catch (_) {
    const buffer = fs.readFileSync(url_or_path);
    console.log("PDF loaded!");
    summary = await model.generateContent([
    {
        inlineData: {
            data: Buffer.from(buffer).toString("base64"),
            mimeType: "application/pdf",
        },
    },
    "Summarize this PDF thoroughly for future reference, without extra generated text, just the summary!",
    ]);
  }
  return summary.response.text();
}

export { pdf };