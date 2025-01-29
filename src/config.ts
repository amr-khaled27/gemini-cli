import { loading } from "cli-loading-animation";
import chalk from "chalk";
import { writeFileSync, existsSync, readFileSync } from "fs";
import inquirer from "inquirer";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

function getConfigPath(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const appDirectory: string = path.resolve(__dirname, "../");
  return appDirectory;
}

export interface Config {
  savePath: string;
  layout: string;
  systemInstructions: string;
}

const configPath: string = join(getConfigPath(), "config.json");

function configExists(): boolean {
  if (existsSync(configPath)) {
    return true;
  } else {
    return false;
  }
}

function readConfig(): Config {
  if (!configExists()) {
    throw new Error("Config file does not exist.");
  }

  const config = JSON.parse(readFileSync(configPath, "utf-8"));
  return config;
}

function createConfig(config: Config): void {
  const json = JSON.stringify(config);
  try {
    writeFileSync(configPath, json, { encoding: "utf-8", flag: "w" });
    console.log(
      chalk.greenBright("✔") + " Created default config at " + getConfigPath()
    );
  } catch (error) {
    console.log("Error creating config file: ", error);
  }
}

async function mainMenu(): Promise<{ choice: string }> {
  const setting = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Config Menu:",
      choices: ["Save path", "Layout", "AI Instructions", "Back"],
    },
  ]);

  return setting;
}

async function configMenu(): Promise<void> {
  if (!configExists()) {
    createConfig({ savePath: "./", layout: "Default", systemInstructions: "" });
  }

  let config = JSON.parse(readFileSync(configPath, "utf-8"));

  while (true) {
    const setting = await mainMenu();

    switch (setting.choice) {
      case "Save path":
        const savePath = await inquirer.prompt([
          {
            type: "list",
            name: "type",
            message: "Choose save location",
            choices: ["Default", "Custom"],
          },
        ]);
        switch (savePath.type) {
          case "Default":
            config.savePath = "./";
            break;

          case "Custom":
            const specified = await inquirer.prompt([
              {
                type: "input",
                name: "path",
                message: "Enter path",
              },
            ]);
            config.savePath = specified.path;
            createConfig(config);
            break;

          default:
            break;
        }
        break;

      case "Layout":
        const layout = await inquirer.prompt([
          {
            type: "list",
            name: "type",
            message: "Choose layout type",
            choices: ["Default"],
          },
        ]);
        config.layout = layout.type;
        createConfig(config);
        break;

      case "AI Instructions":
        const instructions = await inquirer.prompt([
          {
            type: "input",
            name: "instructions",
            message:
              "Enter AI Personality, the role you want it to play! **Note** changing the personality requires a restart of the app.",
          },
        ]);
        config.systemInstructions = instructions.instructions;
        createConfig(config);
        process.exit(0);

      case "Back":
        createConfig(config);
        console.clear();
        return;

      default:
        break;
    }
  }
}

export { configMenu, configExists, configPath, createConfig, readConfig };
