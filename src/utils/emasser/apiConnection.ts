import { Configuration } from '@mitre/emass_client/dist/configuration';
import { AxiosInstance } from 'axios';
import { ApiConfig } from './apiConfig';
import { InitConnections } from './initConnection';

/**
 * Class representing an API connection.
 *
 * @remarks
 * This class initializes the API connection using the provided configuration and axios instances.
 *
 * @example
 * ```typescript
 * const apiConnection = new ApiConnection();
 * console.log(apiConnection.configuration);
 * console.log(apiConnection.basePath);
 * console.log(apiConnection.axiosInstances);
 * ```
 */
export class ApiConnection {
  public configuration: Configuration;
  public basePath: Configuration['basePath'];
  public axiosInstances: AxiosInstance;

  constructor() {
    const conf = new ApiConfig();
    const init = new InitConnections(conf);

    this.configuration = init.configuration;
    this.basePath = init.configuration.basePath;
    this.axiosInstances = init.axiosInstances;
  }
}
