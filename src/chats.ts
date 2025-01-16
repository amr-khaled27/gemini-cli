import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { LogItem } from './mainLoop.js';
import { configExists, configPath, Config } from './config.js';

function openDirectory(path: string): void {
  const openDirectoryCommand = process.platform === 'win32'
  ? `explorer "${path}"`
  : process.platform === 'darwin'
  ? `open "${path}"`
  : `nemo "${path}"`;

  exec(openDirectoryCommand, (err, stdout, stderr) => {
    if (err) {
      console.error('Error opening directory:', err, '\ntrying thunar...');
      exec(`thunar "${path}"`);
    }
  });
}

export default function saveChat(log: Array<LogItem>): void {
  if (!configExists()) {
    console.log('Config file not found.\nRun the program with the --config flag to create one, or create oe using settings.');
    return;
  }

  const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  console.log(config.savePath);
  
  const dirPath: string = config.savePath;

  const today = new Date();
  const f = Intl.DateTimeFormat('en-us', {
    dateStyle: 'full',
  })

  const fileName = f.format(today) + '.json';
  const filePath = path.join(dirPath, fileName);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  if (!fs.existsSync(filePath)) {
    const jsonData = JSON.stringify(log);
    fs.writeFileSync(filePath, jsonData);
  } else {
    let file_log: Array<string> = [];
    const data = fs.readFileSync(filePath, 'utf8');
    file_log = JSON.parse(data);
    const parsedLog: Array<LogItem> = JSON.parse(data);
    parsedLog.push(...log);

    const updated_log = JSON.stringify(file_log);
    fs.writeFileSync(filePath, updated_log);
  }
  
  console.log('Chat log saved in:', filePath);
  openDirectory(dirPath);
}