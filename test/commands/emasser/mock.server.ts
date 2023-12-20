import {Configuration} from '@mitre/emass_client/dist/configuration'
import globalAxios, {AxiosInstance, AxiosRequestConfig} from 'axios'
import FormData from 'form-data'
import https from 'https'

export class InitMockServer {
  public axiosInstances: AxiosInstance
  readonly axiosRequestConfig: AxiosRequestConfig
  public basePath: Configuration['basePath']
  public configuration: Configuration

  constructor() {
    this.configuration = new Configuration({
      baseOptions: {},
      basePath: 'https://stoplight.io/mocks/mitre/emasser/32836028',
      formDataCtor: FormData,
    })

    this.axiosRequestConfig = {
      httpsAgent: new https.Agent({
        keepAlive: true,
        port: 443,
        rejectUnauthorized: false,
      }),
    }

    this.axiosInstances = globalAxios.create(this.axiosRequestConfig)
    this.axiosInstances.defaults.headers.common = {
      'api-key': 123,
      'user-uid': 321,
    }
  }
}
