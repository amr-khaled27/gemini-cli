import { readFileSync } from 'fs';
import { question } from 'readline-sync';
import { model, not_saved_yet } from './mainLoop.js';

function isFile(path_or_url) {
  return path_or_url.split('/').pop().indexOf('.') > -1;
}

async function promptPDF() {
  const url_or_path = question('Enter pdf url or path: ');
  const prompt = question('Prompt: ');

  const file = isFile(url_or_path);

  let result;

  if (!file) {
      const pdfResp = await fetch(url_or_path)
      .then((response) => response.arrayBuffer());

    result = await model.generateContent([
      {
          inlineData: {
              data: Buffer.from(pdfResp).toString("base64"),
              mimeType: "application/pdf",
          },
      },
      prompt,
    ]);
  } else {
    const fileBuffer = readFileSync(url_or_path);

    result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(fileBuffer).toString("base64"),
                mimeType: "application/pdf",
            },
        },
        prompt,
    ]);
  }

  return result.response.text();
}

export { promptPDF }