import { ControlStatus } from 'inspecjs'

// The hash that we will generally be working with herein
export type ControlStatusHash = {
    [key in ControlStatus | 'Waived']: number;
};

export type StatusHash = ControlStatusHash & {
    PassedTests: number; // from passed controls
    FailedTests: number;
    PassingTestsFailedControl: number; // number of passing tests from failed controls
    Waived: number;
};

export type ControlIDThresholdValues = Record<string, Record<string, string[]>>

// Define a new type for the repeated structure
export type StatusThreshold = {
    controls?: string[];
    min?: number;
    max?: number;
};

export type ThresholdValues = {
    compliance?: { min?: number; max?: number };
    passed?: {
        total: StatusThreshold;
        critical: StatusThreshold;
        high: StatusThreshold;
        medium: StatusThreshold;
        low: StatusThreshold;
    };
    failed?: {
        total: StatusThreshold;
        critical: StatusThreshold;
        high: StatusThreshold;
        medium: StatusThreshold;
        low: StatusThreshold;
    };
    skipped?: {
        total: StatusThreshold;
        critical: StatusThreshold;
        high: StatusThreshold;
        medium: StatusThreshold;
        low: StatusThreshold;
    };
    no_impact?: {
        total: StatusThreshold;
        critical: StatusThreshold;
        high: StatusThreshold;
        medium: StatusThreshold;
        low: StatusThreshold;
    };
    error?: {
        total: StatusThreshold;
        critical: StatusThreshold;
        high: StatusThreshold;
        medium: StatusThreshold;
        low: StatusThreshold;
    };
}
