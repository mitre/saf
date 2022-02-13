export interface DisaStig {
    Benchmark: Benchmark;
}

export interface Benchmark {
    '@_xmlns:dc':           string;
    '@_xmlns:xsi':          string;
    '@_xmlns:cpe':          string;
    '@_xmlns:xhtml':        string;
    '@_xmlns:dsig':         string;
    '@_xsi:schemaLocation': string;
    '@_id':                 string;
    '@_xml:lang':           string;
    '@_xmlns':              string;
    status:                 Status;
    title:                  string;
    description:            string;
    notice:                 Notice;
    'front-matter':         Matter;
    'rear-matter':          Matter;
    reference:              BenchmarkReference;
    'plain-text':           PlainText[];
    version:                number;
    Profile:                Group[];
    Group:                  Group[];
}

export interface Group {
    '@_id':      string;
    title:       string;
    description: string;
    Rule?:       Rule;
    select?:     Select[];
}

export interface Rule {
    '@_id':       string;
    '@_weight':   string;
    '@_severity': string;
    version:      string;
    title:        string;
    description:  string;
    reference:    RuleReference;
    ident:        Ident[];
    fixtext:      Fixtext;
    fix:          Fix;
    check:        Check;
}

export interface Check {
    '@_system':          string;
    'check-content-ref': CheckContentRef;
    'check-content':     string;
}

export interface CheckContentRef {
    '@_href': string;
    '@_name': string;
}

export interface Fix {
    '@_id': string;
}

export interface Fixtext {
    '#text':    string;
    '@_fixref': string;
}

export interface Ident {
    '#text':    string;
    '@_system': string;
}

export interface RuleReference {
    'dc:title':      string;
    'dc:publisher':  string;
    'dc:type':       string;
    'dc:subject':    string;
    'dc:identifier': number;
}

export interface Select {
    '@_idref':    string;
    '@_selected': string;
}

export interface Matter {
    '@_xml:lang': string;
}

export interface Notice {
    '@_id':       string;
    '@_xml:lang': string;
}

export interface PlainText {
    '#text': string;
    '@_id':  string;
}

export interface BenchmarkReference {
    '@_href':       string;
    'dc:publisher': string;
    'dc:source':    string;
}

export interface Status {
    '#text':  string;
    '@_date': Date;
}

export interface DecodedDescription {
    VulnDiscussion?: string;
    FalsePositives?: string;
    FalseNegatives?: string;
    Documentable?: boolean;
    Mitigations?: string;
    SeverityOverrideGuidance?: string;
    PotentialImpacts?: string;
    ThirdPartyTools?: string;
    MitigationControl?: string;
    MitigationControls?: string;
    Responsibility?: string;
    IAControls?: string;
}
