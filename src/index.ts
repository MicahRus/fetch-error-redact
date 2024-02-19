import { HttpErrorResponse } from "./types"

export const redactedKeyword = '<REDACTED>'

const queryParamsRegex = /(?<=\?|#)\S+/ig
const pathParamsRegex = /(\?|#)\S+/ig

export class FetchRedactor {
  redactRequestData: boolean
  redactResponseData: boolean
  redactQueryData: boolean

  constructor(redactRequestData = true, redactResponseData = true, redactQueryData = true) {
    this.redactQueryData = redactQueryData
    this.redactRequestData = redactRequestData
    this.redactResponseData = redactResponseData
  }

    private redactUrlQueryParams(url: string | undefined): string {
    if (!url)
      return ''

    return this.redactQueryData ? url.replace(queryParamsRegex, redactedKeyword) : url
  }

  private redactError(error: AxiosError | null | undefined): (HttpErrorResponse | null | undefined | Error) {
    if (!error || !error.isAxiosError)
      return error

    const baseURL = this.redactUrlQueryParams(error.config?.baseURL)
    const path = this.redactUrlQueryParams(error.config?.url)
    const queryPath = extractQueryPath(path) ? '' : extractQueryPath(error.request?.path)
    const fullURL = this.redactUrlQueryParams(joinURL(baseURL, path, queryPath))

    return {
      fullURL,
      message: error.message,
      response: {
        statusCode: error.response?.status,
        statusMessage: error.response?.statusText || '',
        data: redactData(error.response?.data, this.redactResponseData),
      },
      request: {
        baseURL,
        path,
        method: error.config?.method || '',
        data: redactData(error.config?.data, this.redactRequestData),
      },
    }
  }
}
