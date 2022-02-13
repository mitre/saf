import {ControlStatus} from 'inspecjs'

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

export type ThresholdValues = {
    compliance?: {min?: number; max?: number};
    passed?: {
      total: {controls?: string[]; min?: number; max?: number};
      critical: {controls?: string[]; min?: number; max?: number};
      high: {controls?: string[]; min?: number; max?: number};
      medium: {controls?: string[]; min?: number; max?: number};
      low: {controls?: string[]; min?: number; max?: number};
    };
    failed?: {
      total: {controls?: string[]; min?: number; max?: number};
      critical: {controls?: string[]; min?: number; max?: number};
      high: {controls?: string[]; min?: number; max?: number};
      medium: {controls?: string[]; min?: number; max?: number};
      low: {controls?: string[]; min?: number; max?: number};
    };
    skipped?: {
      total: {controls?: string[]; min?: number; max?: number};
      critical: {controls?: string[]; min?: number; max?: number};
      high: {controls?: string[]; min?: number; max?: number};
      medium: {controls?: string[]; min?: number; max?: number};
      low: {controls?: string[]; min?: number; max?: number};
    };
    no_impact?: {
      total: {controls?: string[]; min?: number; max?: number};
      critical: {controls?: string[]; min?: number; max?: number};
      high: {controls?: string[]; min?: number; max?: number};
      medium: {controls?: string[]; min?: number; max?: number};
      low: {controls?: string[]; min?: number; max?: number};
    };
    error?: {
      total: {controls?: string[]; min?: number; max?: number};
      critical: {controls?: string[]; min?: number; max?: number};
      high: {controls?: string[]; min?: number; max?: number};
      medium: {controls?: string[]; min?: number; max?: number};
      low: {controls?: string[]; min?: number; max?: number};
    };
  }
