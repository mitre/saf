import * as emasser from '@mitre/emass_client'
import _ from 'lodash'

export function getFlags(requestType: string): {name: string}[] {
  const flags: string[] = []

  Object.entries(emasser).forEach(([key, value]: [string, any]) => {
    if (typeof emasser[key] === 'function' && key.includes('Creator')) {
      const result = emasser[key]()

      if (result) {
        Object.keys(result).forEach((subKey: string) => {
          const splitKeys = subKey.split(/(?=[A-Z])/).map(key => key.toLowerCase())
          if (!splitKeys.includes('enum') && splitKeys.includes(requestType)) {
            flags.push(splitKeys[1])
          }
        })
      }
    }
  })

  return _.uniq(flags).map(flag => ({name: flag}))
}

export function getFlagsForEndpoint(argv: string[]) {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post'))
  const requestType = argv[requestTypeIndex]
  const endpoint = argv[requestTypeIndex + 1]

  const commands: Record<string, string[]> = {
    get: [],
    post: [],
    delete: [],
    put: [],
  }

  Object.entries(emasser).forEach(([key, value]: [string, any]) => {
    if (typeof emasser[key] === 'function' && key.includes('Creator')) {
      const result = emasser[key]()

      if (result) {
        Object.keys(result).forEach((subKey: string) => {
          const splitKeys = new Set(subKey.split(/(?=[A-Z])/).map(key => key.toLowerCase()))
          if (!splitKeys.has('enum')) {
            if (splitKeys.has('get')) {
              commands.get.push(subKey)
            } else if (splitKeys.has('add')) {
              commands.post.push(subKey)
            } else if (splitKeys.has('delete')) {
              commands.delete.push(subKey)
            } else if (splitKeys.has('update')) {
              commands.put.push(subKey)
            }
          }
        })
      }
    }
  })

  console.log(commands)

  if (requestType === 'get' && endpoint === 'artifacts') {
    return {
      forSystem: {char: 's', description: 'System ID to get artifacts from'},
    }
  }

  return {}
}
