import { expect, test } from '@oclif/test'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import * as tableParser from 'table-parser'
import * as markdownTable from 'markdown-table'

describe('Summary command', () => {
  const hdfFilePath = path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json')
  const JSON_outputFilePath = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.json')
  const YAML_outputFilePath = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.yml')
  const MD_outputFilePath = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.md')
  const UTF8_ENCODING = 'utf8'

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=json', '-o', JSON_outputFilePath])
    .it('runs summary with JSON output and writes to output file', ctx => {
      const expectedOutput = JSON.parse(fs.readFileSync(JSON_outputFilePath, UTF8_ENCODING))
      expect(JSON.parse(ctx.stdout)).to.deep.equal(expectedOutput)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=yaml', '-o', YAML_outputFilePath])
    .it('runs summary with YAML output and writes to output file', ctx => {
      const expectedOutputYaml = fs.readFileSync(YAML_outputFilePath, UTF8_ENCODING)
      const expectedOutput = yaml.load(expectedOutputYaml)
      const actualOutput = yaml.load(ctx.stdout)

      expect(actualOutput).to.deep.equal(expectedOutput)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=markdown', '-o', MD_outputFilePath])
    .it('runs summary with Markdown output and writes to output file', ctx => {
      const expectedOutput = fs.readFileSync(MD_outputFilePath, UTF8_ENCODING)
      expect(ctx.stdout).to.equal(expectedOutput)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=json', '-o', JSON_outputFilePath, '--no-stdout'])
    .it('runs summary with no-stdout flag and does not write to stdout', ctx => {
      expect(ctx.stdout).to.be.empty
    })
})
