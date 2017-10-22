import Torrent from './Torrent';

export interface AddTorrentOptions {
  directory: string;
  /**
   * If true, the torrent client won't create a directory for multi torrents
   */
  baseDirectory?: boolean;
  tempDirectory?: string;
}

export default abstract class Client<T> {
  protected opts: any;
  constructor (opts: T) {
    this.opts = opts;
  }
  /**
   * Connects to the client
   */
  abstract connect (): Promise<void>;

  abstract getTorrents (): Promise<Torrent<T>[]>;

  async addFile (torrent: (string | Buffer), opts: AddTorrentOptions):  Promise<Torrent<T>> {
    const [file] = await this.addFiles([torrent], opts);
    return file;
  }

  abstract addFiles (torrent: (string | Buffer)[], opts: AddTorrentOptions):  Promise<Torrent<T>[]>;

  abstract addMagnet (torrent: string, opts: AddTorrentOptions):  Promise<Torrent<T>>;

  abstract getTorrent (hash: string): Promise<Torrent<T>>;

}