import {ApiConfig} from './apiConfig'
import _ from 'lodash'

function removeNullsFromObject(dataObject: object): object {
  const jsonData: {[key: string]: any} = {};

  (Object.keys(dataObject) as (keyof typeof dataObject)[]).forEach(key => {
    if (dataObject[key] !== null) {
      jsonData[key] = dataObject[key]
    }
  })

  return jsonData
}

function convertEpochToDateTime(dataObject: object): object {
  const jsonData: {[key: string]: any} = {};
  (Object.keys(dataObject) as (keyof typeof dataObject)[]).forEach(key => {
    if (Array.isArray(dataObject[key])) {
      let jsonObj: {[key: string]: any} = {} // skipcq: JS-0242
      const hash_array: object[] = []
      const data_array: object[] = Object.values(dataObject[key])
      data_array.forEach((dataObj: object) => {
        if (typeof data_array[0] === 'string') {
          hash_array.push(dataObj)
        } else {
          jsonObj = convertEpochToDateTime(dataObj)
          hash_array.push(jsonObj)
        }
      })
      jsonData[key] = hash_array
    } else if (dataObject[key] !== null) {
      const value: string = key
      const epochDate: number = Number.parseInt(dataObject[key], 10)
      if (Number.isNaN(epochDate) || epochDate < 100000000) {
        jsonData[key] = dataObject[key]
      } else {
        jsonData[key] = value.toUpperCase().search('DATE') >= 0 || value.toUpperCase().search('ATD') >= 0 ? new Date(epochDate * 1000) : dataObject[key]
      }
    } else if (dataObject[key] === null) {
      jsonData[key] = dataObject[key]
    }
  })

  return jsonData
}

export function outputFormat(data: object, doConversion = true): string {
  const conf = new ApiConfig()
  const hideNulls: boolean = conf.displayNulls !== 'true'
  const showEpoch: boolean = (conf.displayDateTime === 'true')
  const debugging: boolean = (conf.debugging === 'true')
  let formatDataObj: object = data

  if (debugging) {
    // When debugging is on, output the entire content returned from
    // the server. Output text in yellow and revert back to default
    console.log('\x1B[93m', 'Debugging is on', '\x1B[0m')
    try {
      console.log(JSON.stringify(data, null, 2))
    } catch {
      console.log(data)
    }

    return ''
  }

  try {
    if (Object.prototype.hasOwnProperty.call(data, 'headers')) {
      // Need to use the non null assertion (!) or return and empty objet as _.get can return undefined
      formatDataObj = _.get(data, 'data') || {}
    }

    const paginationObj = {pagination: _.get(formatDataObj, 'pagination')}

    if (doConversion) {
      if (hideNulls) {
        const newData: {[key: string]: any} = {};

        (Object.keys(formatDataObj) as (keyof typeof formatDataObj)[]).forEach(key1 => {
          switch (key1) {
            // Process the 'meta' content
            case 'meta': {
              const jsonData: {[key: string]: any} = {}
              jsonData[key1] = formatDataObj[key1]
              _.merge(newData, jsonData)
              break
            }

            // Process the 'data' content
            case 'data': {
              // data: is an array of objects
              if (Array.isArray(formatDataObj[key1])) {
                const data_array: object[] = Object.values(formatDataObj[key1])
                const hash_array: object[] = []
                for (const dataEntries of data_array) {
                  const jsonData = removeNullsFromObject(dataEntries)
                  hash_array.push(jsonData)
                }

                _.merge(newData, {data: hash_array})
                formatDataObj = newData
              // data: is NOT an array of objects, it is a simple object
              } else {
                const jsonData: {[key: string]: any} = {}
                const obj: object = formatDataObj[key1]
                // If we have a data key/pair of null
                if (formatDataObj[key1] === null) {
                  _.merge(newData, {data: null})
                } else {
                  (Object.keys(obj) as (keyof typeof obj)[]).forEach(key2 => {
                    if (Array.isArray(obj[key2])) {
                      let jsonObj: {[key: string]: any} = {} // skipcq: JS-0242
                      const data_array: object[] = Object.values(obj[key2])
                      const hash_array: object[] = []
                      for (const dataObject of data_array) {
                        jsonObj = removeNullsFromObject(dataObject)
                        hash_array.push(jsonObj)
                      }

                      jsonData[key2] = hash_array
                    } else if (obj[key2] !== null) {
                      jsonData[key2] = obj[key2]
                    }
                  })
                  const dataObj: {[key: string]: any} = {}
                  dataObj.data = jsonData
                  _.merge(newData, dataObj)
                }

                formatDataObj = newData
              }

              break
            }

            case 'pagination': {
              _.merge(newData, paginationObj)
              break
            }

            default: {
              const jsonData: {[key: string]: any} = {}
              jsonData[key1] = formatDataObj[key1]
              _.merge(newData, jsonData)
              break
            }
          }
        })
      }

      if (showEpoch) {
        const newData: {[key: string]: any} = {}
        const dataObj: {[key: string]: any} = {};
        (Object.keys(formatDataObj) as (keyof typeof formatDataObj)[]).forEach(key1 => {
          const jsonData: {[key: string]: any} = {} // skipcq: JS-0242
          switch (key1) {
            case 'meta': {
              jsonData[key1] = formatDataObj[key1]
              _.merge(newData, jsonData)
              break
            }

            case 'data': {
              if (Array.isArray(formatDataObj[key1])) {
                const data_array: object[] = Object.values(formatDataObj[key1])
                const hash_array: object[] = []
                for (const dataEntries of data_array) {
                  const jsonData = convertEpochToDateTime(dataEntries)
                  hash_array.push(jsonData)
                }

                _.merge(newData, {data: hash_array})
                formatDataObj = newData
              } else {
                const obj: object = formatDataObj[key1];
                (Object.keys(obj) as (keyof typeof obj)[]).forEach(key2 => {
                  if (Array.isArray(obj[key2])) {
                    let jsonObj: {[key: string]: any} = {} // skipcq: JS-0242
                    const data_array: object[] = Object.values(obj[key2])
                    const hash_array: object[] = []
                    for (const dataObject of data_array) {
                      jsonObj = removeNullsFromObject(dataObject)
                      hash_array.push(jsonObj)
                    }

                    jsonData[key2] = hash_array
                  } else if (obj[key2] !== null) {
                    const value: string = key2
                    jsonData[key2] = value.toUpperCase().search('DATE') >= 0 || value.toUpperCase().search('ATD') >= 0 ? new Date(obj[key2] * 1000) : obj[key2]
                  } else if (obj[key2] === null) {
                    jsonData[key2] = obj[key2]
                  }
                })
              }

              dataObj.data = jsonData
              _.merge(newData, dataObj)
              break
            }

            case 'pagination': {
              _.merge(newData, paginationObj)
              break
            }

            default: {
              jsonData[key1] = formatDataObj[key1]
              _.merge(newData, jsonData)
              break
            }
          }
        })
        formatDataObj = newData
      }
    }

    if (typeof formatDataObj === 'string') {
      return formatDataObj
    }  // skipcq: JS-0056

    return JSON.stringify(formatDataObj, null, 2)
  } catch {
    if (typeof formatDataObj === 'string') {
      return formatDataObj
    }  // skipcq: JS-0056

    return JSON.stringify(formatDataObj, null, 2)
  }
}
