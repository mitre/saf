/**
 * Enum for possible status values
 */
enum Status {
  Passed = "passed",
  Failed = "failed",
  Skipped = "skipped",
  NoImpact = "no_impact",
  Error = "error",
}

/**
 * Enum for possible severity values
 */
enum Severity {
  Critical = "critical",
  High = "high",
  Medium = "medium",
  Low = "low",
  None = "none",
}

/**
 * Interface for Control objects
 */
interface Control {
  hdf: {
    /**
     * Status of the control
     */
    status: Status;
    /**
     * Severity of the control
     */
    severity: Severity;
    /**
     * Segments of the control
     */
    segments: Segment[];
    /**
     * Whether the control is waived
     */
    waived: boolean;
  };
  data: {
    /**
     * ID of the control
     */
    id: string;
  };
}

/**
 * Interface for ContextualizedProfile objects
 */
interface ContextualizedProfile {
  /**
   * Controls contained in the profile
   */
  contains: Control[];
}

/**
 * Interface for Segment objects
 */
interface Segment {
  /**
   * Status of the segment
   */
  status: Status;
}

/**
 * Function to generate an object mapping severities to targets
 * @returns An object mapping severities to targets
 */
function generateSeverityTargetsObject(): Record<string, string[]> {
  const severities = Object.values(Severity);
  const statuses = Object.values(Status);
  return severities.reduce((obj, severity) => {
    obj[severity] = statuses.map(
      (status) => `${status}.${severity}.min`,
      `${status}.${severity}.max`
    );
    return obj;
  }, {} as Record<string, string[]>);
}

const severityTargetsObject = generateSeverityTargetsObject();

/**
 * Function to extract status counts from a profile
 * @param profile - The profile to extract status counts from
 * @param severity - The severity to filter by (optional)
 * @returns A map of status counts
 */
export function extractStatusCounts(
  profile: ContextualizedProfile,
  severity?: string
): Map<string, number> {
  const hash: Map<string, number> = new Map([
    ["Failed", 0],
    ["From Profile", 0],
    ["Not Applicable", 0],
    ["Not Reviewed", 0],
    ["Passed", 0],
    ["Profile Error", 0],
    ["PassedTests", 0],
    ["FailedTests", 0],
    ["PassingTestsFailedControl", 0],
    ["Waived", 0],
  ]);

  function incrementStatusCount(status: Status) {
    const count = hash.get(status.toString()) || 0;
    hash.set(status.toString(), count + 1);
  }

  function incrementPassedTestsCount(control: Control) {
    const count = hash.get("PassedTests") || 0;
    hash.set("PassedTests", count + (control.hdf.segments || []).length);
  }

  function incrementFailedTestsCount(control: Control) {
    const count = hash.get("FailedTests") || 0;
    hash.set(
      "FailedTests",
      count +
      (control.hdf.segments || []).filter((s) => s.status === Status.Failed)
        .length
    );
  }

  function incrementWaivedCount(control: Control) {
    const count = hash.get("Waived") || 0;
    hash.set("Waived", count + (control.hdf.segments?.length || 0));
  }

  for (const c of profile.contains.filter(
    (control) => control.extendedBy.length === 0
  )) {
    const control = c.root;
    const status: Status = control.hdf.status;
    const controlSeverity: Severity = control.hdf.severity;
    if (!severity || controlSeverity === severity) {
      incrementStatusCount(status);
      if (status === Status.Passed) {
        incrementPassedTestsCount(control);
      } else if (status === Status.Failed) {
        incrementFailedTestsCount(control);
      } else if (status === Status.NotApplicable && control.hdf.waived) {
        incrementWaivedCount(control);
      }
    }
  }

  return hash;
}

/**
 * Function to get a map of control IDs
 * @param profile - The profile to get control IDs from
 * @param thresholds - The thresholds to use (optional)
 * @returns A map of control IDs
 */
export function getControlIdMap(
  profile: ContextualizedProfile,
  thresholds: Record<string, string[]> = {}
): Record<string, string[]> {
  for (const c of profile.contains.filter(
    (control) => control.extendedBy.length === 0
  )) {
    const control = c.root;
    const severity = c.root.hdf.severity;
    const path = `${reverseStatusName(
      control.hdf.status
    )}.${severity}.controls`;
    const existingData = (_.get(thresholds, path) as string[]) || [];
    _.set(thresholds, path, [...existingData, control.data.id]);
  }

  return thresholds;
}
