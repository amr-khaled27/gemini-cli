import { question } from 'readline-sync';
import { chatSession } from './app.js';
import { saveChat } from './chats.js';
import { pdf } from './pdf.js';

let chat_log = [];
let not_saved_yet = [];
let prepend = "";

async function mainLoop() {

  while (true) {
    const userInput = question('You: ');
    const prompt = prepend + '\n' + userInput;
    const formattedInput = userInput.toLocaleLowerCase().trim();
  
    if (formattedInput === 'exit') {
      console.log('Bye!');
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
    } else if (formattedInput === 'loadpdf') {
      prepend = await pdf();
      console.log("log from after load!");
      continue;
    } else if (formattedInput === 'unload') {
      prepend = "";
      console.log("PDF unloaded!");
      continue;
    } else if (formattedInput === 'help') {
      console.log(`
        help     - Displays help
        history  - Displays chat history
        loadpdf  - Load a PDF and chat about it
        unload   - Unload the PDF
        save     - Saves chat in json format
        exit     - Exits the application
      `);
      continue;
    }
    chat_log.push({role: 'user:', content: prompt});
    not_saved_yet.push({role: 'user:', content: prompt});


    const result = await chatSession.sendMessage(prompt);

    chat_log.push({role:'assistant:', content: `${result.response.text()}`});
    not_saved_yet.push({role:'assistant:', content: `${result.response.text()}`})

    console.log(result.response.text());
  }
}

export { mainLoop };