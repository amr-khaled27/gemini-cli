import inquirer from 'inquirer';
import { chatSession } from './app.js';
import { saveChat } from './chats.js';
import { pdf } from './pdf.js';
import cliMd from 'cli-markdown';

let chat_log = [];
let not_saved_yet = [];

async function mainLoop() {

  while (true) {
    let userInput;
    try {
      userInput = await inquirer.prompt([
      {
        theme: {prefix: '$'},
        type: 'input',
        name: 'userInput',
        message: 'You:',
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
    
      case '-h':
        console.log(`
        -h       - Displays help
        -l       - Load a PDF and chat about it
        -s       - Saves chat in json format
        exit     - Exits the application
        `);
        continue;
    
      default:
        break;
    }
    chat_log.push({role: 'user:', content: prompt});
    not_saved_yet.push({role: 'user:', content: prompt});

    const result = await chatSession.sendMessage(prompt);

    chat_log.push({role:'assistant:', content: `${result.response.text()}`});
    not_saved_yet.push({role:'assistant:', content: `${result.response.text()}`});

    console.log(cliMd(result.response.text()));
  }
}

export { mainLoop };