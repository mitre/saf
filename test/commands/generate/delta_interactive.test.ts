import { input, confirm, select } from '@inquirer/prompts';
import fileSelector from 'inquirer-file-selector';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GenerateDelta from '../../../src/commands/generate/delta';

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
  input: vi.fn(),
  select: vi.fn(),
}));

vi.mock('inquirer-file-selector', () => ({
  default: vi.fn(),
}));

vi.mock('chalk', () => ({
  default: {
    blueBright: String,
    green: String,
    yellow: String,
  },
}));

type LoggerStub = {
  debug: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
};

type TestableGenerateDelta = {
  getFlags: () => Promise<Record<string, unknown>>;
  logger: LoggerStub;
};

const confirmMock = vi.mocked(confirm);
const fileSelectorMock = vi.mocked(fileSelector);
const inputMock = vi.mocked(input);
const selectMock = vi.mocked(select);

const logger: LoggerStub = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
};

function createCommand(): TestableGenerateDelta {
  const command = Object.create(GenerateDelta.prototype) as TestableGenerateDelta;
  command.logger = logger;
  return command;
}

function shiftPromptValue<T>(values: T[], promptType: string): T {
  const value = values.shift();
  if (value === undefined) {
    throw new Error(`No mocked ${promptType} value available`);
  }

  return value;
}

function mockPromptFlow({
  confirms,
  files,
  inputs,
  selects,
}: {
  confirms: boolean[];
  files: string[];
  inputs: string[];
  selects: string[];
}) {
  confirmMock.mockImplementation(() => Promise.resolve(shiftPromptValue(confirms, 'confirm')));
  fileSelectorMock.mockImplementation(() => Promise.resolve(shiftPromptValue(files, 'file selector')));
  inputMock.mockImplementation(() => Promise.resolve(shiftPromptValue(inputs, 'input')));
  selectMock.mockImplementation(() => Promise.resolve(shiftPromptValue(selects, 'select')));
}

function inputMessages(): string[] {
  return inputMock.mock.calls.map(([question]) => question.message);
}

describe.sequential('Test generate delta interactive prompt flow', () => {
  beforeEach(() => {
    confirmMock.mockReset();
    fileSelectorMock.mockReset();
    inputMock.mockReset();
    selectMock.mockReset();

    logger.debug.mockReset();
    logger.error.mockReset();
    logger.info.mockReset();
    logger.warn.mockReset();
  });

  it('should prompt for the inspec path when using an existing profile summary with fuzzy mapping', async () => {
    mockPromptFlow({
      confirms: [true, false, false],
      files: ['/tmp/profile.json', '/tmp/profile/controls', '/tmp/delta-output'],
      inputs: ['https://example.test/stig.zip', 'cinc-auditor'],
      selects: ['url', 'no', 'rule', 'info'],
    });

    const flags = await createCommand().getFlags();

    expect(flags).toMatchObject({
      controlsDir: '/tmp/profile/controls',
      deltaOutputDir: '/tmp/delta-output',
      idType: 'rule',
      inspecJsonFile: '/tmp/profile.json',
      inspecPath: 'cinc-auditor',
      logLevel: 'info',
      runMapControls: true,
      xccdfTye: 'url',
      xccdfUrl: 'https://example.test/stig.zip',
    });
    expect(inputMessages()).toContain('Provide the absolute or known relative path to the inspec or cinc-auditor executable:');
  });

  it('should not prompt for the inspec path when using an existing profile summary without fuzzy mapping', async () => {
    mockPromptFlow({
      confirms: [false, false, false],
      files: ['/tmp/profile.json', '/tmp/delta-output'],
      inputs: ['https://example.test/stig.zip'],
      selects: ['url', 'no', 'group', 'warn'],
    });

    const flags = await createCommand().getFlags();

    expect(flags).toMatchObject({
      deltaOutputDir: '/tmp/delta-output',
      idType: 'group',
      inspecJsonFile: '/tmp/profile.json',
      logLevel: 'warn',
      runMapControls: false,
      xccdfTye: 'url',
      xccdfUrl: 'https://example.test/stig.zip',
    });
    expect(flags).not.toHaveProperty('controlsDir');
    expect(flags).not.toHaveProperty('inspecPath');
    expect(inputMessages()).not.toContain('Provide the absolute or known relative path to the inspec or cinc-auditor executable:');
  });

  it('should prompt for the inspec path when auto-generating the profile summary without fuzzy mapping', async () => {
    mockPromptFlow({
      confirms: [false, false, false],
      files: ['/tmp/profile/controls', '/tmp/delta-output'],
      inputs: ['https://example.test/stig.zip', '/opt/cinc-auditor/bin/cinc-auditor'],
      selects: ['url', 'yes', 'version', 'debug'],
    });

    const flags = await createCommand().getFlags();

    expect(flags).toMatchObject({
      controlsDir: '/tmp/profile/controls',
      deltaOutputDir: '/tmp/delta-output',
      idType: 'version',
      inspecJsonFile: '',
      inspecPath: '/opt/cinc-auditor/bin/cinc-auditor',
      logLevel: 'debug',
      runMapControls: false,
      xccdfTye: 'url',
      xccdfUrl: 'https://example.test/stig.zip',
    });
    expect(inputMessages()).toContain('Provide the absolute or known relative path to the inspec or cinc-auditor executable:');
  });
});
