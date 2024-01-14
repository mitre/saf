import {expect, test} from '@oclif/test'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

describe('Summary command', () => {
  const hdfFilePath = path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json')
  const JSON_reference = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.json')
  const YAML_reference = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.yml')
  const MD_reference = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.md')
  const generatedMD = 'generatedMD.md'
  const UTF8_ENCODING = 'utf8'

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=json'])
    .it('runs summary with JSON output and matches the JSON reference file', ctx => {
      const expectedOutput = JSON.parse(fs.readFileSync(JSON_reference, UTF8_ENCODING))
      expect(JSON.parse(ctx.stdout)).to.deep.equal(expectedOutput)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=markdown', '--no-title-table', '-o', generatedMD])
    .it('runs summary with Markdown output and matches the markdown refernce file', () => {
      const expectedOutput = fs.readFileSync(MD_reference, 'utf8').trim()
      const actualOutput = fs.readFileSync(generatedMD, 'utf8').trim()
      expect(actualOutput).to.equal(expectedOutput)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=yaml'])
    .it('runs summary with YAML output and matches the YAML refrence file', ctx => {
      const expectedOutputYaml = fs.readFileSync(YAML_reference, UTF8_ENCODING)
      const expectedOutput = yaml.load(expectedOutputYaml)
      const actualOutput = yaml.load(ctx.stdout)
      expect(actualOutput).to.deep.equal(expectedOutput)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=json', '--no-print-pretty'])
    .it('runs summary with --no-pretty flag and produces flat JSON output', ctx => {
      // Parse the actual output
      const actualOutput = JSON.parse(ctx.stdout)
      // Stringify and parse the actual output without indentation to get flat JSON
      const flatOutput = JSON.parse(JSON.stringify(actualOutput))
      // Check that the actual output equals the flat output
      expect(actualOutput).to.deep.equal(flatOutput)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=json', '--print-pretty'])
    .it('runs summary with --pretty flag and produces formatted JSON output', ctx => {
      // Parse the actual output
      const actualOutput = JSON.parse(ctx.stdout)
      // Stringify and parse the actual output with 2 spaces of indentation to get formatted JSON
      const prettyOutput = JSON.parse(JSON.stringify(actualOutput, null, 2))
      // Check that the actual output equals the pretty output
      expect(actualOutput).to.deep.equal(prettyOutput)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=json', '--stdout'])
    .it('runs summary with --stdout flag and prints output to console', ctx => {
      const actualOutput = JSON.parse(ctx.stdout)
      expect(actualOutput).to.not.be.empty.equal(true)
    })

  test
    .stdout()
    .command(['summary', '-i', hdfFilePath, '--format=json', '--no-stdout'])
    .it('runs summary with no-stdout flag and does not write to stdout', ctx => {
      expect(ctx.stdout).to.be.empty.equal('')
    })
})
