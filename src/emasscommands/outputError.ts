import _ from "lodash";

export function outputError(data: Object): string {
  
  let result = {meta: {code: 'unknown', errorMessage: 'Unable to access error message'}}
  
  if (_.has(data, 'response.data')) {
    result = _.get(data, 'response.data');
  }
  
  return JSON.stringify(result, null, 2);
}