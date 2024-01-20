import {checkSuffix, checkInput, getProfileInfo, extractValueViaPathOrNumber, convertFullPathToFilename, dataURLtoU8Array, getDescription, arrayNeededPaths} from '../../../src/utils/global'
import {ExecJSON, ContextualizedEvaluation} from 'inspecjs'
import path from 'path'
import fs from 'fs'

const UTF8_ENCODING = 'utf8'

const test_files_path = './test/sample_data/HDF/input'

const fileNames = [
  'rhel-8_hardened.json',
  'triple_overlay_profile_example.json',
  'minimal_hdf.json',
]

const filePaths = fileNames.map(fileName => path.resolve(path.join(test_files_path, fileName)))

const [rhel8_hardened, triple_overlay_profile_example, minimal_hdf] = filePaths

function loadExpectedData(samplePath: string): ContextualizedEvaluation {
  const resolvedPath = path.resolve(samplePath)
  return JSON.parse(fs.readFileSync(resolvedPath, UTF8_ENCODING))
}

describe('checkSuffix', () => {
  it('should append .json if it is not present', () => {
    const result = checkSuffix('test')
    expect(result).toBe('test.json')
  })

  it('should not append .json if it is already present', () => {
    const result = checkSuffix('test.json')
    expect(result).toBe('test.json')
  })
})

describe('convertFullPathToFilename', () => {
  it('should return the filename from a full path', () => {
    const result = convertFullPathToFilename('/path/to/file.txt')
    expect(result).toBe('file.txt')
  })

  it('should return the last directory name if the path ends with a slash', () => {
    const result = convertFullPathToFilename('/path/to/')
    expect(result).toBe('to')
  })

  it('should handle paths with no slashes', () => {
    const result = convertFullPathToFilename('file.txt')
    expect(result).toBe('file.txt')
  })
})

describe('dataURLtoU8Array', () => {
  it('should convert a data URL to a Uint8Array', () => {
    const dataURL = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' // "Hello, World!" in base64
    const expectedOutput = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]) // "Hello, World!" in ASCII

    const result = dataURLtoU8Array(dataURL)
    expect(result).toEqual(expectedOutput)
  })
})
describe('getDescription', () => {
  it('should return the description associated with a given key from an object', () => {
    const descriptions = {
      check: 'This is a check description',
      fix: 'This is a fix description',
    }
    const key = 'check'
    const expectedOutput = 'This is a check description'

    const result = getDescription(descriptions, key)
    expect(result).toEqual(expectedOutput)
  })

  it('should return "no description was labeled with: key" if the key is not found in the descriptions object', () => {
    const descriptions = {
      check: 'This is a check description',
      fix: 'This is a fix description',
    }
    const key = 'nonexistent'
    const expectedOutput = `no description was labeled with: ${key}`

    const result = getDescription(descriptions, key)
    expect(result).toEqual(expectedOutput)
  })

  it('should return the description associated with a given key from an array', () => {
    const descriptions: ExecJSON.ControlDescription[] = [
      {label: 'check', data: 'This is a check description'},
      {label: 'fix', data: 'This is a fix description'},
    ]
    const key = 'check'
    const expectedOutput = 'This is a check description'

    const result = getDescription(descriptions, key)
    expect(result).toEqual(expectedOutput)
  })

  it('should return "description for key not found" if the key is not found in the descriptions array', () => {
    const descriptions: ExecJSON.ControlDescription[] = [
      {label: 'check', data: 'This is a check description'},
      {label: 'fix', data: 'This is a fix description'},
    ]
    const key = 'nonexistent'
    const expectedOutput = `description for ${key} not found`

    const result = getDescription(descriptions, key)
    expect(result).toEqual(expectedOutput)
  })
})

