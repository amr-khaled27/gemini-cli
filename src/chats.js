import fs from 'fs';
import path from 'path';

function saveChat(log) {
  const dirPath = 'chats';
  const today = new Date();
  const f = Intl.DateTimeFormat('en-us', {
    dateStyle: 'full',
  })

  const fileName = f.format(today) + '.json';
  const filePath = path.join(dirPath, fileName);

  console.log(filePath);

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
}

export { saveChat };
