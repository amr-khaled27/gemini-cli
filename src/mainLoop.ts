import inquirer from 'inquirer';
import chalk from 'chalk';
import cliMd from 'cli-markdown';
import { chatSession } from '../bin/app.js';
import saveChat from './chats.js';
import pdf from './pdf.js';
import Loader from './loading.js';

export interface LogItem {
  role: string;
  content: string;
}

type GenerateContentResult = {
  response: {
    text: () => string;
  };
};

let not_saved_yet: Array<LogItem> = [];
let prompt: string;

async function handleResponse(result: GenerateContentResult, prompt: string): Promise<void> {
  not_saved_yet.push({role: 'user:', content: prompt});
  not_saved_yet.push({role:'assistant:', content: `${result.response.text()}`});

  console.log(cliMd(result.response.text()));
}

const loader = new Loader('Awaiting API response ...');

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
      const menu = await inquirer.prompt([{
        type: 'list',
        name: 'choice',
        message: 'Choose an option:',
        choices: ['Continue chatting', 'Save chat', 'Load PDF', 'Exit'],
      }]);
  
      switch (menu.choice) {
        case 'Continue chatting':
          continue;

        case 'Save chat':
          saveChat(not_saved_yet);
          not_saved_yet = [];
          continue;
  
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
            break;

          default:
            break;
      }
    } else {
      loader.startLoader();
    }


    const result = await chatSession.sendMessage(prompt);

    loader.stopLoader();

    handleResponse(result, prompt);
  }
}

export { mainLoop, prompt };