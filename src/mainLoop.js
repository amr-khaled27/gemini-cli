import readlineSync from 'readline-sync';
import { model, chatSession } from './app.js';
import { saveChat } from './chats.js'

let chat_log = [];
let not_saved_yet = [];

async function mainLoop() {
  while (true) {
    const userInput = readlineSync.question('You: ');
    const formattedInput = userInput.toLocaleLowerCase().trim();
  
    if (formattedInput === 'exit') {
      console.log('Exiting...');
      break;
      
    } else if (formattedInput === 'history') {
      if (chat_log.length > 0) {
        chat_log.forEach(log => {
          console.log(log.role, log.content);
        })
      } else {
        console.log("No history to show");
      }
      continue;
    } else if (formattedInput === 'save') {
      saveChat(not_saved_yet);
      not_saved_yet = [];
      continue;
    } else if (formattedInput === 'pdf') {
      console.log('Work in progress');
      continue;
    } else if (formattedInput === 'help') {
      console.log(`
        help     - Displays Help
        history  - Displays Chat History
        pdf      - Prompt with a pdf
        save     - Saves Chat
        exit     - Exits the Application
      `);
      continue;
    }
    chat_log.push({role: 'user:', content: userInput})
    not_saved_yet.push({role: 'user:', content: userInput})

    const result = await chatSession.sendMessage(userInput);

    chat_log.push({role:'assistant:', content: `${result.response.text()}`});
    not_saved_yet.push({role:'assistant:', content: `${result.response.text()}`})

    console.log(result.response.text());
  }
}

export { mainLoop };