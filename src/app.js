#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { mainLoop } from './mainLoop.js';
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

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const chatSession = model.startChat({
  generationConfig,
  history: [

  ],
});

async function app() {
  mainLoop();
}

program
.version('1.0.5')
.option('-c, --chat <message>', 'Send a prompt instantly to Gemini.')
.parse(process.argv);

const opts = program.opts();

if (opts.chat) {
  const result = await chatSession.sendMessage(opts.chat);
  console.log(result.response.text());
  process.exit(0);
}

export { model, chatSession };

console.log("Welcome To Gemini Chat!");

app();