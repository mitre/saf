declare module '@mitre/splunk-sdk-no-env' {
    export type SplunkConfig = {
      app?: string;
      autologin?: boolean;
      host: string;
      index: string;
      insecure?: boolean;
      owner?: string;
      password?: string;
      port?: number;
      scheme: string;
      sessionKey?: string;
      username?: string;
      version?: string;
    };

    export type jobTrackCallbacks = {
      done?: (job: Job) => void;
      error?: (err: any) => void;
      failed?: (job: Job) => void;
      progress?: (job: Job) => void;
      ready?: (job: Job) => void;
    };

    class Http {
      constructor();
    }

    class Logger {
      error(message: any): void;
    }

    class Indexs {
      fetch(callback: (error: any, success: any, indexes: Index[]) => void): void;
    }

    class Index {
      name: string

      submitEvent(
        event: string,
        config: {index: string; sourcetype: string},
        callback: (error: any) => void
      ): void;
    }

    class Jobs {
      create(
        query: string,
        params: unknown,
        callback: (error: any, createdJob: Job) => void
      ): void;

      fetch(callback: (error: any, success: any, jobs: Job[]) => void): void;
    }

    class Job {
      results(
        params: {count: number},
        callback: (
          err: any,
          results: {fields: string[]; rows: string[]},
          job: Job
        ) => void
      ): void;

      track(
        options: {period?: number},
        callbacks: ((readyStatus: any) => void) | jobTrackCallbacks
      ): void;
    }

    class Service {
      requestOptions: {
        strictSSL: boolean;
      }

      constructor(config: SplunkConfig);

      constructor(httpInstance: any, config: SplunkConfig);
      indexes(): Indexs;
      jobs(): Jobs;

      login(callback: (error: any, success: any) => void): boolean;
    }
  }

  declare module '@mitre/splunk-sdk-no-env/lib/platform/client/jquery_http';

