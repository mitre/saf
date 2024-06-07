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
  assettype?: string;
  hostfqdn?: string;
  hostguid?: string;
  hostip?: string;
  hostmac?: string;
  hostname?: string;
  marking?: string;
  role?: string;
  stigguid?: string;
  targetcomment?: string;
  targetkey?: string;
  techarea?: string;
  webdbinstance?: string;
  webdbsite?: string;
  webordatabase?: boolean;
  profiles: StigMetadata[]
}

type ExtendedEvaluationFile = {
  evaluation: ContextualizedEvaluation;
};
