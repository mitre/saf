import {runCommand} from '@oclif/test'
import axios from 'axios'
import express from 'express'
import {Server} from 'http'
import {JSDOM} from 'jsdom'
import path from 'path'
import {afterAll, assert, beforeAll, describe, expect, it} from 'vitest'
import {getInstalledPath} from '../../../src/utils/global'

describe('Test heimdall SAF CLI Command', () => {
  it('runs heimdall with --help', async () => {
    const {stdout} = await runCommand<{name: string}>(['view', 'heimdall', '--help'])
    expect(stdout).to.contain('Run an instance of Heimdall Lite to visualize your data')
  })
})

describe('Test Heimdall Embedded', async () => {
  let server: Server

  beforeAll(async () => {
    const installedPath = getInstalledPath('@mitre/saf')
    const staticFilesDirectory = path.join(installedPath, 'node_modules/@mitre/heimdall-lite/dist')
    const predefinedLoadJSON = express.json() // Replace this with your actual middleware
    server = express()
      .use(predefinedLoadJSON)
      .use(express.static(staticFilesDirectory))
      .use((_err: unknown, _req: express.Request, res: express.Response) => {
        res.status(500).send('Something broke!')
      })
      .listen(3000)

    await new Promise<void>((resolve) => {
      server.on('listening', () => {
        resolve()
      })
    })
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve()
      })
    })
  })

  it('should start the server on the specified port', async () => {
    const response = await axios.get('http://localhost:3000')
    const dom = new JSDOM(response.data)
    const text = dom.window.document.body.textContent
    assert.isNotNull(text)
  })

  it('should serve the Vue.js app', async () => {
    const response = await axios.get('http://localhost:3000')
    const dom = new JSDOM(response.data)
    const appDiv = dom.window.document.querySelector('#app')
    assert.isNotNull(appDiv)
  })
})
