export interface ClientRequestOptions {
  id: string;
}

export interface ClientResponse<P> {
  [id: string]: P;
}

/**
 * Repr
 */
export default abstract class ClientRequest<T, R extends ClientRequestOptions, K> {
  protected requests: R[];
  protected opts: T;
  
  /**
   * Creates a new ClientRequest instance
   * @param opts connection options, would be something like host / port
   */
  constructor (opts: T) {
    this.opts = opts;
    this.requests = [];
  }
  /**
   * Creates a request object from a method and arguments
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
   * Executes the request and returns a promise
   */
  abstract send (): Promise<ClientResponse<K>>;
}