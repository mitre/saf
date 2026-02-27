import fs from 'fs';
import https from 'https';
import FormData from 'form-data';
import { ApiConfig } from './apiConfig';
import { Configuration } from '@mitre/emass_client/dist/configuration';
import globalAxios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Initializes and configures Axios instances for making HTTP requests.
 *
 * @class InitConnections
 *
 * @property {AxiosRequestConfig} axiosRequestConfig - The Axios request configuration.
 * @property {Configuration} configuration - The configuration for the API.
 * @property {AxiosInstance} axiosInstances - The Axios instance used for making HTTP requests.
 *
 * @constructor
 * @param {ApiConfig} conf - The API configuration object.
 *
 * @example
 * const apiConfig: ApiConfig = {
 *   url: 'https://api.example.com',
 *   reqCert: true,
 *   sslVerify: true,
 *   keyCert: '/path/to/keyCert',
 *   clientCert: '/path/to/clientCert',
 *   apiPassPhrase: 'yourPassPhrase',
 *   port: 443,
 *   apiKey: 'yourApiKey',
 *   userUid: 'yourUserUid',
 *   caCert: '/path/to/caCert'
 * };
 * const initConnections = new InitConnections(apiConfig);
 *
 * @remarks
 * This class handles the creation of an Axios instance with custom HTTPS agent settings.
 * It supports client certificate authentication and allows configuring SSL verification.
 */
export class InitConnections {
  private readonly axiosRequestConfig: AxiosRequestConfig;
  public configuration: Configuration;
  public axiosInstances: AxiosInstance;

  constructor(conf: ApiConfig) {
    this.configuration = new Configuration({
      basePath: conf.url,
      formDataCtor: FormData,
      baseOptions: {},
    });

    // keepAlive <boolean> Keep sockets around even when there are no outstanding requests,
    //   so they can be used for future requests without having to reestablish a TCP connection.
    //   Not to be confused with the keep-alive value of the Connection header.
    //   The Connection: keep-alive header is always sent when using an agent except when the Connection header
    //   is explicitly specified or when the keepAlive and maxSockets options are respectively set to false
    //   and Infinity, in which case Connection: close will be used. Default: false.
    // requestCert <boolean> true to specify whether a server should request a certificate from a connecting client. Only applies when isServer is true.
    // rejectUnauthorized <boolean> If not false a server automatically reject clients with invalid certificates. Only applies when isServer is true.

    this.axiosRequestConfig = conf.caCert === undefined
      ? {
        httpsAgent: new https.Agent({
          keepAlive: true,
          requestCert: conf.reqCert,
          rejectUnauthorized: conf.sslVerify,
          key: conf.keyCert ? fs.readFileSync(conf.keyCert) : undefined,
          cert: conf.clientCert ? fs.readFileSync(conf.clientCert) : undefined,
          passphrase: conf.apiPassPhrase,
          port: conf.port,
        }),
      }
      : {
        httpsAgent: new https.Agent({
          keepAlive: true,
          requestCert: conf.reqCert,
          rejectUnauthorized: conf.sslVerify,
          ca: fs.readFileSync(conf.caCert),
          passphrase: conf.apiPassPhrase,
          port: conf.port,
        }),
      };

    this.axiosInstances = globalAxios.create(this.axiosRequestConfig);
    this.axiosInstances.defaults.headers.common = {
      'api-key': conf.apiKey,
      'user-uid': conf.userUid,
    };
  }
}
