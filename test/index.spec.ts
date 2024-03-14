import {generateFetchMock} from './testHelper'
import {FetchRedactor, redactedKeyword} from '../src/index'
import {HttpErrorResponse} from '../src/types'

const redactor = new FetchRedactor()

describe('Fetch response is not ok', ()=> {
  let fetchSpy: jest.SpyInstance<Promise<Response>>

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  const method = 'GET'
  const status = 404
  const statusText = 'Not Found'
  const path = '/request-url'
  const baseUri = 'example.com'
  const baseUrl = `https://${baseUri}${path}`

  const stubResponse = {
    topLevelStub1: 5,
    topLevelStub2: 'stub-2',
    stubObject: {
      stub1: 1,
      stub2: 'stub-2',
    },
  }

  const redactedStubResponse = {
    topLevelStub1: redactedKeyword,
    topLevelStub2: redactedKeyword,
    stubObject: {
      stub1: redactedKeyword,
      stub2: redactedKeyword,
    },
  }

  it('Should return details for invalid request', async () => {
    const url = `http://${baseUri}${path}`

    const mock = generateFetchMock(stubResponse, false, {url, method, status})
    fetchSpy.mockImplementation(mock)

    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      request: {
        baseUri: baseUri,
        data: '',
        method: '',
        path,
      },
      response: {
        data: redactedStubResponse,
        statusText: '',
        statusCode: status,
      },
    }

    const response = await fetch(url, {method})
    const redactedResponse = await redactor.redactError(response)

    expect(redactedResponse).toStrictEqual(expectedResponse)
  })

  it('Should redact details in query params of path', async () => {
    const params = '?secret=mySecret'
    const url = `http://${baseUri}${path}`

    const mock = generateFetchMock(stubResponse, false, {url: `${url}${params}`, method, status, statusText})
    fetchSpy.mockImplementation(mock)
    const expectedResponse: HttpErrorResponse = {
      fullURL: `${url}?${redactedKeyword}`,
      response: {
        statusCode: status,
        statusText: statusText,
        data: redactedStubResponse,
      },
      request: {
        baseUri: baseUri,
        path,
        method: '',
        data: '',
      },
    }

    const response = await fetch(`${url}${params}`, {method})

    const redactedResponse = await redactor.redactError(response)
    expect(redactedResponse).toStrictEqual(expectedResponse)
  })

  it('Should redact details in fragment params of path', async () => {
    const url = `${baseUrl}#mySecret`
    const mock = generateFetchMock('stub-response', false, {url, method, status, statusText})
    fetchSpy.mockImplementation(mock)

    const response = await fetch(`${url}`)
    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseUrl}#${redactedKeyword}`,
      response: {
        statusCode: status,
        statusText,
        data: redactedKeyword,
      },
      request: {
        baseUri: baseUri,
        path,
        method: '',
        data: '',
      },
    }

    const redactedResponse = await redactor.redactError(response)
    expect(redactedResponse).toStrictEqual(expectedResponse)
  })

  it('Should skip redact details in query params if configured', async () => {
    const url = `${baseUrl}?secret=mySecret`
    const mock = generateFetchMock('stub-data', false, {url, method, status, statusText})
    fetchSpy.mockImplementation(mock)
    const redactor2 = new FetchRedactor().skipQueryData()
    const response = await fetch(url)
    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      response: {
        statusCode: status,
        statusText,
        data: redactedKeyword,
      },
      request: {
        baseUri: baseUri,
        path,
        method: '',
        data: '',
      },
    }

    const redactedResponse = await redactor2.redactError(response)
    expect(redactedResponse).toStrictEqual(expectedResponse)
  })

  it('Should redact request data', async () => {
    const body = JSON.stringify({foo: {bar: 'my-secret'}})
    const mock = generateFetchMock(redactedKeyword, false, {url: baseUrl, method: 'POST', status, statusText})
    fetchSpy.mockImplementation(mock)

    const request: Request = new Request(baseUrl, {body, method: 'POST'})
    const response = await fetch(request)

    const expectedResponse: HttpErrorResponse = {
      fullURL: baseUrl,
      response: {
        statusCode: status,
        statusText,
        data: redactedKeyword,
      },
      request: {
        baseUri: baseUri,
        path,
        method: 'POST',
        data: {
          foo: {
            bar: redactedKeyword,
          },
        },
      },
    }

    const redactedResponse = await redactor.redactError(response, request)
    expect(redactedResponse).toStrictEqual(expectedResponse)
  })

  it('Should redact request data, with null value', async () => {
    const body = JSON.stringify({foo: {bar: 'my-secret', test: null}})
    const mock = generateFetchMock(redactedKeyword, false, {url: baseUrl, method: 'POST', status, statusText})
    fetchSpy.mockImplementation(mock)

    const request: Request = new Request(baseUrl, {body, method: 'POST'})
    const response = await fetch(request)

    const expectedResponse: HttpErrorResponse = {
      fullURL: baseUrl,
      response: {
        statusCode: status,
        statusText,
        data: redactedKeyword,
      },
      request: {
        baseUri: baseUri,
        path,
        method: 'POST',
        data: {
          foo: {
            bar: redactedKeyword,
            test: null,
          },
        },
      },
    }

    const redactedResponse = await redactor.redactError(response, request)
    expect(redactedResponse).toStrictEqual(expectedResponse)
  })

  it('Should redact request data, array of values', async () => {
    const body = JSON.stringify([{foo: 'foo'}, {bar: 1}])
    const mock = generateFetchMock(redactedKeyword, false, {url: baseUrl, method: 'POST', status, statusText})
    fetchSpy.mockImplementation(mock)

    const request: Request = new Request(baseUrl, {body, method: 'POST'})
    const response = await fetch(request)
    const expectedResponse: HttpErrorResponse = {
      fullURL: baseUrl,

      response: {
        statusCode: status,
        statusText,
        data: redactedKeyword,
      },
      request: {
        baseUri: baseUri,
        path,
        method: 'POST',
        data: [
          {
            foo: redactedKeyword,
          },
          {
            bar: redactedKeyword,
          },
        ],
      },
    }

    const redactedResponse = await redactor.redactError(response, request)
    expect(redactedResponse).toStrictEqual(expectedResponse)
  })
})

