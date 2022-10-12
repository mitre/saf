import fs from 'fs'
import axios from 'axios'
import AWS from 'aws-sdk'
import { createWinstonLogger } from './logging';
import winston from 'winston';

export async function readFileURI(uri: string, encoding: BufferEncoding, logger?: winston.Logger): Promise<string> {
    if (!logger) {
        logger = createWinstonLogger('File IO', 'info')
    }

    let parsedURI;
    
    try {
        parsedURI = new URL(uri);
        logger.debug(`Parsed URI: ${uri} - Protocol is ${parsedURI.protocol}`);
    } catch (e) {
        logger.debug(`Failed to parse URI: ${uri}, treating as a file path`);
        return fs.readFileSync(uri, encoding);
    }

    if (parsedURI.protocol === 's3:') {
        // Read file from S3 Bucket
        logger.debug('Starting read from S3');
        const s3 = new AWS.S3();
        const s3Params = {
            Bucket: parsedURI.hostname,
            Key: parsedURI.pathname.slice(1)
        }
        const s3Object = await s3.getObject(s3Params).promise();
        logger.debug('Finished read from S3');
        if (s3Object.Body) {
            const bodyString = s3Object.Body.toString('utf8');
            logger.debug(`Read ${bodyString.length} bytes from S3`);
            return bodyString;
        } else {
            throw new Error('S3 Object Body is empty')
        }
    } else if (parsedURI.protocol === 'http:' || parsedURI.protocol === 'https:') {
        // Read file from URL
        console.log('Reading from URL')
        return axios.get(uri, {
            responseType: 'text'
        }).then(({ data }) => JSON.stringify(data))
    }
    return ''
}