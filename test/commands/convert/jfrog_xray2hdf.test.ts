import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {ExecJSON} from 'inspecjs'
// import stdinMock from 'mock-stdin'
// import { stdin } from 'process'

function omitVersions(input: ExecJSON.Execution): Partial<ExecJSON.Execution> {
  return _.omit(input, ['version', 'platform.release', 'profiles[0].sha256'])
}

describe('Test jfrog_xray', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert:jfrog_xray2hdf', '-i', path.resolve('./test/sample_data/jfrog_xray/sample_input_report/jfrog_xray_sample.json'), '-o', `${tmpobj.name}/jfrogtest.json`])
  .it('hdf-converter output test', () => {
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/jfrogtest.json`, 'utf-8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/jfrog_xray/jfrog-hdf.json'), 'utf-8'))
    expect(omitVersions(converted)).to.eql(omitVersions(sample))
  })
})

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('Test jfrog_xray with piped input rather than input file', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  const inputFileData = fs.readFileSync(path.resolve('./test/sample_data/jfrog_xray/sample_input_report/jfrog_xray_sample.json'))

  test
  .stdout()
  .stdin(inputFileData.toString(), 50)
  // .command(['convert:jfrog_xray2hdf', '-o', `${tmpobj.name}/jfrogtest.json`])
  .command(['convert:jfrog_xray2hdf', '-i', path.resolve('./test/sample_data/jfrog_xray/sample_input_report/jfrog_xray_sample.json'), '-o', `${tmpobj.name}/jfrogtest.json`])
  .it('mocks', async () => {
    // process.stdin.setEncoding('utf8')
    // await process.stdin.once('data', async data => {
    //   await delay(50)
    //   console.log(data)
    //   stdin()
    //   return data;
    // })
    // await delay(50)
    // process.stdin.end()
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/jfrogtest.json`, 'utf-8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/jfrog_xray/jfrog-hdf.json'), 'utf-8'))
    expect(omitVersions(converted)).to.eql(omitVersions(sample))
  })
})

// var ask = require('./ask');
// describe('ask', function () {
//   var stdin;
//   beforeEach(function () {
//     stdin = require('mock-stdin').stdin();
//   });
//   it('asks a question', function () {
//     process.nextTick(function mockResponse() {
//       stdin.send('response');
//     });
//     return ask('question: test')
//       .then(function (response) {
//         console.assert(response === 'response');
//       });
//   });
// });
