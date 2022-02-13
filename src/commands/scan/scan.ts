import {Command, flags} from '@oclif/command'
import got from 'got-cjs'
import ws from 'ws'

export default class Scan extends Command {
  static aliases = ['scan']

  static description = 'Visit https://saf.mitre.org/#/validate to explore and run inspec profiles'

  static flags = {
    help: flags.help({char: 'h'}),
    profile: flags.integer({char: 'p', description: 'ID of the profile you would like to run'}),
    targetURL: flags.string({char: 't', description: 'Standard target URI (e.g ssh://root:password@192.168.1.1)'}),
    method: flags.string({char: 'm', default: 'ssh', options: ['ssh', 'winrm'], description: 'Transport method to evaluate profiles'}),
    host: flags.string({char: 'H', description: 'Target host to scan'}),
    username: flags.string({char: 'u', description: 'Username to authenticate with', required: false}),
    password: flags.string({char: 'P', description: 'Password to authenticate with', required: false}),
    output: flags.string({char: 'o', description: 'Output HDF file', default: 'output.json'})
  }

  async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'DELETE', data?: Record<string, unknown>): any {
    const request = got(`unix:/var/run/docker.sock:${endpoint}`, {
      method: method,
      json: data,
      throwHttpErrors: false
    })

    return request.json()
  }

  async getProfiles() {
    return got.get('https://raw.githubusercontent.com/mitre/mitre-saf/master/src/assets/data/baselines.json').json().then((profiles: any) => {
      const mappedProfiles: Record<string, string> = {}
      profiles.baselines.forEach((profile: any) => {
        if (profile.link) {
          mappedProfiles[profile.shortName] = profile.link
        }
      })
      return mappedProfiles
    })
  }

  async handleContainerWebsocketConnection(id: string) {
    return new Promise((resolve, reject) => {
      const client = new ws(`ws+unix:///var/run/docker.sock:/containers/${id}/attach/ws?stream=1&stdout=1&stdin=1&logs=1`)

      client.on('open', () => {
        console.log(`Connected to container ${id}`)
      })

      client.on('message', (data: Buffer) => {
        console.log(data.toString())
      })

      client.on('error', error => {
        reject(error)
      })

      client.on('close', () => {
        resolve(id)
      })
    })
    
  }

  async createContainer(image: string, args: string[]): Promise<string> {
    return this.makeRequest('/containers/create', 'POST', {
      Image: image,
      Cmd: args,
      HostConfig: {
        Binds: [
          `${process.cwd()}:/share`
        ]
      }
    }).then((fulfilment: {Id: string}) => {
      console.log(`Created container ${fulfilment.Id}`)
      return fulfilment.Id
    })
  }

  async deleteContainer(id: string) {
    return this.makeRequest(`/containers/${id}`, 'DELETE').then(() => {
      console.log(`Deleted container ${id}`)
    })
  }

  async getContainerInfo(id: string) {
    return this.makeRequest(`/v1.24/containers/${id}/json`, 'GET')
  }

  async startContainer(id: string) {
    return this.makeRequest(`/containers/${id}/start`, 'POST').then(() => {
      console.log(`Started container ${id}`)
    })
  }

  buildTargetURL(method: string, host: string, username: string, password: string) {
    if (method === 'ssh') {
      return ['--target', `${method}://${username}:${password}@${host}`]
    } else if (method === 'winrm') {
      return ['--backend', 'winrm', '--user', username, '--password', password, '--host', host]
    } else {
       throw new Error("Invalid transport method")
     }
  }

  async run() {
    const {flags} = this.parse(Scan)

    if (process.getuid() !== 0) {
      throw new Error('Please run this command as root so SAF can communicate with the Docker interface')
    }

    const availableProfiles = Object.entries(await this.getProfiles())

    if (flags.profile) {
      const profile = availableProfiles[flags.profile - 1]
      if (profile) {
        const [name, url] = profile
        console.log(`Selected profile ${name} (${url})`)
        // Create a CINC Auditor container
        let containerId;
        if(flags.targetURL) {
          containerId = await this.createContainer('cincproject/auditor',
            ["exec", url, "--log-level", "debug", "--reporter", `json:${flags.output}`, "--target", flags.targetURL]
          )
        } else if (flags.method && flags.host && flags.username && flags.password) {
          containerId = await this.createContainer('cincproject/auditor',
            ["exec", url, "--log-level", "debug", "--reporter", `json:${flags.output}`, ...this.buildTargetURL(flags.method, flags.host, flags.username, flags.password)]
          )
        } else {
          throw new Error("Please provide a target url (--target) or use --method, --host, --username, and --password ")
        }    
        // Start the container
        await this.startContainer(containerId)
        // Get the logs from the container
        await this.handleContainerWebsocketConnection(containerId)
        // Delete the container
        await this.deleteContainer(containerId)
      } else {
        console.error(`Invalid profile selected, please choose a number 1-${availableProfiles.length - 2}`)
      }
    } else {
      availableProfiles.forEach(([shortName, url], index) => {
        console.log(`${index + 1}) ${shortName}`)
      })

      return console.log('No profile selected, please choose one of the profiles shown above.')
    }
  }
}

