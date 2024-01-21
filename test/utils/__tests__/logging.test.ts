import { createWinstonLogger } from '../../../src/utils/logging';

jest.mock('winston', () => {
  const mFormat = {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
  };
  const mTransports = {
    File: jest.fn(),
    Console: jest.fn(),
  };
  return {
    createLogger: jest.fn().mockReturnValue({
      format: mFormat,
      transports: [new mTransports.File(), new mTransports.Console()],
    }),
    format: mFormat,
    transports: mTransports,
  };
});

describe('createWinstonLogger', () => {
  it('should create a logger with the correct configuration', () => {
    const winston = require('winston');
    createWinstonLogger('testMapper', 'info');

    expect(winston.createLogger).toHaveBeenCalledWith({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(expect.any(Function))
      ),
      level: 'info',
      transports: expect.arrayContaining([
        new winston.transports.File({ filename: 'testMapper.log' }),
        new winston.transports.Console(),
      ]),
    });
  });
});