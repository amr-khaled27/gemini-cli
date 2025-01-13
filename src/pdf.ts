import fs from 'fs'
import inquirer from 'inquirer';
import { model } from '../bin/app.js';
import cliMd from 'cli-markdown';

async function pdf(): Promise<string> {
  let prompt;
  try {
    prompt = await inquirer.prompt([
    {
      type: 'input',
      name: 'url_or_path',
      message: 'Enter url or path:',
    },
    ]);
  } catch (error) {
   console.error('Error getting user input!', cliMd(error));
  }
  let pdf: Buffer | ArrayBuffer;

  try {
    const url = new URL(prompt!.url_or_path);
    pdf = await fetch(prompt!.url_or_path).then(response => response.arrayBuffer());
  } catch (_) {
    pdf = fs.readFileSync(prompt!.url_or_path);
  }

  const summary = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(new Uint8Array(pdf)).toString("base64"),
        mimeType: "application/pdf",
      },
    },
    "Summarize this PDF thoroughly for future reference, without extra generated text, just the summary!",
  ]);

  return summary.response.text();
}

export default pdf;