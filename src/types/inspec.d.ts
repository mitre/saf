export interface InSpecControl {
    desc: string;
    descs: {[key: string]: string};
    id: string;
    impact: number;
    rationale?: string;
    ref?: string;
    refs?: string[];
    tags: {
        [key: string]: Record<string, string[]>[] | boolean | string | string[] | undefined;
        cci?: string[];
        check?: string;
        cis_controls?: Record<string, string[]>[];
        documentable?: boolean;
        false_negatives?: string;
        false_positives?: string;
        fix?: string;
        fix_id?: string;
        gid?: string;
        gtitle?: string;
        ia_controls?: string;
        legacy?: string[];
        mitigation_controls?: string;
        mitigations?: string;
        nist?: string[];
        potential_impacts?: string;
        responsibility?: string;
        rid?: string;
        satisfies?: string[];
        severity?: string;
        severity_override_guidance?: string;
        stig_id?: string;
        third_party_tools?: string;
    };
    title: string;
}

export interface InSpecMetaData {
    copyright?: string;
    copyright_email?: string;
    license?: string;
    maintainer?: string;
    version?: string;
}
