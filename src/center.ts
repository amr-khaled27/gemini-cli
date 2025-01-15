import chalk from "chalk";

function centerLine(line: string) {
  const terminalWidth = process.stdout.columns;
  if (terminalWidth === undefined) {
    console.log(line)
    return;
  }
  const lineLength = line.length;
  const paddingLength = Math.max(0, Math.floor((terminalWidth - lineLength) / 2));
  const padding = ' '.repeat(paddingLength);

  console.log(padding + chalk.green(line));
}

export default centerLine;