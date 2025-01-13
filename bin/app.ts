#!/usr/bin/env node

import { ChatSession, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { mainLoop } from '../src/mainLoop';
import { program } from 'commander';
import dotenv from 'dotenv';
import cliMd from 'cli-markdown';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(cliMd(`
  **Please set GEMINI_API_KEY in your environment variables.**
  You can get your API key from
  > https://console.cloud.google.com/apis/credentials

  Setting the GEMINI_API_KEY:

  **Linux/Mac:**
  > export GEMINI_API_KEY=your_api_key_here

  **Windows (Command Prompt):**
  > set GEMINI_API_KEY=your_api_key_here

  **Windows (PowerShell):**
  > $env:GEMINI_API_KEY="your_api_key_here"
  `));
  
  process.exit(1);
}

const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(apiKey);

const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const chatSession: ChatSession = model.startChat({
  generationConfig,
  history: [

  ],
});

async function app(): Promise<void> {
  mainLoop();
}

program
  .version('0.2.0-alpha')
  .description('Chat with Gemini from the comfort of your terminal!')

  .option('-m, --message <prompt>', 'Send a prompt instantly to Gemini.')

  .option('<no options>', 'Enter chat mode with gemini.')
  .parse(process.argv);

const opts = program.opts();

if (opts.message) {
  (async () => {
    const result = await chatSession.sendMessage(opts.message);
    console.log(cliMd(result.response.text()));
    process.exit(0);
  })();
}

export { model, chatSession };

console.log(cliMd('Welcome To Gemini Chat!\n- To access the main menu, simply type `menu` or `m`.'));

app();