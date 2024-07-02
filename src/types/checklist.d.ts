import {StigMetadata} from '@mitre/hdf-converters'
import {ContextualizedEvaluation} from 'inspecjs'

export interface ChecklistControl {
  vid: string;
  rid: string;
  ruleVersion: string;
  gtitle: string;
  severity: string;
  title: string;
  description: string;
  checkText: string;
  fixText: string;
  profileName: string;
  startTime: string;
  targetKey: number;
  uuidV4: string;
  ccis: string[];
  status: string;
  results: string;
}

export interface CKLMetadata {
  assettype: null | string;
  hostfqdn: null | string;
  hostguid: null | string;
  hostip: null | string;
  hostmac: null | string;
  hostname: null | string;
  marking: null | string;
  role: null | string;
  stigguid: null | string;
  targetcomment: null | string;
  targetkey: null | string;
  techarea: null | string;
  webdbinstance: null | string;
  webdbsite: null | string;
  webordatabase: null | boolean;
  profiles: StigMetadata[]
}

type ExtendedEvaluationFile = {
  evaluation: ContextualizedEvaluation;
};
