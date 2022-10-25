import { ApiConfig } from "./apiConfig";
import _ from 'lodash';
import { exit } from "process";

export function outputFormat(data: Object): string {
  
  const conf = new ApiConfig();
  let hideNulls: boolean = (conf.displayNulls === 'true') ? false : true;
  let showEpoch: boolean = (conf.displayDateTime === 'true') ? true : false;

  try {
    if (data.hasOwnProperty('headers')) {
      data = _.get(data, 'data');
    }

    if (hideNulls) {
      let newData: {[key: string]: any} = {};

      (Object.keys(data) as (keyof typeof data)[]).forEach((key, index) => {
        // Process the 'meta' content
        if (key.toString() === 'meta') {
          var jsonData: {[key: string]: any} = {};
          jsonData[key] =  data[key];
          _.merge(newData, jsonData);
        // Process the 'data' content
        } else if (key.toString() === 'data') {
          // data: is an array of objects        
          if (Array.isArray(data[key])) {
            let data_array = Object.values(data[key]);
            let hash_array: Object[] = [];
            data_array.forEach(dataEntries => {
              jsonData = removeNullsFromObject(dataEntries)
              hash_array.push(jsonData);
            });
            _.merge(newData, {data: hash_array});
            data = newData;
          // data: is NOT and array of object it is a simple object
          } else {
            var jsonData: {[key: string]: any} = {};
            const obj = data[key];
            // If we have a data key/pair of null
            if (data[key] === null ) {
              _.merge(newData, {data: null});
            } else {
              (Object.keys(obj) as (keyof typeof obj)[]).forEach((key, index) => {
                if (Array.isArray(obj[key])) {
                  var jsonObj: {[key: string]: any} = {};
                  let data_array: any = Object.values(obj[key]);
                  let hash_array: Object[] = [];
                  data_array.forEach((dataObject: Object) => {
                    jsonObj = removeNullsFromObject(dataObject);
                    hash_array.push(jsonObj);
                  });
                  jsonData[key] = hash_array;
                } else {
                  if (obj[key] !== null ) {
                    jsonData[key] = obj[key];
                  }
                }
              });
              var dataObj: {[key: string]: any} = {};
              dataObj.data = jsonData;
              _.merge(newData, dataObj);
            }
            data = newData;
          }
        }
      });
    }

    if (showEpoch) {
      var newData: {[key: string]: any} = {};
      var dataObj: {[key: string]: any} = {};
      (Object.keys(data) as (keyof typeof data)[]).forEach((key, index, keyArray) => {
        var jsonData: {[key: string]: any} = {};
        if (key.toString() === 'meta') {
          jsonData[key] =  data[key];
          _.merge(newData, jsonData);
        } else if (key.toString() === 'data') {
          if (Array.isArray(data[key])) {
            let data_array = Object.values(data[key]);
            let hash_array: Object[] = [];
            data_array.forEach(dataEntries => {
              jsonData = convertEpochToDateTime(dataEntries)
              hash_array.push(jsonData);
            });
            _.merge(newData, {data: hash_array});
            data = newData;
          } else {
            const obj = data[key];
            (Object.keys(obj) as (keyof typeof obj)[]).forEach((key, index, keyArray) => {
              if (Array.isArray(obj[key])) {
                var jsonObj: {[key: string]: any} = {};
                let data_array: any = Object.values(obj[key]);
                let hash_array: Object[] = [];
                data_array.forEach((dataObject: Object) => {
                  jsonObj = convertEpochToDateTime(dataObject);
                  hash_array.push(jsonObj);
                });
                jsonData[key] = hash_array;
              } else {
                if (obj[key] !== null) {
                  let value: string = key;
                  if (value.search('date') > 0 || value.search('Date') > 0) {
                    jsonData[key] = new Date(obj[key] * 1000);
                  } else {
                    jsonData[key] = obj[key];
                  }
                } else {
                  jsonData[key] = obj[key];
                }
              }
            });
          }          
          dataObj.data = jsonData;
          _.merge(newData, dataObj);
        }
      });
      data = newData;
    }
  

    if (typeof data === 'string') {
      return data;
    } else {
      return JSON.stringify(data, null,2);
    }
  } catch {
    if (typeof data === 'string') {
      return data;
    } else {
      return JSON.stringify(data, null,2);
    }
  }
}

function removeNullsFromObject(dataObject: Object): Object {
  var jsonData: {[key: string]: any} = {};

  (Object.keys(dataObject) as (keyof typeof dataObject)[]).forEach((key, index) => {
    if (dataObject[key] !== null ) {
      jsonData[key] = dataObject[key];
    }
  });

  return jsonData;
}

function convertEpochToDateTime(dataObject: Object): Object {
  var jsonData: {[key: string]: any} = {};
  (Object.keys(dataObject) as (keyof typeof dataObject)[]).forEach((key, index) => {
    if (Array.isArray(dataObject[key])) {
      var jsonObj: {[key: string]: any} = {};
      let hash_array: Object[] = [];
      let data_array: any = Object.values(dataObject[key]);
      data_array.forEach((dataObj: Object) => {
        if ( typeof data_array[0] === 'string' ) {
          hash_array.push(dataObj);
        } else {
          jsonObj = convertEpochToDateTime(dataObj);
          hash_array.push(jsonObj);             
        }
      });
      jsonData[key] = hash_array;
    } else {
      if (dataObject[key] !== null ) {
        let value: string = key;
        let epochDate: number = parseInt(dataObject[key].toString());
        if (value.search('date') > 0 || value.search('Date') > 0) {
          jsonData[key] = new Date(epochDate * 1000);
        } else {
          jsonData[key] = dataObject[key];
        }
      } else {
        jsonData[key] = dataObject[key];
      }
    }
  });

  return jsonData;
}