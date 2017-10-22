import * as test from 'tape';
import DelugeClientRequest from './DelugeClientRequest';
import {ErrorTypes} from '../models/ClientError';

test('DelugeClientRequest.login() - throw offline_error for an unresolved host', async (t) => {
  const request = new DelugeClientRequest({host: 'foobar', port: 80});
  try {
    await request.login();
    t.fail('Login completed without an error');
  } catch (err) {
    t.is(err.code, ErrorTypes.offline_server);
  } finally {
    t.end();
  }
});

test('DelugeClientRequest.login() - throw wrong_credentials for an invalid password', async (t) => {
  const request = new DelugeClientRequest({host: 'localhost', port: 8112, password: 'fooobar'});
  try {
    await request.login();
    t.fail('Login completed without an error');
  } catch (err) {
    t.is(err.code, ErrorTypes.wrong_credentials);
  } finally {
    t.end();
  }
});

test('DelugeClientRequest.login() - return a cookie for a valid auth', async (t) => {
  const request = new DelugeClientRequest({host: 'localhost', port: 8112, password: 'deluge'});
  const {cookie} = await request.login();
  t.true(/^[a-f0-9]{36}$/.test(cookie))
  t.end();
});

test('DelugeClientRequest.send() - send a simple request web.connected', async (t) => {
  const loginRequest = new DelugeClientRequest({host: 'localhost', port: 8112, password: 'deluge'});
  const opts = await loginRequest.login();
  
  const request = new DelugeClientRequest({host: 'localhost', port: 8112, ...opts});
  request.addRequest(request.getRequest('connected', 'web.connected', []));
  const res = await request.send();
  t.deepEqual(res, {connected: true});
  t.end();
});

test('DelugeClientRequest.send() - send multiple request', async (t) => {
  const loginRequest = new DelugeClientRequest({host: 'localhost', port: 8112, password: 'deluge'});
  const opts = await loginRequest.login();
  
  const request = new DelugeClientRequest({host: 'localhost', port: 8112, ...opts});
  request.add('connected', 'web.connected', []);
  request.add('info', 'daemon.info', []);
  const res = await request.send();
  t.deepEqual(res, {connected: true, info: '1.3.15'});
  t.end();
});
