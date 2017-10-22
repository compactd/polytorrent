import Torrent, {TorrentProps} from '../models/Torrent';
import Options from './options';
import Request from './DelugeClientRequest';
import ClientError from '../models/ClientError';

export default class DelugeTorrent extends Torrent<Options> {
  constructor (opts: Options, hash: string, props: TorrentProps) {
    super(opts, hash, props);
  }
  liveFeed(polling = 420): void {
    throw new Error("Method not implemented.");
  }
  update(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  pause(): Promise<void> {
    throw new Error("Method not implemented.");
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