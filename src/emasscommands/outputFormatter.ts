import { ApiConfig } from "./apiConfig";
import _ from 'lodash';

export function outputFormat(data: Object): string {
  
  const conf = new ApiConfig();
  let hideNulls: boolean = (conf.displayNulls === 'true') ? false : true;
  let showEpoch: boolean = (conf.displayDateTime === 'true') ? false : true;

  try {

    if (hideNulls) {
      let newData: {[key: string]: any} = {};

      (Object.keys(data) as (keyof typeof data)[]).forEach((key, index) => {
        if (key.toString() === 'meta') {
          var jsonData: {[key: string]: any} = {};
          jsonData[key] =  data[key];
          _.merge(newData, jsonData);
        } else if (key.toString() === 'data') {
          if (Array.isArray(data[key])) {
            let data_array = data[key]
            let hash_array: never[] = [];
            (Object.keys(data_array) as (keyof typeof data_array)[]).forEach((key, index) => {
              if (data_array[key] !== null) {
                hash_array.push(data_array[key])
              }
            });
            newData.push({data: hash_array});
            data = newData;
          } else {
            var jsonData: {[key: string]: any} = {};
            const obj = data[key];
            (Object.keys(obj) as (keyof typeof obj)[]).forEach((key, index) => {
              if (obj[key] !== null) {
                jsonData[key] = obj[key];
              }
            });
            var dataObj: {[key: string]: any} = {};
            dataObj.data = jsonData;
            _.merge(newData, dataObj);
            data = newData;
          }
        }
      });
    }

    if (!showEpoch) {
      var newData: {[key: string]: any} = {};
      var dataObj: {[key: string]: any} = {};
      (Object.keys(data) as (keyof typeof data)[]).forEach((key, index, keyArray) => {
        if (key.toString() === 'meta') {
          var jsonData: {[key: string]: any} = {};
          jsonData[key] =  data[key];
          _.merge(newData, jsonData);
        } else if (key.toString() === 'data') {
          const obj = data[key];
          var jsonData: {[key: string]: any} = {};
          (Object.keys(obj) as (keyof typeof obj)[]).forEach((key, index, keyArray) => {
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
          });
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



