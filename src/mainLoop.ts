import inquirer from "inquirer";
import chalk from "chalk";
import cliMd from "cli-markdown";
import { chatSession } from "../bin/app.js";
import saveChat from "./chats.js";
import pdf from "./pdf.js";
import { loading } from "cli-loading-animation";
import { configMenu } from "./config.js";
import { printHistory, welcome } from "./consoleUtils.js";

export interface LogItem {
  role: string;
  content: string;
}

type GenerateContentResult = {
  response: {
    text: () => string;
  };
};

export type PromptTheme = {
  theme: {
    prefix: { done: string; idle: string };
  };
};

let full_log: Array<LogItem> = [];
let not_saved_yet: Array<LogItem> = [];
let prompt: string;
const loader = loading("Awaiting API response...");

const customPromptTheme: PromptTheme = {
  theme: {
    prefix: { done: chalk.blueBright("✔"), idle: chalk.yellow("◯") },
  },
};

async function handleResponse(
  result: GenerateContentResult,
  prompt: string
): Promise<void> {
  full_log.push({ role: "user:", content: prompt });
  full_log.push({ role: "assistant:", content: `${result.response.text()}` });
  not_saved_yet.push({ role: "user:", content: prompt });
  not_saved_yet.push({
    role: "assistant:",
    content: `${result.response.text()}`,
  });

  console.log(cliMd(result.response.text()));
}

async function menuHandler(): Promise<Boolean> {
  let exit: boolean = false;
  let proceed: boolean = false;
  while (!exit) {
    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "Choose an option:",
        choices: [
          "Continue chatting",
          "Settings",
          "Save chat",
          "Load PDF",
          "Exit",
        ],
      },
    ]);

    switch (choice) {
      case "Continue chatting":
        console.clear();
        welcome();
        printHistory();
        exit = true;
        proceed = true;
        break;

      case "Settings":
        await configMenu();
        break;

      case "Save chat":
        saveChat(not_saved_yet);
        not_saved_yet = [];
        proceed = true;
        break;

      case "Load PDF":
        await pdf();
        exit = true;
        break;

      case "Exit":
        console.log("Bye!");
        process.exit(0);

      default:
        break;
    }
  }
  return proceed;
}

async function mainLoop(): Promise<void> {
  while (true) {
    let input: { prompt: string };
    try {
      input = await inquirer.prompt<{ prompt: string }>({
        ...customPromptTheme,
        type: "input",
        name: "prompt",
        message: "Prompt:",
      });
    } catch (error) {
      console.error("Error getting user input!");
      break;
    }

    const formattedInput: string = input.prompt.toLowerCase().trim();
    prompt = input.prompt;

    if (formattedInput === "-h" || formattedInput === "help") {
      console.log(
        cliMd(
          `
    To access the main menu, simply type \`menu\` or 'm'.
      `
        )
      );
    } else if (formattedInput === "menu" || formattedInput === "m") {
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
