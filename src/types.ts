export interface Options {
  /**
   * The URL of the Outline server API.
   */
  apiUrl: string;
  /**
   * The sha256 fingerprint of the server's certificate.
   */
  fingerprint: string;
  /**
   * The number of milliseconds to wait before timing out a request.
   * @default 10000
   */
  timeout?: number;
  /**
   * The AbortController to use for cancelling requests.
   */
  abortController?: AbortController;
}

export interface AccessKey {
  id: string;
  name: string;
  password: string;
  port: number;
  method: string;
  accessUrl: string;
  limit?: {
    bytes: number;
  };
}

export type CreateAccessKeyOptions = Partial<AccessKey>;

export interface Server {
  name: string;
  serverId: string;
  metricsEnabled: boolean;
  createdTimestampMs: number;
  portForNewAccessKeys?: number;
  hostnameForAccessKeys?: string;
  accessKeyDataLimit?: {
    bytes: number;
  };
  version?: string;
}

// See https://github.com/Jigsaw-Code/outline-server/blob/master/src/shadowbox/model/metrics.ts
export interface DataUsagePerAccessKey {
  // The userId key should be of type AccessKeyId, however that results in the tsc
  // error TS1023: An index signature parameter type must be 'string' or 'number'.
  // See https://github.com/Microsoft/TypeScript/issues/2491
  // TODO: rename this to AccessKeyId in a backwards compatible way.
  bytesTransferredByUserId: { [userId: string]: number };
}

export interface ServerMetrics {
  metricsEnabled: boolean;
}

export interface HttpRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export interface HttpResponse {
  ok: boolean;
  status?: number;
  body: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
}
