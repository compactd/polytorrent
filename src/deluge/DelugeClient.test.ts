import * as test from 'tape';
import DelugeClient from './DelugeClient';

require('util.promisify/shim')();

import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as sinon from 'sinon';

// import {ErrorTypes} from '../models/ClientError';


test('DelugeClient.connect() - connects to a daemon', async (t) => {
  const client = new DelugeClient({host: 'localhost', port: 8112, password: 'deluge'});
  await client.connect();
  t.pass('should connect');
  t.end();
})

test('DelugeClient.getTorrents() - returns an empty list', async (t) => {
  const client = new DelugeClient({host: 'localhost', port: 8112, password: 'deluge'});
  await client.connect();
  const torrents = await client.getTorrents();

  t.is(torrents.length, 0, 'should return empty list');
  t.end();
});

test('DelugeClient.addFiles() - adds torrents', async (t) => {
  const readFile = util.promisify(fs.readFile);

  const client = new DelugeClient({host: 'localhost', port: 8112, password: 'deluge'});
  await client.connect();

  const archlinux_torrent = path.join(__dirname, '../../torrents/archlinux-2017.10.01-x86_64.iso.torrent');
  const ubuntu_torrent = path.join(__dirname, '../../torrents/ubuntu-17.10-desktop-amd64.iso.torrent');

  const torrents = await client.addFiles([archlinux_torrent, await readFile(ubuntu_torrent, {encoding: null})], {
    directory: path.join(__dirname, '../../torrents/target'),
    tempDirectory: path.join(__dirname, '../../torrents/temp')
  });

  t.is(torrents.length, 2, 'should return 2 torrents');
  t.is(torrents[0].hash, '9228628504cc40efa57bf38e85c9e3bd2c572b5b', 'should have the right hashes');
  t.is(torrents[1].hash, '40448d478d9203a3919b0900e7fbb9e8748dcdf9', 'should have the right hashes')

  t.end();
});

test('DelugeClient.getTorrents() - returns the newly added torrents', async (t) => {
  const client = new DelugeClient({host: 'localhost', port: 8112, password: 'deluge'});

  await client.connect();

  const torrents = await client.getTorrents();

  t.is(torrents.length, 2, 'should only return two torrents');

  t.is(torrents[0].name, 'ubuntu-17.10-desktop-amd64.iso', 'should have the torrent name');
  t.is(torrents[1].name, 'archlinux-2017.10.01-x86_64.iso', 'should have the torrent name');

  t.end();
});

test('DelugeTorrent.liveFeed() - emits events', async (t) => {
  const hash = '9228628504cc40efa57bf38e85c9e3bd2c572b5b';
  const timeout = util.promisify(setTimeout);
  const client = new DelugeClient({host: 'localhost', port: 8112, password: 'deluge'});

  await client.connect();
  const torrent = await client.getTorrent(hash);

  console.log(torrent);
  
  const pauseStub = sinon.stub();
  torrent.on('pause', pauseStub);
  torrent.liveFeed(100);

  await timeout(200);

  await torrent.pause();

  await timeout(200);

  t.is(pauseStub.calledOnce, true, 'Paused called');
  t.end();
});

test('DelugeTorrent.remove() - removes torrents with data', async (t) => {
  const readdir = util.promisify(fs.readdir);
  const unlink  = util.promisify(fs.unlink);

  const client = new DelugeClient({host: 'localhost', port: 8112, password: 'deluge'});

  await client.connect();

  const torrents = await client.getTorrents();
  t.is(torrents.length, 2, 'should return all the torrents');

  await Promise.all(torrents.map((t) => t.remove(true)));

  const emptyTorrents = await client.getTorrents();
  t.is(emptyTorrents.length, 0, 'should return no torrents once removed');

  const target = path.join(__dirname, '../../torrents/target');
  const temp = path.join(__dirname, '../../torrents/temp');

  const downloads = await readdir(target);
  
  t.deepEqual(downloads, ['.gitignore'], 'should have removed the downloaded files');

  const temps = await readdir(temp);
  const ops = temps.filter((f) => f !== '.gitignore').map((f) => unlink(path.join(temp, f)));
  await Promise.all(ops);

  t.end();
});