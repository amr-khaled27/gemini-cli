import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

function openDirectory(path) {
  const openDirectoryCommand = process.platform === 'win32'
  ? `explorer "${path}"`
  : process.platform === 'darwin'
  ? `open "${path}"`
  : `nemo "${path}"`;

  exec(openDirectoryCommand, (err, stdout, stderr) => {
    if (err) {
      console.error('Error opening directory:', err);
      return;
    }
  });
}

function saveChat(log) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const appDirectory = path.resolve(__dirname, '..');
  const dirPath = path.join(appDirectory, 'chats');

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
    let file_log = [];
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
