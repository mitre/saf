export interface CSVControl {
  '': string;
  CCI: string;
  Description: string;
  'IA Controls': string;
  Response: string;
  Service: string;
  Severity: string;
  Title: string;
  V_ID: string;
  Version: string;
  checkid: string;
  checktext: string;
  fixid: string;
  fixtext: string;
  ruleID: string;
}

export type ControlSetRow = {
  [key: string]: string;
};

export type ControlSetRows = ControlSetRow[];
