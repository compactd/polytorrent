import Torrent, {TorrentProps} from '../models/Torrent';
import Options from './options';

export default class DelugeTorrent extends Torrent<Options> {
  constructor (opts: Options, hash: string, props: TorrentProps) {
    super(opts, hash, props);

  }
  liveFeed(): void {
    throw new Error("Method not implemented.");
  }
  update(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  pause(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  remove(deleteData: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }

}