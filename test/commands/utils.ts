import {ExecJSON} from 'inspecjs'
import _ from 'lodash'

export function omitHDFChangingFields(
  input: Partial<ExecJSON.Execution> & {profiles: ExecJSON.Profile[]},
) {
  return {
    ..._.omit(input, ['version', 'platform.release', 'profiles[0].sha256', 'profiles[0].version']),
    profiles: input.profiles.map(profile => {
      return {
        ...profile,
        controls: profile.controls.map(control => {
          return {
            ...control,
            attestation_data: {
              ..._.omit(control.attestation_data, 'updated'),
            },
            results: control.results.map(result => {
              return {
                ..._.omit(result, 'start_time'),
                message: result.message?.replace(/Updated:.*\n/g, ''),
              }
            }),
          }
        }),
      }
    }),
  }
}

export function removeUUIDs(obj: any) {
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      removeUUIDs(obj[key])
    } else if (typeof obj[key] === 'string' && isUUID(obj[key])) {
      delete obj[key]
    }
  }
}

export function isUUID(str: string) {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
  return uuidRegex.test(str)
}
