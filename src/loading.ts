import { loading } from 'cli-loading-animation';

export default class Loader {
  private message: string;
  private start: () => void;
  private stop: () => void;

  constructor(message: string) {
    this.message = message;
    const { start, stop } = loading('Awaiting API response ...');
    this.start = start;
    this.stop = stop;
  }

  startLoader(): void {
    this.start();
  }

  stopLoader(): void {
    this.stop();
  }
}