import _ from 'lodash'

export function outputError(data: object): string {
  // let result: object = {meta: {code: 'Unknown', errorMessage: 'Unable to access error message(s)'}}
  let result: object = {meta: {code: (_.has(data, 'status')) ? _.get(data, 'status') : 'Unknown',
    errorMessage: (_.has(data, 'code')) ? _.get(data, 'code') : 'Unable to access error message(s)'}}

  if (_.has(data, 'response.data')) {
    result = _.get(data, 'response.data') || result
  } else if (_.has(data, 'response.status')) {
    result = {meta: {code: _.get(data, 'response.status'), errorMessage: _.get(data, 'response.statusText')}}
  }

  return JSON.stringify(result, null, 2)
}
