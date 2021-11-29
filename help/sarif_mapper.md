  sarif_mapper translates a SARIF JSON file into HDF format JSON to be viewable in Heimdall

SARIF level to HDF impact Mapping:
  SARIF level error -> HDF impact 0.7
  SARIF level warning -> HDF impact 0.5
  SARIF level note -> HDF impact 0.3
  SARIF level none -> HDF impact 0.1
  SARIF level not provided -> HDF impact 0.1 as default

Examples:
heimdall_tools sarif_mapper [OPTIONS] -j <sarif-results-json> -o <hdf-scan-results.json>