describe('Valid Remote URL', () => {
  const baseUri = 'reqres.in'
  const baseUrl = `https://${baseUri}`

  it('Should return details for not found response', async () => {
    const path = '/api/users/23'
    const url = `${baseUrl}${path}`
    const method = 'GET'

    const request: Request = new Request(url, {method})
    const response = await fetch(request)

    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      response: {
        statusCode: 404,
        statusText: 'Not Found',
        data: {},
      },
      request: {
        baseUri: baseUri,
        path,
        method,
        data: '',
      },
    }

    const redactedResponse = await redactor.redactError(response, request)
    expect(redactedResponse).toStrictEqual(expectedResponse)
  })

  it('Should return details for bad request response', async () => {
    const path = '/register'
    const url = `${baseUrl}${path}`
    const body = JSON.stringify({email: 'sydney@fife'})
    const method = 'POST'

    const request: Request = new Request(url, {body, method})
    const response = await fetch(request)

    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      response: {
        statusCode: 404,
        statusText: 'Not Found',
        data: '',
      },
      request: {
        baseUri,
        path,
        method,
        data: '',
      },
    }

    const redactedResponse = await redactor.redactError(response, request)
    expect(redactedResponse).toStrictEqual(expectedResponse)
  })

  //   it('Should skip redact details in response data if configured', async () => {
  //     const url = 'register'
  //     const redactor2 = new FetchRedactor().skipResponseData()
  //     const response = await instance.post(url, {email: 'sydney@fife'}).catch(e => redactor2.redactError(e))

  //     const expectedResponse: HttpErrorResponse = {
  //       fullURL: `${baseURL}/${url}`,
  //       message: 'Request failed with status code 400',
  //       response: {
  //         statusCode: 400,
  //         statusText: 'Bad Request',
  //         data: {
  //           error: 'Missing password',
  //         },
  //       },
  //       request: {
  //         baseURL,
  //         path,
  //         method: 'post',
  //         data: {
  //           email: redactedKeyword,
  //         },
  //       },
  //     }
  //     expect(response).to.deep.equal(expectedResponse)
  //   })

  //   it('Should skip redact details in request data if configured', async () => {
  //     const url = 'register'
  //     const payload = {email: 'sydney@fife'}
  //     const redactor2 = new FetchRedactor().skipRequestData()
  //     const response = await instance.post(url, payload).catch(e => redactor2.redactError(e))

  //     const expectedResponse: HttpErrorResponse = {
  //       fullURL: `${baseURL}/${url}`,
  //       message: 'Request failed with status code 400',
  //       response: {
  //         statusCode: 400,
  //         statusText: 'Bad Request',
  //         data: {
  //           error: redactedKeyword,
  //         },
  //       },
  //       request: {
  //         baseURL,
  //         path,
  //         method: 'post',
  //         data: payload,
  //       },
  //     }
  //     expect(response).to.deep.equal(expectedResponse)
  //   })

  //   it('Should skip redact details in request and response data if configured', async () => {
  //     const url = 'register'
  //     const payload = {email: 'sydney@fife'}
  //     const redactor2 = new FetchRedactor().skipRequestData().skipResponseData()
  //     const response = await instance.post(url, payload).catch(e => redactor2.redactError(e))

  //     const expectedResponse: HttpErrorResponse = {
  //       fullURL: `${baseURL}/${url}`,
  //       message: 'Request failed with status code 400',
  //       response: {
  //         statusCode: 400,
  //         statusText: 'Bad Request',
  //         data: {
  //           error: 'Missing password',
  //         },
  //       },
  //       request: {
  //         baseURL,
  //         path,
  //         method: 'post',
  //         data: payload,
  //       },
  //     }
  //     expect(response).to.deep.equal(expectedResponse)
  //   })
  // })

  // describe('Simple interceptor', () => {
  //   const baseURL = 'https://reqres.in/api'
  //   const instance = axios.create({baseURL})
  //   instance.interceptors.response.use(undefined, getErrorInterceptor())

  //   it('Should return details for bad request response', async () => {
  //     const url = 'register'
  //     const response = await instance.post(url, {email: 'sydney@fife'}).catch(e => e)

//     const expectedResponse: HttpErrorResponse = {
//       fullURL: `${baseURL}/${url}`,
//       message: 'Request failed with status code 400',
//       response: {
//         statusCode: 400,
//         statusText: 'Bad Request',
//         data: {
//           error: redactedKeyword,
//         },
//       },
//       request: {
//         baseURL,
//         path,
//         method: 'post',
//         data: {
//           email: redactedKeyword,
//         },
//       },
//     }
//     expect(response).to.deep.equal(expectedResponse)
//   })
})
