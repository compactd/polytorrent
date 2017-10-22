import {EventEmitter} from 'events';

export type TorrentProps = Partial<{
  progress: number;
  eta: number;
  name: string;
  uploadRate: number;
  downloadRate: number;
  status: 'queuing' | 'downloading' | 'seeding' | 'errored' | 'inactive';
}>

export default abstract class Torrent<T> extends EventEmitter{
  protected opts: T;
  protected _hash: string;
  protected props: TorrentProps;

  constructor (opts: T, hash: string, props: TorrentProps) {
    super();
    this.opts = opts;
    this._hash = hash;
    this.props = props;
  }
  abstract liveFeed (): void;
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