import Client, {AddTorrentOptions} from '../models/Client';
import DelugeTorrent from './DelugeTorrent';
import ClientError from '../models/ClientError';
import Request from './DelugeClientRequest';
import Options from './options';

require('util.promisify/shim')();

import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

import * as parseTorrent from 'parse-torrent';

export default class DelugeClient extends Client<Options> {
  async connect(): Promise<void> {
    const loginRequest = new Request(this.opts);
    
    Object.assign(this.opts, await loginRequest.login());

    const req = new Request(this.opts);

    req.add('isConnected', 'web.connected', []);
    req.add('hosts', 'web.get_hosts', []);

    const {isConnected, hosts} = await req.send();

    if (isConnected) {
      return;
    }

    const host = hosts.find(([id, , , status, ]: string[]) => {
      if (id === this.opts.delugeHost) {
        return id;
      }
      if (status === 'Online') {
        return id;
      }
    });

    if (!host) {
      return Promise.reject(new ClientError('offline_server', 'Cannot find a suitable deluge daemon'));
    }
    
    const connectRequest = new Request(this.opts);

    connectRequest.add('omit', 'web.connect', [host]);

    connectRequest.send();
  }
  async getTorrents(): Promise<DelugeTorrent[]> {
    const request = new Request(this.opts);

    request.add('status', 'web.update_ui', [[
      'queue',
      'name',
      'total_wanted',
      'state',
      'progress',
      'eta',
      'download_payload_rate',
      'upload_payload_rate'
    ], {}]);
    const {status} = await request.send();
    
    return Object.keys(status.torrents).map((hash) => {
      const torrent = status.torrents[hash];
      return new DelugeTorrent(this.opts, hash, {
        name: torrent.name,
        eta: torrent.eta,
        downloadRate: status.download_payload_rate,
        uploadRate: status.upload_payload_rate
      });
    });
  }
  async addFiles (torrents: (string | Buffer)[], opts: AddTorrentOptions): Promise<DelugeTorrent[]> {

    if (opts.baseDirectory) {
      throw new TypeError('Option `baseDirectory` is not supported in deluge');
    }
    const request = new Request(this.opts);

    await Promise.all(torrents.map(async (torrent, index) => {
      const tmp = path.join(opts.tempDirectory || __dirname, Math.random().toString(36).substring(7) + '.torrent');
      const target = Buffer.isBuffer(torrent) ? tmp : torrent;
      let hash: string | undefined;
      
      if (Buffer.isBuffer(torrent)) {
        const writeFile = util.promisify(fs.writeFile);
  
        await writeFile(target, torrent);
        hash = parseTorrent(torrent).infoHash;
      } else {
        const readFile = util.promisify(fs.readFile);
  
        const content = await readFile(target, {encoding: null});
        hash = parseTorrent(content).infoHash;
      }
      
  
      request.add(hash || 'addFile_' + index, 'web.add_torrents', [[{
        path: target,
        options: {
          download_location: opts.directory
        }
      }]]);
    }));

    const res = await request.send();

    return Object.keys(res).map((hash) => {
      
      if (!res[hash]) throw new ClientError('server_error', 'Unable to add file ' + hash);
      return new DelugeTorrent(this.opts, hash, {});
    });
  }
  addMagnet(torrent: string, opts: AddTorrentOptions): Promise<DelugeTorrent> {
    throw new Error("Method not implemented.");
  }
  async getTorrent (hash: string): Promise<DelugeTorrent> {
    const torrent = new DelugeTorrent(this.opts, hash, {});
    await torrent.update();
    return torrent;
  }
}
