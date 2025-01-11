import inquirer from 'inquirer';
import { chatSession } from '../bin/app.js';
import { saveChat } from './chats.js';
import { pdf } from './pdf.js';
import cliMd from 'cli-markdown';

let chat_log = [];
let not_saved_yet = [];

async function handleResponse(result, prompt) {
  chat_log.push({role: 'user:', content: prompt});
  not_saved_yet.push({role: 'user:', content: prompt});
  
  chat_log.push({role:'assistant:', content: `${result.response.text()}`});
  not_saved_yet.push({role:'assistant:', content: `${result.response.text()}`});

  console.log(cliMd(result.response.text()));
}

async function mainLoop() {

  while (true) {
    let userInput;
    try {
      userInput = await inquirer.prompt([
      {
        theme: {
          prefix: {done: '✔', idle: "◯"}
        },
        type: 'input',
        name: 'userInput',
        message: 'Prompt:',
      },
      ]);
    } catch (error) {
     console.error('Error getting user input!', cliMd(error));
     break;
    }

    const formattedInput = userInput.userInput.trim();
    let prompt = userInput.userInput;

    if (formattedInput === 'exit') {
      console.log('Bye!');
      break;
    }

    switch (formattedInput) {
      case '-s':
        saveChat(not_saved_yet);
        not_saved_yet = [];
        continue;
    
      case '-l':
        const summary = await pdf();
        console.log("log from after load!");
        const nextInput = await inquirer.prompt([
          {
            type: 'input',
            name: 'userInput',
            message: 'You: ',
          },
        ]);
        prompt = summary + '\n' + nextInput.userInput;
        break;
        
      case 'help':
      case '-h':
        console.log(`
  help | -h  - Displays help
  -l         - Load a PDF and chat about it
  -s         - Saves chat in json format
  exit       - Exits the application
        `);
        continue;
    
      default:
        break;
    }

    const result = await chatSession.sendMessage(prompt);

    handleResponse(result, prompt);
  }
}

export { mainLoop };