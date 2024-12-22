import readlineSync from 'readline-sync';
import { formatResponse, getAPIResponse } from './api.js';
import { showHistory } from './utls.js'
import { saveChat } from './chats.js';

let chat_log = [];
let save_log = [];

async function mainLoop() {
  while (true) {
    const userInput = readlineSync.question('You: ');
    const formattedInput = userInput.toLocaleLowerCase().trim();
  
    if (formattedInput === 'exit') {
      console.log('Exiting...');
      break;
    } else if (formattedInput === 'history') {
      showHistory(chat_log);
      continue;
    } else if (formattedInput == 'save') {
      if (save_log == []) {
        console.log("Noting to save!");
        continue;
      }
      saveChat(save_log);
      save_log = [];
      continue;
    } else if (formattedInput === 'help') {
      console.log(`
        help     - Displays Help
        history  - Displays Chat History
        save     - Saves Chat
        exit     - Exits the Application
      `);
      continue;
    }
  
    chat_log.push({'role': 'user', 'content': userInput});
    save_log.push({'role': 'user', 'content': userInput});
  
    const response = await getAPIResponse(chat_log);
  
    const text = formatResponse(response);
  
    chat_log.push({'role': "assistant", 'content': text});
    save_log.push({'role': "assistant", 'content': text});
  
    console.log("LLaMA: ", text);
  }
}

export {mainLoop};