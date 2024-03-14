import {redactedKeyword} from '.'

function parseData(input: string): any {
  try {
    return JSON.parse(input)
  } catch {
    return
  }
}

export function redactData(data: any, shouldRedactData: boolean): any {
  if (!data)
    return data

  if (typeof data === 'object') {
    if (Array.isArray(data))
      return data.map(value => redactData(value, shouldRedactData))

    return Object.fromEntries(Object.entries(data).map(([key, value])=> [key, redactData(value, shouldRedactData)]))
  }

  const parsedData = parseData(data)

  if (parsedData && typeof parsedData === 'object')
    return redactData(parsedData, shouldRedactData)


  return shouldRedactData ? redactedKeyword : data
}
