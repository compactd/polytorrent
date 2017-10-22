export interface ClientRequestOptions {
  id: string;
}

export interface ClientResponse {
  [id: string]: any;
}

/**
 * Repr
 */
export default abstract class ClientRequest<T, R extends ClientRequestOptions, K> {
  protected requests: R[];
  protected opts: Partial<T & K>;
  
  /**
   * Creates a new ClientRequest instance
   * @param opts connection options, would be something like host / port
   */
  constructor (opts: Partial<T & K>) {
    this.opts = opts;
    this.requests = [];
  }
  /**
   * Login using credentials supplied to the constructor
   * @return {K} an object which may be supplied to the constructor to relogin
   *             could be a cookie jar for example for an http api
   */
  abstract login (): Promise<K>;

  /**
   * Creates a request object from a method and arguments
   * @param id the request id, used in the response object as the key
   * @param method the method name to call
   * @param args the request arguments
   */
  abstract getRequest (id: string, method: string, args: any[]): R;

  /**
   * 
   * @param request 
   */
  addRequest (request: R) {
    this.requests.push(request);
    return this;
  }
  /**
   * Creates and adds a request object from a method and arguments
   * @param id the request id, used in the response object as the key
   * @param method the method name to call
   * @param args the request arguments
   */
  add (id: string, method: string, args: any[]) {
    this.requests.push(this.getRequest(id, method, args));
  }

  /**
   * Executes the request and returns a promise
   */
  abstract send (): Promise<ClientResponse>;
}