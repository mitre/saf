import { expect, test } from '@oclif/test'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

describe('Summary command', () => {
  const hdfFilePath = path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json')
  const JSON_outputFilePath = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.json')
  const YAML_outputFilePath = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.yml')

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '-j', '-o', JSON_outputFilePath])
    .it('runs summary with JSON output and writes to output file', ctx => {
      const expectedOutput = JSON.parse(fs.readFileSync(JSON_outputFilePath, 'utf8'))
      expect(JSON.parse(ctx.stdout)).to.deep.equal(expectedOutput)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '-o', YAML_outputFilePath])
    .it('runs summary with YAML output and writes to output file', ctx => {
      const expectedOutputYaml = fs.readFileSync(YAML_outputFilePath, 'utf8')
      const expectedOutput = yaml.load(expectedOutputYaml)
      const actualOutput = yaml.load(ctx.stdout)

      expect(actualOutput).to.deep.equal(expectedOutput)
    })

  // test
  //   .stdout()
  //   .command(['summary', '-i', hdfFilePath, '-j'])
  //   .it('runs summary with JSON output', ctx => {
  //     // Replace this with the expected output
  //     const expectedOutput = '...'

  //     expect(ctx.stdout).to.equal(expectedOutput)
  //   })
})
