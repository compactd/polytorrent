
import ClientRequest from './ClientRequest';
import {EventEmitter} from 'events';

export type TorrentProps = Partial<{
  progress: string;
  name: string;
  uploadRate: number;
  downloadRate: number;
  status: 'queueing' | 'downloading' | 'seeding' | 'errored' | 'inactive';
}>

export default abstract class Torrent extends EventEmitter{
  protected Request: typeof ClientRequest;
  protected hash: string;
  protected props: TorrentProps;

  constructor (request: typeof ClientRequest, hash: string, props: TorrentProps) {
    super();
    this.Request = request;
    this.hash = hash;
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
  
}