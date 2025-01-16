import chalk from 'chalk';
import { writeFileSync ,existsSync, readFileSync } from 'fs';
import inquirer from 'inquirer';
import { dirname, join } from 'path';

function getAppPath(): string {
  const appDirectory: string = dirname('.');
  return appDirectory;
}

export interface Config {
  savePath:string
}

const configPath: string = join(getAppPath(), 'config.json');

function configExists(): boolean {
  if (existsSync(configPath)) {
    return true;
  } else {
    return false;
  }
}

function createConfig(config: Config): void {
  const json = JSON.stringify(config);
  try {
    writeFileSync(configPath, json);
    console.log(chalk.greenBright('✔') + ' Created default config at ' + getAppPath());
  } catch (error) {
    console.log('Error creating config file: ', error);
  }
}

async function mainMenu(): Promise<{ choice: string }> {
  const setting = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Config Menu:',
      choices: ['Save path', 'Layout', 'Back'],
    },
  ]);

  return setting;
}

async function configMenu(): Promise<void> {
  if (!configExists()) {
    createConfig({ savePath: './' });
  }

  let config = JSON.parse(readFileSync(configPath, 'utf-8'));

  while (true) {
    const setting = await mainMenu();

    switch (setting.choice) {
      case 'Save path':
        const savePath = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            message: 'Choose save location',
            choices: ['Default', 'Custom']
          },
        ]);
        switch (savePath.type) {
          case 'Default':
            config.savePath = './';
            break;

          case 'Custom':
            const specified = await inquirer.prompt([
              {
                type: 'input',
                name: 'path',
                message: 'Enter path'
              }
            ]);
            config.savePath = specified.path;
            break;

          default:
            break;
        }
        break;

        case 'Layout':
          console.log('Layout!!!');
          const layout = await inquirer.prompt([
            {
              type: 'list',
              name: 'type',
              message: 'Choose layout type',
              choices: ['Default']
            },
          ]);
          config.layout = layout.type;
          break;
        
        case 'Back':
          console.log('Saving config...');
          try {
            writeFileSync(configPath, JSON.stringify(config, null, 2));
          } catch (error) {
            console.log('Error updating config:', error);
          }
          return;
          
          default:
            break;
          }
  }
}

export { configMenu, configExists, configPath };