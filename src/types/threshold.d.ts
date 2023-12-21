import {ControlStatus} from 'inspecjs'

// The hash that we will generally be working with herein
export type ControlStatusHash = {
    [key in 'Waived' | ControlStatus]: number;
  };

export type StatusHash = ControlStatusHash & {
    FailedTests: number;
    PassedTests: number; // from passed controls
    PassingTestsFailedControl: number; // number of passing tests from failed controls
    Waived: number;
  };

export type ControlIDThresholdValues = Record<string, Record<string, string[]>>

export type ThresholdValues = {
    compliance?: {max?: number; min?: number};
    error?: {
      critical: {controls?: string[]; max?: number; min?: number};
      high: {controls?: string[]; max?: number; min?: number};
      low: {controls?: string[]; max?: number; min?: number};
      medium: {controls?: string[]; max?: number; min?: number};
      total: {controls?: string[]; max?: number; min?: number};
    };
    failed?: {
      critical: {controls?: string[]; max?: number; min?: number};
      high: {controls?: string[]; max?: number; min?: number};
      low: {controls?: string[]; max?: number; min?: number};
      medium: {controls?: string[]; max?: number; min?: number};
      total: {controls?: string[]; max?: number; min?: number};
    };
    no_impact?: {
      critical: {controls?: string[]; max?: number; min?: number};
      high: {controls?: string[]; max?: number; min?: number};
      low: {controls?: string[]; max?: number; min?: number};
      medium: {controls?: string[]; max?: number; min?: number};
      total: {controls?: string[]; max?: number; min?: number};
    };
    passed?: {
      critical: {controls?: string[]; max?: number; min?: number};
      high: {controls?: string[]; max?: number; min?: number};
      low: {controls?: string[]; max?: number; min?: number};
      medium: {controls?: string[]; max?: number; min?: number};
      total: {controls?: string[]; max?: number; min?: number};
    };
    skipped?: {
      critical: {controls?: string[]; max?: number; min?: number};
      high: {controls?: string[]; max?: number; min?: number};
      low: {controls?: string[]; max?: number; min?: number};
      medium: {controls?: string[]; max?: number; min?: number};
      total: {controls?: string[]; max?: number; min?: number};
    };
  }
