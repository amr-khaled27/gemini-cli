import readlineSync, { question } from 'readline-sync';
import { model, chatSession } from './app.js';
import { saveChat } from './chats.js'

let chat_log = [];
let not_saved_yet = [];

async function mainLoop() {

  let pdf = undefined;

  while (true) {
    let userInput = readlineSync.question('You: ');
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
      pdf = await fetch('https://discovery.ucl.ac.uk/id/eprint/10089234/1/343019_3_art_0_py4t4l_convrt.pdf')
        .then((response) => response.arrayBuffer());
      userInput = readlineSync.question('Prompt: ');
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
    chat_log.push({role: 'user:', content: userInput});
    not_saved_yet.push({role: 'user:', content: userInput});

    let result;

    if (pdf == undefined) {
      result = await chatSession.sendMessage(userInput);
    } else {
      result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(pdf).toString("base64"),
                mimeType: "application/pdf",
            },
        },
        userInput,
      ]);
    }

    chat_log.push({role:'assistant:', content: `${result.response.text()}`});
    not_saved_yet.push({role:'assistant:', content: `${result.response.text()}`})

    console.log(result.response.text());
  }
}

export { mainLoop };