
import ClientRequest from './ClientRequest';
import Torrent from './Torrent';

export interface AddTorrentOptions {
  directory: string;
  /**
   * If true, the torrent client won't create a directory for multi torrents
   */
  baseDirectory: boolean;
}

export default abstract class Client {
  protected Request: typeof ClientRequest;
  constructor (request: typeof ClientRequest) {
    this.Request = request;
  }
  /**
   * Connects to the client
   */
  abstract connect (): Promise<void>;

  abstract getTorrents (): Promise<Torrent[]>;

  abstract addFile (torrent: string | Buffer, opts: AddTorrentOptions):  Promise<Torrent>;

  abstract addMagnet (torrent: string, opts: AddTorrentOptions):  Promise<Torrent>;

}