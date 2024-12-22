#!/usr/bin/env node

process.removeAllListeners('warning');

import { checkKey } from './api.js';
import { mainLoop } from './mainLoop.js';

async function app() {
  checkKey();
  mainLoop();
}

console.log("Welcome To LLaMA Chat!");

app();