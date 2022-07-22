import * as emasser from '@mitre/emass_client'
import _ from 'lodash'
import {Flags} from "@oclif/core"

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
  //console.log(_.uniq(flags))
  return _.uniq(flags).map(flag => ({name: flag}))
  //return [{name: 'system'}]
}


export function getFlagsForEndpoint(argv: string[]) {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post'))
  const requestType = argv[requestTypeIndex]
  const endpoint = argv[requestTypeIndex + 1]
  const argument = argv[requestTypeIndex + 2]

  // console.log('requestTypeIndex: ', requestTypeIndex)
  // console.log('requestType: ', requestType)
  // console.log('endpoint: ', endpoint)
  // console.log('argument: ', argument)

  const commands: Record<string, string[]> = {
    get: [],
    post: [],
    delete: [],
    put: [],
  }

  Object.entries(emasser).forEach(([key, value]: [string, any]) => {

    if (typeof emasser[key] === 'function' && key.includes('Creator')) {
      const result = emasser[key]()
    // console.log('key: ', key)
    // console.log('emasser[key]: ', emasser[key])
      if (result) {
        Object.keys(result).forEach((subKey: string) => {
          //console.log('subKey: ', subKey)
          const splitKeys = new Set(subKey.split(/(?=[A-Z])/).map(key => key.toLowerCase()))
          //console.log('splitKeys: ', splitKeys)
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

  //console.log('commands are: ', commands[requestType]);
  
  //return commands[requestType]; //commands[requestType].toString
  if (requestType === 'get' && endpoint === 'roles'&& argument === 'byCategory') {
    return {
      roleCategory: Flags.string({char: "c", description: "Filter on role category", options: ['CAC','PAC','Other'], required: true}),
      role: Flags.string({char: "r", description: "Filter on role type", 
       options: ['AO','Auditor','Artifact Manager','C&A Team', 'IAO','ISSO', 'PM/IAM', 'SCA', 'User Rep', 'Validator'], required: true}),
      policy: Flags.string({char: "p", description: "Filter on policy", required: false, options: ['diacap','rmf','reporting']}),
      includeDecommissioned: Flags.boolean({char: "d", description: "Boolean - include decommissioned systems", required: false}),

    }
  }

  return {}
}


// My supporting methods
export function getEndpointCommand(argv: string[]) {
  const requestTypeIndex =  argv.findIndex(arg => (arg === 'get' || arg === 'post' || arg === 'update' || arg === 'delete'))
  return argv[requestTypeIndex]
}

export function getCommandsForEndpoint(argv: string[]): string[] {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post'))
  const requestType = argv[requestTypeIndex]

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
          const splitKeys = subKey.split(/(?=[A-Z])/).map(key => key.toLowerCase())
          if (!splitKeys.includes('enum')) {
            if (splitKeys.includes('get')) {
              commands.get.push(parseCommand(splitKeys))
            } else if (splitKeys.includes('add')) {
              commands.post.push(parseCommand(splitKeys))
            } else if (splitKeys.includes('delete')) {
              commands.delete.push(parseCommand(splitKeys))
            } else if (splitKeys.includes('update')) {
              commands.put.push(parseCommand(splitKeys))
            }
          }
        })
      }
    }
  })

  return _.uniq(commands[requestType]); 

}

function parseCommand(cmd: string[]): string {
  let command = '';
  if (cmd.length == 2) {
    command = cmd[1]
  } else if (cmd.length == 3) {
    if (cmd.includes('system')) {
      command = cmd[2]
    } else {
      command = cmd[1] + ' ' + cmd[2]
    }
  } else if (cmd.length == 4) {
    if (cmd.includes('system')) {
      command = cmd[2] + ' ' + cmd[3]
    } else {
      command = cmd[1] + ' ' + cmd[2] + ' ' + cmd[3]
    }
  } else if (cmd.includes('by')) {
    if (cmd.indexOf('by') == 3) {
      if (cmd.includes('system')) {
        command = cmd[2]
      } else {
        command = cmd[2] + ' ' + cmd[3]
      }
    } else if (cmd.indexOf('by') == 4) {
      if (cmd.includes('system')) {
        command = cmd[2] + ' ' + cmd[3]
      } else {
        command = cmd[1] + ' ' + cmd[2] + ' ' + cmd[3]
      }
    }
  } else {
    command = cmd.toLocaleString()
  }  

  return command;
}
