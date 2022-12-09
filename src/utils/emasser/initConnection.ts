import fs from 'fs'
import https from 'https'
import {Configuration} from '@mitre/emass_client/dist/configuration'
import globalAxios, {AxiosInstance, AxiosRequestConfig} from 'axios'
import FormData from 'form-data'
import {ApiConfig} from './apiConfig'

export class InitConnections {
  private axiosRequestConfig: AxiosRequestConfig;
  public configuration: Configuration;
  public axiosInstances: AxiosInstance

  constructor(conf: ApiConfig) {
    this.configuration = new Configuration({
      basePath: conf.url,
      formDataCtor: FormData,
      baseOptions: {},
    })

    // keepAlive <boolean> Keep sockets around even when there are no outstanding requests,
    //   so they can be used for future requests without having to reestablish a TCP connection.
    //   Not to be confused with the keep-alive value of the Connection header.
    //   The Connection: keep-alive header is always sent when using an agent except when the Connection header
    //   is explicitly specified or when the keepAlive and maxSockets options are respectively set to false
    //   and Infinity, in which case Connection: close will be used. Default: false.

    // requestCert <boolean> true to specify whether a server should request a certificate from a connecting client. Only applies when isServer is true.

    // rejectUnauthorized <boolean> If not false a server automatically reject clients with invalid certificates. Only applies when isServer is true.
    this.axiosRequestConfig = {
      httpsAgent: new https.Agent({
        keepAlive: true,
        requestCert: conf.reqCert,
        rejectUnauthorized: conf.sslVerify,
        key: fs.readFileSync(conf.keyCert),
        cert: fs.readFileSync(conf.clientCert),
        passphrase: conf.apiPassPhrase,
        port: conf.port,
      }),
    }

    this.axiosInstances =  globalAxios.create(this.axiosRequestConfig)
    this.axiosInstances.defaults.headers.common = {
      'api-key': conf.apiKey,
      'user-uid': conf.userUid,
    }
  }
}
