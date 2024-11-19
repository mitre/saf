import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import path from 'path'

import axios from 'axios'
import express from 'express'
import {Server} from 'http'
import {getInstalledPath} from '../../../src/utils/global'
import {JSDOM} from 'jsdom'

describe('Test heimdall SAF CLI Command', () => {
  it('runs heimdall with --help', async () => {
    const {stdout} = await runCommand<{name: string}>(['view', 'heimdall', '--help'])
    expect(stdout).to.contain('Run an instance of Heimdall Lite to visualize your data')
  })
})

describe('Test Heimdall Embedded', () => {
  let server: Server

  beforeEach(done => {
    const installedPath = getInstalledPath('@mitre/saf')
    const staticFilesDirectory = path.join(installedPath, 'node_modules/@mitre/heimdall-lite/dist')
    const predefinedLoadJSON = express.json() // Replace this with your actual middleware
    server = express()
      .use(predefinedLoadJSON)
      .use(express.static(staticFilesDirectory))
      .use((_err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(500).send('Something broke!')
      })
      .listen(3000, () => {
        done()
      })
  })

  afterEach(() => {
    return new Promise<void>(resolve => {
      server.close(() => {
        resolve()
      })
    })
  })

  it('should start the server on the specified port', async () => {
    try {
      const response = await axios.get('http://localhost:3000')
      const dom = new JSDOM(response.data)
      const text = dom.window.document.body.textContent
      expect(text).to.not.be.null
    } catch (error: any) {
      expect(error.message).to.equal('Request failed with status code 404')
    }
  })

  it('should serve the Vue.js app', async () => {
    try {
      const response = await axios.get('http://localhost:3000')
      const dom = new JSDOM(response.data)
      const appDiv = dom.window.document.querySelector('#app')
      expect(appDiv).to.not.be.null
    } catch (error: any) {
      expect(error.message).to.equal('Request failed with status code 404')
    }
  })
})
