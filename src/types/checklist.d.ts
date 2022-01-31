import {ContextualizedEvaluation} from 'inspecjs'

export interface ChecklistControl {
    vid: string;
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

type ExtendedEvaluationFile = {
    evaluation: ContextualizedEvaluation;
    fileName: string;
    hostname: string;
    ip: string;
    mac: string;
    fqdn: string;
};
