/* eslint-disable node/no-extraneous-import */
import TransportStream from 'winston-transport'
import {EventEmitter} from 'events'

class MemoryTransport extends (TransportStream as { new(): TransportStream & EventEmitter }) {
  logs: any[];

  constructor() {
    super()
    this.logs = []
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    this.logs.push(info)
    callback()
  }
}

export default MemoryTransport
