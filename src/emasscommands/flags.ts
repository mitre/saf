import * as emasser from '@mitre/emass_client'
import _ from 'lodash'

export function getFlags(requestType: string): {name: string}[] {
  const flags: string[] = []

  Object.entries(emasser).forEach(([key, value]: [string, any]) => {
    if (typeof emasser[key] === 'function' && key.includes('Creator')) {
      const result = emasser[key]()
      //console.log(result)

      if (result) {
        Object.keys(result).forEach((subKey: string) => {
          // subkey is the API specification endpoint operationId (i.e. addArtifactsBySystemId)
          // Split the CamelCase operationId and map it to an array
          const splitKeys = subKey.split(/(?=[A-Z])/).map(key => key.toLowerCase())
          
          if (!splitKeys.includes('enum') && splitKeys.includes(requestType)) {
            if (splitKeys.length == 2) {
              flags.push(splitKeys[1])
            } else if (splitKeys.length == 3) {
              if (splitKeys.includes('system')) {
                flags.push(splitKeys[2])
              } else {
                flags.push(splitKeys[1] + ' ' + splitKeys[2])
              }
            } else if (splitKeys.length == 4) {
              if (splitKeys.includes('system')) {
                flags.push(splitKeys[2] + ' ' + splitKeys[3])
              } else {
                flags.push(splitKeys[1] + ' ' + splitKeys[2] + ' ' + splitKeys[3])
              }
            } else if (splitKeys.includes('by')) {
              //console.log('by: ', splitKeys)
              //console.log('by: ', splitKeys.indexOf('by'))
              if (splitKeys.indexOf('by') == 3) {
                if (splitKeys.includes('system')) {
                  flags.push(splitKeys[2])
                } else {
                  flags.push(splitKeys[2] + ' ' + splitKeys[3])
                }
              } else if (splitKeys.indexOf('by') == 4) {
                if (splitKeys.includes('system')) {
                  flags.push(splitKeys[2] + ' ' + splitKeys[3])
                } else {
                  flags.push(splitKeys[1] + ' ' + splitKeys[2] + ' ' + splitKeys[3])
                }
              }
            } else {
              flags.push(splitKeys.toLocaleString())
            }
            
          }
        })
      }
    }
  })
  console.log(_.uniq(flags))
  //return _.uniq(flags).map(flag => ({name: flag}))
  return [{name: 'system'}]
}

export function getFlagsForEndpoint(argv: string[]) {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post'))
  const requestType = argv[requestTypeIndex]
  const endpoint = argv[requestTypeIndex + 1]

  console.log('requestTypeIndex: ', requestTypeIndex)
  console.log('requestType: ', requestType)
  console.log('endpoint: ', endpoint)

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

  // console.log(commands)

  if (requestType === 'get' && endpoint === 'artifacts') {
    return {
      forSystem: {char: 's', description: 'System ID to get artifacts from'},
    }
  }

  return {}
}
