
import ClientRequest from './ClientRequest';

export type TorrentProps = Partial<{
  progress: string;
  name: string;
  uploadRate: number;
  downloadRate: number;
  status: 'queueing' | 'downloading' | 'seeding' | 'errored' | 'inactive';
}>

export default abstract class Torrent {
  protected Request: typeof ClientRequest;
  protected hash: string;
  protected props: TorrentProps;

  constructor (request: typeof ClientRequest, hash: string, props: TorrentProps) {
    this.Request = request;
    this.hash = hash;
    this.props = props;
  }
  
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