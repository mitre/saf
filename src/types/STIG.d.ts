export interface STIG {
  CHECKLIST: CHECKLIST;
}
export interface CHECKLIST {
  ASSET?: Asset[] | null;
  STIGS?: STIGs[] | null;
}
export interface Asset {
  ROLE?: string[] | null;
  ASSET_TYPE?: string[] | null;
  HOST_NAME?: string[] | null;
  HOST_IP?: string[] | null;
  HOST_MAC?: string[] | null;
  HOST_FQDN?: string[] | null;
  TECH_AREA?: string[] | null;
  TARGET_KEY?: string[] | null;
  WEB_OR_DATABASE: boolean;
  WEB_DB_SITE?: string[] | null;
  WEB_DB_INSTANCE?: string[] | null;
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
  SID_NAME: string[];
  SID_DATA: string[];
}

export interface Vulnerability {
  Vuln_Num?: string;
  Severity?: string;
  Group_Title?: string;
  Rule_ID?: string;
  Rule_Ver?: string;
  Rule_Title?: string;
  Vuln_Discuss?: string;
  IA_Controls?: string;
  Check_Content?: string;
  Fix_Text?: string;
  False_Positives?: string;
  False_Negatives?: string;
  Documentable?: string;
  Mitigations?: string;
  Potential_Impact?: string;
  Third_Party_Tools?: string;
  Mitigation_Control?: string;
  Responsibility?: string;
  Security_Override_Guidance?: string;
  Check_Content_Ref?: string;
  Weight?: string;
  Class?: string;
  STIGRef?: string;
  TargetKey?: string;
  STIG_UUID?: string;
  CCI_REF?: string;
  STIG_DATA?: STIGAttributes[] | null;
  STATUS?: 'Open' | 'NotAFinding' | 'Not_Applicable' | 'Not_Reviewed';
  FINDING_DETAILS?: string;
  COMMENTS?: string;
  SEVERITY_OVERRIDE?: string;
  SEVERITY_JUSTIFICATION?: string;
}
export interface STIGAttributes {
  VULN_ATTRIBUTE: string[];
  ATTRIBUTE_DATA: string[];
}
