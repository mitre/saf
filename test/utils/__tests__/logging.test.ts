import { describe, expect, it, vi } from 'vitest';
import * as winston from 'winston';
import { createWinstonLogger } from '../../../src/utils/logging';

vi.mock('winston', { spy: true });

describe('createWinstonLogger', () => {
  it('should create a logger with the correct configuration', () => {
    createWinstonLogger('testMapper', 'info');

    expect(winston.createLogger).toHaveBeenCalledTimes(1);
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining(
        {
          level: 'info',
          levels: {
            error: 0,
            warn: 1,
            info: 2,
            http: 3,
            verbose: 4,
            debug: 5,
            silly: 6,
          },
          transports: expect.arrayContaining([
            expect.objectContaining({
              filename: 'saf-cli.log',
            }),
            expect.any(winston.transports.File),
          ]),
        },
      ),
    );
  });
});
