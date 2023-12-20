export interface STIG {
  CHECKLIST: CHECKLIST;
}
export interface CHECKLIST {
  ASSET?: Asset[] | null;
  STIGS?: STIGs[] | null;
}
export interface Asset {
  ASSET_TYPE?: null | string[];
  HOST_FQDN?: null | string[];
  HOST_IP?: null | string[];
  HOST_MAC?: null | string[];
  HOST_NAME?: null | string[];
  ROLE?: null | string[];
  TARGET_KEY?: null | string[];
  TECH_AREA?: null | string[];
  WEB_DB_INSTANCE?: null | string[];
  WEB_DB_SITE?: null | string[];
  WEB_OR_DATABASE: boolean;
}
export interface STIGs {
  iSTIG?: STIGHolder[] | null;
}
export interface STIGHolder {
  STIG_INFO?: STIGInfo[] | null;
  VULN?: Vulnerability[] | null;
}
export interface STIGInfo {
  SI_DATA?: SIData[] | null;
}
export interface SIData {
  SID_DATA: string[];
  SID_NAME: string[];
}

export interface Vulnerability {
  CCI_REF?: string;
  COMMENTS?: string;
  Check_Content?: string;
  Check_Content_Ref?: string;
  Class?: string;
  Documentable?: string;
  FINDING_DETAILS?: string;
  False_Negatives?: string;
  False_Positives?: string;
  Fix_Text?: string;
  Group_Title?: string;
  IA_Controls?: string;
  Mitigation_Control?: string;
  Mitigations?: string;
  Potential_Impact?: string;
  Responsibility?: string;
  Rule_ID?: string;
  Rule_Title?: string;
  Rule_Ver?: string;
  SEVERITY_JUSTIFICATION?: string;
  SEVERITY_OVERRIDE?: string;
  STATUS?: 'Not_Applicable' | 'Not_Reviewed' | 'NotAFinding' | 'Open';
  STIG_DATA?: STIGAttributes[] | null;
  STIG_UUID?: string;
  STIGRef?: string;
  Security_Override_Guidance?: string;
  Severity?: string;
  TargetKey?: string;
  Third_Party_Tools?: string;
  Vuln_Discuss?: string;
  Vuln_Num?: string;
  Weight?: string;
}
export interface STIGAttributes {
  ATTRIBUTE_DATA: string[];
  VULN_ATTRIBUTE: string[];
}