describe('getInstalledPath', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should return the installed path when the module is installed', () => {
    jest.doMock('get-installed-path', () => ({
      getInstalledPathSync: jest.fn().mockReturnValue('/generic/module/path'),
    }))
    jest.doMock('app-root-path', () => ({
      path: '/generic/app/root/path',
    }))

    // eslint-disable-next-line node/no-missing-require, unicorn/prefer-module
    const {getInstalledPath} = require('../../../src/utils/global')
    // eslint-disable-next-line unicorn/prefer-module
    const {getInstalledPathSync} = require('get-installed-path')

    const result = getInstalledPath('module-name')

    expect(result).toBe('/generic/module/path')
    expect(getInstalledPathSync).toHaveBeenCalledWith('module-name')
  })

  it('should return the application root path when the module is not installed', () => {
    jest.doMock('get-installed-path', () => ({
      getInstalledPathSync: jest.fn().mockImplementation(() => {
        throw new Error('Module not found')
      }),
    }))
    jest.doMock('app-root-path', () => ({
      path: '/generic/app/root/path',
    }))

    // eslint-disable-next-line node/no-missing-require, unicorn/prefer-module
    const {getInstalledPath} = require('../../../src/utils/global')
    // eslint-disable-next-line unicorn/prefer-module
    const {getInstalledPathSync} = require('get-installed-path')

    const result = getInstalledPath('module-name')

    expect(result).toBe('/generic/app/root/path')
    expect(getInstalledPathSync).toHaveBeenCalledWith('module-name')
  })
})

describe('arrayNeededPaths', () => {
  const arrayedPaths = ['tags.cci', 'tags.nist']

  it('should return values as an array if typeOfPath is in arrayedPaths and values is not an array', () => {
    const typeOfPath = 'tags.cci'
    const values = 'test'
    const expectedOutput = ['test']

    const result = arrayNeededPaths(typeOfPath, values)
    expect(result).toEqual(expectedOutput)
  })

  it('should return values as is if typeOfPath is in arrayedPaths and values is an array', () => {
    const typeOfPath = 'tags.cci'
    const values = ['test']
    const expectedOutput = ['test']

    const result = arrayNeededPaths(typeOfPath, values)
    expect(result).toEqual(expectedOutput)
  })
})

describe('extractValueViaPathOrNumber', () => {
  const data = {
    'tags.cci': 'test1',
    'tags.nist': 'test2',
    'Field Not Defined': 'test3',
    other: 'test4',
  }

  it('should return value from data if pathOrNumber is a string', () => {
    const typeOfPathOrNumber = 'tags.cci'
    const pathOrNumber = 'tags.cci'
    const expectedOutput = ['test1']

    const result = extractValueViaPathOrNumber(typeOfPathOrNumber, pathOrNumber, data)
    expect(result).toEqual(expectedOutput)
  })

  it('should return value from data if pathOrNumber is an array', () => {
    const typeOfPathOrNumber = 'tags.nist'
    const pathOrNumber = ['tags.nist', 'other']
    const expectedOutput = ['test2']

    const result = extractValueViaPathOrNumber(typeOfPathOrNumber, pathOrNumber, data)
    expect(result).toEqual(expectedOutput)
  })

  it('should return "Field Not Defined" if pathOrNumber is an array and no path is found in data', () => {
    const typeOfPathOrNumber = 'Field Not Defined'
    const pathOrNumber = ['nonexistent1', 'nonexistent2']
    const expectedOutput = 'test3'

    const result = extractValueViaPathOrNumber(typeOfPathOrNumber, pathOrNumber, data)
    expect(result).toEqual(expectedOutput)
  })

  it('should return pathOrNumber as is if pathOrNumber is a number', () => {
    const typeOfPathOrNumber = 'number'
    const pathOrNumber = 123
    const expectedOutput = 123

    const result = extractValueViaPathOrNumber(typeOfPathOrNumber, pathOrNumber, data)
    expect(result).toEqual(expectedOutput)
  })
})

