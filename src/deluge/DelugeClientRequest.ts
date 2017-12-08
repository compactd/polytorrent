import ClientRequest, {ClientResponse} from '../models/ClientRequest';
import fetch from 'node-fetch';
import {parse} from 'set-cookie-parser';
import ClientError from '../models/ClientError';
import Options from './options';
import * as PQueue from 'p-queue';

export interface ClientRequestOptions {
  id: string;
  method: string;
  params: any[];
}

export type ConnectParams = {
  cookie: string;
};

const queue = new PQueue();

export default class DelugeClientRequest extends ClientRequest<Options, ClientRequestOptions, ConnectParams> {
  login(): Promise<ConnectParams> {
    return queue.add(this._login.bind(this));
  }
  private async _login(): Promise<ConnectParams> {
    try {
      const res = await fetch(`http://${this.opts.host}:${this.opts.port}/${this.opts.endpoint || 'json'}`, {
        method: 'POST',
        body: JSON.stringify({
          method: 'auth.login',
          params: [this.opts.password],
           id: 1
        }),
        headers: {
          'content-type': 'application/json'
        }
      });
      
      if (res.status !== 200) {
        if (res.status === 500) return Promise.reject(new ClientError('server_error', 'unexpected server 500 error'));
        throw new ClientError('unknown_error', 'An unknown error occured');
      }
      const {result} = await res.json();

      if (!result) {
        return Promise.reject(new ClientError('wrong_credentials', 'Incorrect password'));
      }

      const cookie = parse(res.headers.get('set-cookie'))[0].value;
      return {cookie};
    } catch (err) {
      if (err.code === 'ENOTFOUND') {
        throw new ClientError('offline_server', 'Cannot reach server: ' + err.code);
      }
      throw new ClientError('unknown_error', 'An unknown error occured');
    }
  }
  getRequest(id: string, method: string, params: any[]): ClientRequestOptions {
    return {id, method, params};
  }
  send(): Promise<ClientResponse> {
    return queue.add(this._send.bind(this));
  }
  private _send(): Promise<ClientResponse> {
    const requests = this.requests.map((req, index) => {
      return async (results: any) => {
        const res = await fetch(`http://${this.opts.host}:${this.opts.port}/${this.opts.endpoint || 'json'}`, {
          method: 'POST',
          body: JSON.stringify({...req, id: index}),
          headers: {
            'content-type': 'application/json',
            'cookie': `_session_id=${this.opts.cookie}`
          }
        });
        
        if (res.status !== 200) {
          if (res.status === 500) return Promise.reject(new ClientError('server_error', 'unexpected server 500 error'));
          throw new ClientError('unknown_error', 'An unknown error occured');
        }
        const body = await res.text();
        
        const {result} = JSON.parse(body);

        Object.assign(results, {[req.id]: result});
      }
    });
    const results = {};
    return requests.reduce((acc, val) => {
      return acc.then(() => {
        return val(results);
      });
    }, Promise.resolve()).then(() => {
      return results;
    })
  }

}