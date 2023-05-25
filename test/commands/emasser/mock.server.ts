import https from 'https'
import {Configuration} from '@mitre/emass_client/dist/configuration'
import globalAxios, {AxiosInstance, AxiosRequestConfig} from 'axios'
import FormData from 'form-data'

export class InitMockServer {
  private axiosRequestConfig: AxiosRequestConfig;
  public configuration: Configuration;
  public axiosInstances: AxiosInstance;
  public basePath: Configuration['basePath'];

  constructor() {
    this.configuration = new Configuration({
      basePath: 'https://stoplight.io/mocks/mitre/emasser/32836028',
      formDataCtor: FormData,
      baseOptions: {},
    })

    this.axiosRequestConfig = {
      httpsAgent: new https.Agent({
        keepAlive: true,
        rejectUnauthorized: false,
        port: 443,
      }),
    }

    this.axiosInstances = globalAxios.create(this.axiosRequestConfig)
    this.axiosInstances.defaults.headers.common = {
      'api-key': 123,
      'user-uid': 321,
    }
  }
}
