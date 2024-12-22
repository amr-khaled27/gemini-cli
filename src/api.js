import readlineSync from 'readline-sync';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { program } from 'commander';

process.removeAllListeners('warning');


const formatResponse = (response) => {
  let text = "";
  
  for (const part of response) {
    const content = part.content;
    if (content == '.') {
      text += '.';
      text += '\n';
    } else if (content != undefined) {
      text += content;
    }
  }

  return text;
}

let groq;

async function checkKey() {
  const dirPath = 'llama-env';
  const filePath = path.join(dirPath, '.env');
  if (!fs.existsSync(filePath)) {
    const apikey = readlineSync.question('Enter Your API key: ').trim();
    try {
      fs.mkdirSync(dirPath, (err) => {
        console.log("Error Creating Directory: ", err);
      })
      fs.writeFileSync(filePath, 'API_KEY=' + apikey, 'utf-8');
    } catch (err) {
      console.log('Error Writing File: ', err);
    }
  }
  dotenv.config({ path: filePath });
  groq = new Groq({apiKey: process.env.API_KEY});
}

async function getAPIResponse(prompt) {
  const chatCompletion = await groq.chat.completions.create({
    "messages": prompt,
    "model": "llama-3.1-70b-versatile",
    "temperature": 1,
    "max_tokens": 1024,
    "top_p": 1,
    "stream": true,
    "stop": null
  });

  let content_list = [];

  for await (const chunk of chatCompletion) {
    const content = chunk.choices[0]?.delta;
    content_list.push(content);
  }
  return content_list;
}

program
  .version('1.0.5')
  .option('-c, --chat <message>', 'Send a prompt to LLaMA.')
  .parse(process.argv);

const opts = program.opts();

if (opts.chat) {
  checkKey();
  const response = await getAPIResponse([{'role': 'user', 'content': opts.chat}]);
  const text = formatResponse(response);
  console.log('LLaMA: ', text);
  process.exit(0);
}


export {formatResponse, checkKey, getAPIResponse};