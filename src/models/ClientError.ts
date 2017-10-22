export type ErrorCodes = 'unauthorized_access' | 'wrong_credentials' | 'wrong_request' | 'server_error' | 'offline_server' | 'unknown_error';

class ClientError extends Error {
  code: string;
  constructor (code: ErrorCodes, message: string = '') {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
  }
}

export default ClientError;

export const ErrorTypes = {
  unauthorized_access: 'unauthorized_access',
  wrong_credentials: 'wrong_credentials',
  wrong_request: 'wrong_request',
  server_error: 'server_error',
  offline_server: 'offline_server',
  unknown_error: 'unknown_error',
}