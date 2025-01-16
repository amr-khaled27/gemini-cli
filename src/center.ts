import chalk from "chalk";

function centerLine(line: string): void {
  const terminalWidth = process.stdout.columns;
  if (terminalWidth === undefined) {
    console.log(line)
    return;
  }
  const lineLength = line.length;
  const paddingLength = Math.max(0, Math.floor((terminalWidth - lineLength) / 2));
  const padding = ' '.repeat(paddingLength);

  const useChalk: boolean = line.includes('─');

  if (useChalk) {
    console.log(padding + chalk.green(line));
  } else {
    console.log(padding + line);
  }
}

export default centerLine;