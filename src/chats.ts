import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

function openDirectory(path: string) {
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

function saveChat(log: Array<string>) {
  const __filename: string = fileURLToPath(import.meta.url);
  const __dirname: string = dirname(__filename);
  const appDirectory: string = path.resolve(__dirname, '..');
  const dirPath: string = path.join(appDirectory, 'chats');

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
    file_log.push(...log);

    const updated_log = JSON.stringify(file_log);
    fs.writeFileSync(filePath, updated_log);
  }
  
  console.log('Chat log saved in:', filePath);
  openDirectory(path.join(appDirectory, 'chats'));
}

export { saveChat };
