import cliMd from 'cli-markdown';
import centerLine from "./center.js";
import { full_log } from "./mainLoop.js";

function welcome (): void {
  const halfLine = '─'.repeat(58);
  centerLine(halfLine);
  centerLine('Welcome To Gemini Chat!');
  centerLine('To access the main menu, simply type menu or m.');
  centerLine(halfLine);
}

function printHistory (): void {
  full_log.forEach((item) => {
    item.role === 'user' ? console.log(cliMd('Prompt:', `${item.content}`)) : console.log(cliMd(`${item.content}`));
  });
}

export { welcome, printHistory };