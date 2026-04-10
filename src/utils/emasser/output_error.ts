import _ from 'lodash';

/**
 * Generates a formatted error message from the provided data object.
 *
 * @param data - The data object containing error information.
 * @returns A stringified JSON object representing the error message.
 *
 * The function checks for the presence of specific properties within the data object:
 * - If `data.status` exists, it uses this value as the error code.
 * - If `data.code` exists, it uses this value as the error message.
 * - If `data.response.data` exists, it uses this object as the result.
 * - If `data.response.status` exists, it uses this value as the error
 *      code and `data.response.statusText` as the error message.
 *
 * If none of the above properties are found, it defaults to an error code of
 * 'Unknown' and an error message of 'Unable to access error message(s)'.
 */
export function outputError(data: object): string {
  let result: object = { meta: { code: (_.has(data, 'status')) ? _.get(data, 'status') : 'Unknown',
    errorMessage: (_.has(data, 'code')) ? _.get(data, 'code') : 'Unable to access error message(s)' } };

  if (_.has(data, 'response.data')) {
    result = _.get(data, 'response.data') || result;
  } else if (_.has(data, 'response.status')) {
    result = { meta: { code: _.get(data, 'response.status'), errorMessage: _.get(data, 'response.statusText') } };
  }

  return JSON.stringify(result, null, 2);
}