describe('getProfileInfo', () => {
  it('should return all profile information if available for rhel8_hardened', () => {
    const evaluation: ContextualizedEvaluation = loadExpectedData(rhel8_hardened)
    const fileName = 'rhel-8_hardened.json'
    const expectedOutput =
      'File Name: rhel-8_hardened.json\n' +
      'Version: 1.12.0\n' +
      'SHA256 Hash: 7f77220de1c9d7f701dc4fbb3d0a9b2c0389c216e8d53585eec0031ecf6ed36e\n' +
      'Maintainer: MITRE SAF Team\n' +
      'Copyright: MITRE\n' +
      'Control Count: 375'

    const result = getProfileInfo(evaluation, fileName)
    expect(result).toEqual(expectedOutput)
  })

  it('should return all profile information if available for triple_overlay_profile_example', () => {
    const evaluation: ContextualizedEvaluation = loadExpectedData(triple_overlay_profile_example)
    const fileName = 'triple_overlay_profile_example.json'
    const expectedOutput =
      'File Name: triple_overlay_profile_example.json\n' +
      'Version: 0.1.0\n' +
      'SHA256 Hash: 3fe40f9476a23b5b4dd6c0da2bb8dbe8ca5a4a8b6bfb27ffbf9f1797160c0f91\n' +
      'Maintainer: CMS InSpec Dev Team\n' +
      'Copyright: .\n' +
      'Control Count: 200'

    const result = getProfileInfo(evaluation, fileName)
    expect(result).toEqual(expectedOutput)
  })

  it('should return all profile information if available for minimal_hdf', () => {
    const evaluation: ContextualizedEvaluation = loadExpectedData(minimal_hdf)
    const fileName = 'minimal_hdf.json'
    const expectedOutput =
      'File Name: minimal_hdf.json\n' +
      'Version: 0.1.0\n' +
      'SHA256 Hash: 5b6b2189b26425192a9eb4ae99ba52403c054e7a5f0a61f847d773a3444b8546\n' +
      'Maintainer: The Authors\n' +
      'Copyright: The Authors\n' +
      'Copyright Email: you@example.com\n' +
      'Control Count: 1'

    const result = getProfileInfo(evaluation, fileName)
    expect(result).toEqual(expectedOutput)
  })
})

it('should return an empty string if no profile information is available', () => {
  const evaluation = {
    data: {
      profiles: [{}],
    },
  } as unknown as ContextualizedEvaluation
  const fileName = 'test.json'
  const expectedOutput = ''

  const result = getProfileInfo(evaluation, fileName)

  expect(result).toEqual(expectedOutput)
})

it('should return an empty string if the evaluation data is null or undefined', () => {
  const evaluation = null as unknown as ContextualizedEvaluation
  const fileName = 'test.json'
  const expectedOutput = ''

  const result = getProfileInfo(evaluation, fileName)

  expect(result).toEqual(expectedOutput)
})

describe('getDescription', () => {
  it('should return the correct description when descriptions is an array', () => {
    const descriptions = [{label: 'key1', data: 'description1'}, {label: 'key2', data: 'description2'}]
    const key = 'key1'
    const result = getDescription(descriptions, key)
    expect(result).toBe('description1')
  })

  it('should return the correct description when descriptions is an object', () => {
    const descriptions = {key1: 'description1', key2: 'description2'}
    const key = 'key1'
    const result = getDescription(descriptions, key)
    expect(result).toBe('description1')
  })
})

jest.mock('@mitre/hdf-converters', () => ({
  fingerprint: jest.fn(),
}))

describe('checkInput', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should not throw an error when the detected type matches the desired type', () => {
    // eslint-disable-next-line node/no-missing-require, unicorn/prefer-module
    const {fingerprint} = require('@mitre/hdf-converters')
    fingerprint.mockReturnValue('text')

    const guessOptions = {data: 'file data', filename: 'file.txt'}
    const desiredType = 'text'
    const desiredFormat = 'txt'

    expect(() => checkInput(guessOptions, desiredType, desiredFormat)).not.toThrow()
  })

  it('should throw an error when the detected type does not match the desired type', () => {
    // eslint-disable-next-line node/no-missing-require, unicorn/prefer-module
    const {fingerprint} = require('@mitre/hdf-converters')
    fingerprint.mockReturnValue('image')

    const guessOptions = {data: 'file data', filename: 'file.txt'}
    const desiredType = 'text'
    const desiredFormat = 'txt'

    expect(() => checkInput(guessOptions, desiredType, desiredFormat)).toThrow(
      'Unable to process input file\nDetected input type: image\nPlease ensure the input is a valid txt',
    )
  })
})
