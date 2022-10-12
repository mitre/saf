import fs from 'fs'
import axios from 'axios'
import AWS from 'aws-sdk'
import {createWinstonLogger} from './logging'
import winston from 'winston'
import {Error} from 'aws-sdk/clients/s3'

export async function readFileURI(uri: string, encoding: BufferEncoding, logger?: winston.Logger): Promise<string> {
  if (!logger) {
    logger = createWinstonLogger('File IO', 'debug')
  }

  let parsedURI

  try {
    parsedURI = new URL(uri)
    logger.debug(`Parsed URI: ${uri} - Protocol is ${parsedURI.protocol}`)
  } catch {
    logger.debug(`Failed to parse URI: ${uri}, treating as a file path`)
    return fs.readFileSync(uri, encoding)
  }

  if (parsedURI.protocol === 's3:') {
    // Read file from S3 Bucket
    logger.debug('Starting read from S3')
    const s3 = new AWS.S3()
    const s3Params = {
      Bucket: parsedURI.hostname,
      Key: parsedURI.pathname.slice(1),
    }
    const s3Object = await s3.getObject(s3Params).promise()
    logger.debug('Finished read from S3')
    if (s3Object.Body) {
      const bodyString = s3Object.Body.toString('utf8')
      logger.debug(`Read ${bodyString.length} bytes from S3`)
      return bodyString
    }

    throw new Error('S3 Object Body is empty')
  } else if (parsedURI.protocol === 'http:' || parsedURI.protocol === 'https:') {
    // Read file from URL
    console.log('Reading from URL')
    return axios.get(uri, {
      responseType: 'text',
    }).then(({data}) => data)
  }

  throw new Error(`Unsupported protocol to read file: ${parsedURI.protocol}`)
  return ''
}

export async function fileExistsURI(uri: string, logger?: winston.Logger): Promise<boolean> {
  if (!logger) {
    logger = createWinstonLogger('io', 'info')
  }

  let parsedURI

  try {
    parsedURI = new URL(uri)
    logger.debug(`Parsed URI: ${uri} - Protocol is ${parsedURI.protocol}`)
  } catch {
    logger.debug(`Failed to parse URI: ${uri}, treating as a file path`)
    return fs.existsSync(uri)
  }

  if (parsedURI.protocol === 's3:') {
    // Check if file exists in S3 Bucket
    logger.debug('Starting check if file exists in S3')
    const s3 = new AWS.S3()
    const s3Params = {
      Bucket: parsedURI.hostname,
      Key: parsedURI.pathname.slice(1),
    }

    try {
      await s3.headObject(s3Params).promise()
      logger.debug('Finished check if file exists in S3')
      return true
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return false
      }

      throw error
    }
  } else if (parsedURI.protocol === 'http:' || parsedURI.protocol === 'https:') {
    // Check if file exists at URL
    logger.debug('Starting check if file exists at URL')
    return axios.head(uri).then(() => true).catch(() => false)
  }

  console.error(`Unsupported protocol: ${parsedURI.protocol}`)
  return false
}

export async function folderExistsURI(uri: string, logger?: winston.Logger): Promise<Boolean> {
  if (!logger) {
    logger = createWinstonLogger('io', 'info')
  }

  let parsedURI

  try {
    parsedURI = new URL(uri)
    logger.debug(`Parsed URI: ${uri} - Protocol is ${parsedURI.protocol}`)
  } catch {
    logger.debug(`Failed to parse URI: ${uri}, treating as a file path`)
    return fs.existsSync(uri)
  }

  if (parsedURI.protocol === 's3:') {
    // Check if folder exists in S3 Bucket
    logger.debug('Starting check if folder exists in S3')
    const s3 = new AWS.S3()
    const s3Params = {
      Bucket: parsedURI.hostname,
      Prefix: parsedURI.pathname.slice(1),
    }

    try {
      await s3.listObjectsV2(s3Params).promise()
      logger.debug('Finished check if folder exists in S3')
      return true
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return false
      }

      throw error
    }
  }

  console.error(`Unsupported protocol: ${parsedURI.protocol}`)
  throw new Error(`Unsupported protocol for file: ${uri}`)
}

export async function createFolderIfNotExists(path: string, logger?: winston.Logger): Promise<void> {
  if (!logger) {
    logger = createWinstonLogger('File IO', 'debug')
  }

  let parsedURI

  try {
    parsedURI = new URL(path)
    logger.debug(`Parsed URI: ${path} - Protocol is ${parsedURI.protocol}`)
  } catch {
    logger.debug(`Failed to parse URI: ${path}, treating as a local folder path`)
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }

    return
  }

  if (parsedURI.protocol === 's3:') {
    // Create folder in S3 Bucket
    logger.debug('Starting folder creation in S3')
    const s3 = new AWS.S3()
    const s3Params = {
      Bucket: parsedURI.hostname,
      Key: parsedURI.pathname.slice(1),
    }
    await s3.putObject(s3Params).promise()
    logger.debug('Finished folder creation in S3')
  }
}

export async function writeFileURI(uri: string, data: string, logger?: winston.Logger): Promise<void> {
  if (!logger) {
    logger = createWinstonLogger('File IO', 'debug')
  }

  let parsedURI

  try {
    parsedURI = new URL(uri)
    logger.debug(`Parsed URI: ${uri} - Protocol is ${parsedURI.protocol}`)
  } catch {
    logger.debug(`Failed to parse URI: ${uri}, treating as a file path`)
    return fs.writeFileSync(uri, data)
  }

  if (parsedURI.protocol === 's3:') {
    // Write file to S3 Bucket
    logger.debug('Starting write to S3')
    const s3 = new AWS.S3()
    const s3Params = {
      Bucket: parsedURI.hostname,
      Key: parsedURI.pathname.slice(1),
      Body: data,
    }
    await s3.putObject(s3Params).promise()
    logger.debug('Finished write to S3')
  } else {
    throw new Error('Unsupported URI protocol')
  }
}
