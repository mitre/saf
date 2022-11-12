import _ from "lodash";

export function outputError(data: Object): string {
  
  let result = {meta: {code: 'unknown', errorMessage: 'Unable to access error message(s)'}};
 
  if (_.has(data, 'response.data')) {
    result = _.get(data, 'response.data');
  } else if (_.has(data, 'response.status')) {
    result = {meta: {code: _.get(data, 'response.status'), errorMessage: _.get(data, 'response.statusText')}}
  }
  
  return JSON.stringify(result, null, 2);

}