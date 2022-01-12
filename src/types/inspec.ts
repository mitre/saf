export interface InSpecControl {
    id: string;
    title: string;
    desc: string;
    rationale: string;
    impact: number;
    tags: {
        check?: string;
        fix?: string;
        severity?: string;
        gtitle?: string;
        gid?: string;
        satisfies?: string[];
        rid?: string;
        stig_id?: string;
        fix_id?: string;
        cci?: string[];
        legacy?: string[];
        nist?: string[];
        false_negatives?: string;
        false_positives?: string;
        documentable?: boolean;
        mitigations?: string;
        severity_override_guidance?: string;
        potential_impacts?: string;
        third_party_tools?: string;
        mitigation_controls?: string;
        responsibility?: string;
        ia_controls?: string;
        [key: string]: string | string[] | boolean | undefined;
    };
}

export interface InSpecMetaData {
    maintainer?: string;
    copyright?: string;
    copyright_email?: string;
    license?: string;
    version?: string;
}
