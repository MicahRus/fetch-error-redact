import {redactData} from './helpers'
import {HttpErrorResponse, RedactorConfig} from './types'

export const redactedKeyword = '<REDACTED>'
const queryParamsRegex = /(?<=\?|#)\S+/ig

export class FetchRedactor {
  private redactRequestData: boolean
  private redactResponseData: boolean
  private redactQueryData: boolean

  constructor(config?: RedactorConfig) {
    this.redactQueryData = config?.redactQueryData ?? true
    this.redactRequestData = config?.redactRequestData ?? true
    this.redactResponseData = config?.redactResponseData ?? true
  }

  skipRequestData(): FetchRedactor {
    this.redactRequestData = false
    return this
  }

  skipResponseData(): FetchRedactor {
    this.redactResponseData = false
    return this
  }

  skipQueryData(): FetchRedactor {
    this.redactQueryData = false
    return this
  }

  private redactUrlQueryParams(url: string | undefined): string {
    console.log('urlasdfas:', url) // TODO: Delete
    if (!url)
      return ''

    return this.redactQueryData ? url.replace(queryParamsRegex, redactedKeyword) : url
  }

  async redactError(fetchResponse: Response, fetchRequest?: Request): Promise<HttpErrorResponse> {
    const url = new URL(fetchResponse.url)
    const fetchResponseBody = fetchResponse.ok ? await fetchResponse.clone().json() : ''
    const redactedResponseData = redactData(fetchResponseBody, this.redactResponseData)

    const fetchRequestBody = fetchResponse.ok ? await fetchRequest?.clone().json() : ''
    const redactedRequestData = redactData(fetchRequestBody, this.redactRequestData)

    const redactedUrl = this.redactUrlQueryParams(url.href)
    return {
      fullURL: redactedUrl,
      response: {
        statusCode: fetchResponse.status,
        statusText: fetchResponse.statusText || '',
        data: redactedResponseData,
      },
      request: {
        baseUri: url.host,
        path: this.redactUrlQueryParams(url.pathname),
        method: fetchRequest?.method ?? '',
        data: redactedRequestData ?? '',
      },
    }
  }
}
