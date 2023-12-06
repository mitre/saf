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
    fileName: string;
    benchmark: {
      title: string | null;
      version: string | null;
      plaintext: string | null;
    };
    stigid: string | null;
    role: string | null;
    type: string | null;
    hostname: string | null;
    ip: string | null;
    mac: string | null;
    fqdn: string | null;
    tech_area: string | null;
    target_key: string | null;
    web_or_database: string | null;
    web_db_site: string | null;
    web_db_instance: string | null;
    [key: string]: string | null | Record<string, string | null>;
}

type ExtendedEvaluationFile = {
  evaluation: ContextualizedEvaluation;
};
