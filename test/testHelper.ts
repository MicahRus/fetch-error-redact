export let fetchSpy: jest.SpyInstance<Promise<Response>>

beforeEach(() => {
  fetchSpy = jest.spyOn(global, 'fetch')
})

afterEach(() => {
  jest.restoreAllMocks()
})

export function generateFetchMock(response: any, isOk = true, additionalParams?: Record<any, any>) {
  return jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(response),
      ok: isOk,
      ...additionalParams,
    }),
  ) as jest.Mock
}
