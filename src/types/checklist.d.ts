import {ContextualizedEvaluation} from 'inspecjs'

export interface ChecklistControl {
  ccis: string[];
  checkText: string;
  description: string;
  fixText: string;
  gtitle: string;
  profileName: string;
  results: string;
  rid: string;
  ruleVersion: string;
  severity: string;
  startTime: string;
  status: string;
  targetKey: number;
  title: string;
  uuidV4: string;
  vid: string;
}

export interface CKLMetadata {
    [key: string]: Record<string, null | string> | null | string;
    benchmark: {
      plaintext: null | string;
      title: null | string;
      version: null | string;
    };
    fileName: string;
    fqdn: null | string;
    hostname: null | string;
    ip: null | string;
    mac: null | string;
    role: null | string;
    stigid: null | string;
    target_key: null | string;
    tech_area: null | string;
    type: null | string;
    web_db_instance: null | string;
    web_db_site: null | string;
    web_or_database: null | string;
}

type ExtendedEvaluationFile = {
  evaluation: ContextualizedEvaluation;
};
