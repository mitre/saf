import {Configuration} from "@mitre/emass_client/dist/configuration"
import {AxiosInstance} from 'axios'
import {ApiConfig} from './apiConfig';
import { InitConnections } from "./initConnection";

export class ApiConnection {
  public configuration: Configuration;
  public basePath: Configuration["basePath"];
  public axiosInstances: AxiosInstance
  
  constructor() {
    const conf = new ApiConfig();
    const init = new InitConnections(conf.url, conf.port, conf.keyCert, conf.clientCert, conf.apiPassPhrase,
      conf.apiKey, conf.userUid, conf.sslVerify, conf.reqCert);

    this.configuration = init.configuration;
    this.basePath = init.configuration.basePath;
    this.axiosInstances = init.axiosInstances;
  }
}