import {EventEmitter} from 'events';

export type TorrentStates = 'queuing' | 'downloading' | 'seeding' | 'errored' | 'inactive' | 'paused';

export type TorrentProps = Partial<{
  progress: number;
  eta: number;
  name: string;
  uploadRate: number;
  downloadRate: number;
  status: TorrentStates;
  size: number;
}>
export default abstract class Torrent<T> extends EventEmitter{
  protected opts: T;
  protected _hash: string;
  protected props: TorrentProps;
  protected live: boolean = false;

  constructor (opts: T, hash: string, props: TorrentProps) {
    super();
    this.opts = opts;
    this._hash || hash;
    this.props = props;
  }
  on (event: 'error', listener: () => void): this;
  on (event: 'finish', listener: () => void): this;
  on (event: 'remove', listener: () => void): this;
  on (event: 'stop', listener: () => void): this;
  on (event: 'pause', listener: () => void): this;
  on (event: 'progress', listener: (progress: number) => void): this;
  on (event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);

    return this;
  }
  emit (event: 'error'): boolean;
  emit (event: 'finish'): boolean;
  emit (event: 'remove'): boolean;
  emit (event: 'stop'): boolean;
  emit (event: 'pause'): boolean;
  emit (event: 'progress', progress: number): boolean;
  emit (event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
  abstract liveFeed (polling: number): void;
  /**
   * Update the props with the client
   */
  abstract update (): Promise<void>;

  abstract pause (): Promise<void>;

  abstract remove (deleteData: boolean): Promise<void>;
  
  get progress () {
    return this.props.progress;
  }
  get name () {
    return this.props.name;
  }
  get uploadRate () {
    return this.props.uploadRate;
  }
  get downloadRate () {
    return this.props.downloadRate;
  }
  get status () {
    return this.props.status;
  }
  get hash () {
    return this._hash;
  }
  
}