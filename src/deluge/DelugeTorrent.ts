import Torrent, {TorrentProps, TorrentStates} from '../models/Torrent';
import Options from './options';
import Request from './DelugeClientRequest';
import ClientError from '../models/ClientError';

import * as diff from 'deep-diff';

export const statusMap: {[name: string]: TorrentStates} = {
  'Seeding': 'seeding',
  'Downloading': 'downloading',
  'Paused': 'paused'
}

export function mapResultToProps (res: any): TorrentProps {
  return {
    name: res.name,
    size: res.total_wanted,
    status: statusMap[res.state],
    progress: res.progress / 100,
    eta: res.eta,
    downloadRate: res.download_payload_rate,
    uploadRate: res.upload_payload_rate
  }
}

export default class DelugeTorrent extends Torrent<Options> {
  private interval: NodeJS.Timer;
  constructor (opts: Options, hash: string, props: TorrentProps) {
    super(opts, hash, props);
  }
  liveFeed (polling = 420): void {
    if (polling < 1) {
      clearInterval(this.interval);
      this.live = false;
      return;
    }
    if (this.live) return;
    
    this.live = true;

    this.interval = setInterval(async () => {
      const req = new Request(this.opts);
      req.add('props', 'web.get_torrent_status', [
        this._hash, [
          'queue',
          'name',
          'total_wanted',
          'state',
          'progress',
          'eta',
          'download_payload_rate',
          'upload_payload_rate'
        ]
      ]);
      const {props} = await req.send();
      const newProps = mapResultToProps(props);

      if (Object.keys(props).length === 0) {
        this.emit('remove');
        clearInterval(this.interval);
        this.live = false;
        return;
      }

      const delta = diff.diff(newProps, this.props);
      
      this.props = newProps;
      if (delta) { 
        delta.forEach(({kind, path: [key], lhs: value, rhs: old}) => {
          if (key === 'progress') {
            this.emit('progress', value);
          }
          if (key === 'status') {
            if (value === 'seeding' && old === 'downloading') this.emit('finish');
            if (value === 'paused'  && old !== 'stopped') this.emit('pause');
            if (value === 'downloading' && old === 'paused') this.emit('resume');
            if (value === 'stopped' && old !== 'finish') this.emit('stop');
          }
        });
      }   
    }, polling);

  }
  async update(): Promise<void> {
    const req = new Request(this.opts);
    req.add('props', 'web.get_torrent_status', [
      this._hash, [
        'queue',
        'name',
        'total_wanted',
        'state',
        'progress',
        'eta',
        'download_payload_rate',
        'upload_payload_rate'
      ]
    ]);
    const {props} = await req.send();
    const newProps = mapResultToProps(props);
   
    this.props = newProps;
  }
  async pause(): Promise<void> {
    const req = new Request(this.opts);
    req.add('paused', 'core.pause_torrent', [[this._hash]]);
    await req.send();
  }
  async resume(): Promise<void> {
    const req = new Request(this.opts);
    req.add('paused', 'core.resume_torrent', [[this._hash]]);
    await req.send();
  }
  async remove (deleteData: boolean): Promise<void> {
    const req = new Request(this.opts);
    req.add('deleted', 'core.remove_torrent', [this._hash, deleteData]);
    const {deleted} = await req.send();

    if (!deleted) {
      throw new ClientError('server_error', 'Unable to delete torrent');
    }
  }

}