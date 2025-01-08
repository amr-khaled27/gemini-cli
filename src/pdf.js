import fs from 'fs'
import inquirer from 'inquirer';
import { model } from './app.js';

async function pdf() {
  let prompt;
  try {
    prompt = await inquirer.prompt([
    {
      type: 'input',
      name: 'url_or_path',
      message: 'You:',
    },
    ]);
  } catch (error) {
   console.error('Error getting user input!', cliMd(error));
  }
  let pdf;

  try {
    const url = new URL(prompt.url_or_path);
    pdf = await fetch(prompt.url_or_path).then(response => response.arrayBuffer());
    console.log("PDF loaded!");
  } catch (_) {
    pdf = fs.readFileSync(prompt.url_or_path);
    console.log("PDF loaded!");
  }

  const summary = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(pdf).toString("base64"),
        mimeType: "application/pdf",
      },
    },
    "Summarize this PDF thoroughly for future reference, without extra generated text, just the summary!",
  ]);

  return summary.response.text();
}

export { pdf };