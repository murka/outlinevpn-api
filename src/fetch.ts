import * as https from 'https'
import {TLSSocket} from 'tls'
import {urlToHttpOptions} from 'url'
import type {IncomingMessage} from 'http'
import type {HttpRequest, HttpResponse} from './types'

const controller = new AbortController()

// see https://github.com/Jigsaw-Code/outline-server/blob/9fc83859c22ff502f9577916776dcb24007b89c9/src/server_manager/electron_app/fetch.ts#L23
export default async function fetchWithPin(
  req: HttpRequest,
  fingerprint: string,
  timeout: number = 10000,
): Promise<HttpResponse> {
  const response = await new Promise<IncomingMessage>((resolve, reject) => {
    const options: https.RequestOptions = {
      ...urlToHttpOptions(new URL(req.url)),
      method: req.method,
      headers: req.headers,
      timeout,
      signal: controller.signal,
      rejectUnauthorized: false, // Disable certificate chain validation.
    }
    const request = https.request(options, resolve).on('error', reject)

    request.on('timeout', () => {
      request.destroy();
      controller.abort();
      reject(new Error('Request timed out'));
    });

    if(request.socket) {
      request.socket.on('secureConnect', () => {
        const socket = request.socket as TLSSocket
        const cert = socket.getPeerCertificate()
        if (cert.fingerprint256 !== fingerprint) {
          reject(new Error(`Certificate fingerprint does not match ${fingerprint}`))
        }
      })
    }

    if (req.body) {
      request.write(req.body)
    }

    request.end()
  })

  const chunks: Buffer[] = []
  for await (const chunk of response) {
    chunks.push(chunk)
  }

  return {
    status: response.statusCode,
    ok: response.statusCode ? response.statusCode >= 200 && response.statusCode < 300 : false,
    body: Buffer.concat(chunks).toString(),
  }
}