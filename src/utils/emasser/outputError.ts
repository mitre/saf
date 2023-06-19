import _ from 'lodash'

export function outputError(data: object): string {
  let result: object = {meta: {code: 'Unknown', errorMessage: 'Unable to access error message(s)'}}

  if (_.has(data, 'response.data')) {
    // Need to use the non null assertion (!) or return and empty objet as _.get can return undefined
    result = _.get(data, 'response.data') || {}
  } else if (_.has(data, 'response.status')) {
    result = {meta: {code: _.get(data, 'response.status'), errorMessage: _.get(data, 'response.statusText')}}
  }

  return JSON.stringify(result, null, 2)
}
