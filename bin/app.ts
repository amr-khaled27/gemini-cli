#!/usr/bin/env node

import { ChatSession, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { mainLoop } from '../src/mainLoop.js';
import { program } from 'commander';
import dotenv from 'dotenv';
import cliMd from 'cli-markdown';
import centerLine from '../src/center.js';
import { loading } from 'cli-loading-animation';

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

function configureCommands(): void {
  program
    .version('0.2.0-alpha')
    .description('Chat with Gemini from the comfort of your terminal!');

  program
    .command('send')
    .description('Send a prompt instantly to Gemini.')
    .argument('<prompt...>', 'The prompt to send to Gemini.')
    .action(async (prompts) => {
      const { start, stop } = loading('Awaiting API response...');
      const prompt = prompts.join(' ');
      start();
      const result = await chatSession.sendMessage(prompt);
      stop();
      console.log(cliMd(result.response.text()));
      process.exit(0);
    });

  program
    .command('chat')
    .description('Enter chat mode with Gemini.')
    .action(() => {
      const halfLine = '─'.repeat(58);
      console.clear();
      centerLine(halfLine);
      centerLine('Welcome To Gemini Chat!');
      centerLine('To access the main menu, simply type menu or m.');
      centerLine(halfLine);
      app();
    });
}

configureCommands();

program.parse(process.argv);

export { model, chatSession };