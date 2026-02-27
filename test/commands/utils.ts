import { ExecJSON } from 'inspecjs';
import _ from 'lodash';

export function omitHDFChangingFields(
  input: Partial<ExecJSON.Execution> & { profiles: ExecJSON.Profile[] },
) {
  return {
    ..._.omit(input, ['version', 'platform.release', 'profiles[0].sha256', 'profiles[0].version']),
    profiles: input.profiles.map((profile) => {
      return {
        ...profile,
        controls: profile.controls.map((control) => {
          return {
            ...control,
            attestation_data: {
              ..._.omit(control.attestation_data, 'updated'),
            },
            results: control.results.map((result) => {
              return {
                ..._.omit(result, 'start_time'),
                message: result.message?.replaceAll(/Updated:.*\n/g, ''),
              };
            }),
          };
        }),
      };
    }),
  };
}

export function omitChecklistChangingFields(input: string) {
  // remove UUIDs and the heimdall version
  return input.replaceAll(/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/gm, '')
    .replace(/<!--Heimdall Version :: \S+-->/, '');
}

export function removeUUIDs(obj: Record<string, unknown>): void {
  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) continue; // Ensure it's own property

    const value = obj[key];

    if (value && typeof value === 'object') {
      removeUUIDs(value as Record<string, unknown>); // Recursively call for nested objects
    } else if (typeof value === 'string' && isUUID(value)) {
      delete obj[key]; // skipcq: JS-0320
    }
  }
}

export function isUUID(str: string) {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(str);
}
