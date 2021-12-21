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

export type ThresholdValues = {
    compliance?: {min?: number; max?: number};
    passed?: {
      total: {min?: number; max?: number};
      critical: {min?: number; max?: number};
      high: {min?: number; max?: number};
      medium: {min?: number; max?: number};
      low: {min?: number; max?: number};
    };
    failed?: {
      total: {min?: number; max?: number};
      critical: {min?: number; max?: number};
      high: {min?: number; max?: number};
      medium: {min?: number; max?: number};
      low: {min?: number; max?: number};
    };
    skipped?: {
      total: {min?: number; max?: number};
      critical: {min?: number; max?: number};
      high: {min?: number; max?: number};
      medium: {min?: number; max?: number};
      low: {min?: number; max?: number};
    };
    no_impact?: {
      total: {min?: number; max?: number};
      critical: {min?: number; max?: number};
      high: {min?: number; max?: number};
      medium: {min?: number; max?: number};
      low: {min?: number; max?: number};
    };
    error?: {
      total: {min?: number; max?: number};
      critical: {min?: number; max?: number};
      high: {min?: number; max?: number};
      medium: {min?: number; max?: number};
      low: {min?: number; max?: number};
    };
  }
