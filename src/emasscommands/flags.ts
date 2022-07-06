import * as emasser from '@mitre/emass_client'

export function getFlagsForEndpoint(argv: string[]) {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post'))
  const requestType = argv[requestTypeIndex]
  const endpoint = argv[requestTypeIndex + 1]

  console.log(Object.keys(emasser))

  if (requestType === 'get' && endpoint === 'artifacts') {
    return {
      forSystem: {char: 's', description: 'System ID to get artifacts from'},
    }
  }

  return {}
}
