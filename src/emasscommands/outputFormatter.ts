import { ApiConfig } from "./apiConfig";
import _ from 'lodash';


  export function outputFormat(data: Object): string {
    

    const conf = new ApiConfig();
    //console.log('conf.displayNulls is: ' + conf.displayNulls);
    let hideNulls: boolean = (conf.displayNulls === 'true' ? false : true);
    let showEpoch: boolean = (conf.displayDateTime === 'true' ? false : true);

    //let hideNulls = !conf.displayNulls;
    
    console.log('hideNulls: ', hideNulls);
    console.log('showEpoch: ', showEpoch);

    if (hideNulls) {
    //if (conf.displayNulls === false) {
      //console.log('HERE');
      //Object.keys(data).forEach( (key: number|string) => {
      (Object.keys(data) as (keyof typeof data)[]).forEach((key, index) => {
        //console.log('key data[key] ' + key + data[key]);
        if (key.toString() === 'data') {
          //console.log('HERE');
          const obj = data[key];
          (Object.keys(obj) as (keyof typeof obj)[]).forEach((key, index) => {
            if (obj[key] === null) {
              delete obj[key];
            }
          });
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
            let value: string = key;
            if (value.search('date') > 0 || value.search('Date') > 0) {
              console.log('obj[key] is ', key, obj[key]);
              console.log('new date is ', new Date(obj[key] * 1000).toLocaleDateString());
              jsonData[key] = new Date(obj[key] * 1000);
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
    return JSON.stringify(data, null,2);
  }



