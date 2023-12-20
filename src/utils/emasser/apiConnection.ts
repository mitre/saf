import {Configuration} from '@mitre/emass_client/dist/configuration'
import {AxiosInstance} from '@mitre/emass_client/node_modules/axios'

import {ApiConfig} from './apiConfig'
import {InitConnections} from './initConnection'

export class ApiConnection {
  public axiosInstances: AxiosInstance
  public basePath: Configuration['basePath']
  public configuration: Configuration

  constructor() {
    const conf = new ApiConfig()
    const init = new InitConnections(conf)

    this.configuration = init.configuration
    this.basePath = init.configuration.basePath
    this.axiosInstances = init.axiosInstances
  }
}
