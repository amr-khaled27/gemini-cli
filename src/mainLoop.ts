import inquirer from 'inquirer';
import chalk from 'chalk';
import cliMd from 'cli-markdown';
import { chatSession } from '../bin/app.js';
import saveChat from './chats.js';
import pdf from './pdf.js';
import { loading } from 'cli-loading-animation';
import { configMenu } from './config.js';
import { printHistory, welcome } from './consoleUtils.js';

export interface LogItem {
  role: string;
  content: string;
}

type GenerateContentResult = {
  response: {
    text: () => string;
  };
};

let full_log: Array<LogItem> = [];
let not_saved_yet: Array<LogItem> = [];
let prompt: string;
const loader = loading('Awaiting API response...');

async function handleResponse(result: GenerateContentResult, prompt: string): Promise<void> {
  full_log.push({role: 'user:', content: prompt});
  full_log.push({role:'assistant:', content: `${result.response.text()}`});
  not_saved_yet.push({role: 'user:', content: prompt});
  not_saved_yet.push({role:'assistant:', content: `${result.response.text()}`});
  
  console.log(cliMd(result.response.text()));
}

async function menuHandler(): Promise<Boolean> {
  let exit: boolean = false;
  let proceed: boolean = false;
  while (!exit) {
    const { choice } = await inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'Choose an option:',
      choices: ['Continue chatting','Settings' ,'Save chat', 'Load PDF', 'Exit'],
    }]);
  
    switch (choice) {
      case 'Continue chatting':
        console.clear();
        welcome();
        printHistory();
        exit = true;
        proceed = true;
        break;
  
      case 'Settings':
        await configMenu();
        break;
  
      case 'Save chat':
        saveChat(not_saved_yet);
        not_saved_yet = [];
        proceed = true;
        break;
  
      case 'Load PDF':
        const summary: string = await pdf();
        const nextInput = await inquirer.prompt([
          {
            type: 'input',
            name: 'userInput',
            message: 'You: ',
          },
        ]);
        prompt = summary + '\n' + nextInput.userInput;
        break;
  
        case 'Exit':
          console.log('Bye!');
          process.exit(0);
  
        default:
          break;
    }
  }
  return proceed;
}

async function mainLoop(): Promise<void> {
  while (true) {
    let userInput;
    try {
      userInput = await inquirer.prompt([
      {
        theme: {
          prefix: {done: chalk.greenBright('✔'), idle: '◯'}
        },
        type: 'input',
        name: 'userInput',
        message: 'Prompt:',
      },
      ]);
    } catch (error) {
      console.error('Error getting user input!');
      break;
    }

    const formattedInput = userInput.userInput.toLowerCase().trim();
    prompt = userInput.userInput;
    
    if (formattedInput === '-h' || formattedInput === 'help') {
      console.log(cliMd(
      `
    To access the main menu, simply type \`menu\` or 'm'.
      `
      ));
    } else if (formattedInput === 'menu' || formattedInput === 'm') {
      console.clear();
      const proceed: Boolean = await menuHandler();
      if (proceed) {
        continue;
      }
    } else {
      loader.start();
    }

    const result = await chatSession.sendMessage(prompt);

    loader.stop();

    handleResponse(result, prompt);
  }
}

export { mainLoop, menuHandler, prompt, full_log };