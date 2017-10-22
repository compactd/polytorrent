import * as test from 'tape';
import DelugeClient from './DelugeClient';

require('util.promisify/shim')();

import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

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
  await client.getTorrents();
  t.end();
});

test('DelugeClient.addFiles() - adds torrents', async (t) => {
  const readFile = util.promisify(fs.readFile);

  const client = new DelugeClient({host: 'localhost', port: 8112, password: 'deluge'});
  await client.connect();

  const archlinux_torrent = path.join(__dirname, '../../torrents/archlinux-2017.10.01-x86_64.iso.torrent');
  const ubuntu_torrent = path.join(__dirname, '../../torrents/ubuntu-17.10-desktop-amd64.iso.torrent');

  const torrents = await client.addFiles([archlinux_torrent, await readFile(ubuntu_torrent, {encoding: null})], {
    directory: path.join(__dirname, '../../torrents/target')
  });

  t.is(torrents.length, 2);
  t.is(torrents[0].hash, '9228628504cc40efa57bf38e85c9e3bd2c572b5b');
  t.is(torrents[1].hash, '40448d478d9203a3919b0900e7fbb9e8748dcdf9');

  t.end();
});

test('DelugeClient.getTorrents() - returns the newly added torrents', async (t) => {
  const client = new DelugeClient({host: 'localhost', port: 8112, password: 'deluge'});

  await client.connect();

  const torrents = await client.getTorrents();

  t.is(torrents.length, 2);

  t.is(torrents[0].name, 'ubuntu-17.10-desktop-amd64.iso');
  t.is(torrents[1].name, 'archlinux-2017.10.01-x86_64.iso');
  
  t.end();
});