import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import inquirer from "inquirer";
import { model } from "../bin/app.js";
import cliMd from "cli-markdown";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const fileManager = new GoogleAIFileManager(apiKey);

async function pdf(): Promise<void> {
  let prompt;
  try {
    prompt = await inquirer.prompt([
      {
        type: "input",
        name: "url_or_path",
        message: "Enter url or path:",
      },
    ]);
  } catch (error) {
    console.error("Error getting user input!", cliMd(error));
  }
  let pdf: Buffer | ArrayBuffer;

  try {
    const url = new URL(prompt!.url_or_path);
    const pdfPath = "webPDF.pdf";
    const pdfBuffer = await fetch(url.toString()).then((response) =>
      response.arrayBuffer()
    );
    const binaryPdf = Buffer.from(pdfBuffer);
    fs.writeFileSync(pdfPath, binaryPdf, "binary");
  } catch (_) {
    pdf = fs.readFileSync(prompt!.url_or_path);
  }

  await fileManager.uploadFile(prompt?.url_or_path, {
    mimeType: "application/pdf",
    displayName: "Content file",
  });
}

export default pdf;
