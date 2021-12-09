Translate a SARIF JSON file into a Heimdall Data Format JSON file

SARIF level to HDF impact Mapping:
  SARIF level error -> HDF impact 0.7
  SARIF level warning -> HDF impact 0.5
  SARIF level note -> HDF impact 0.3
  SARIF level none -> HDF impact 0.1
  SARIF level not provided -> HDF impact 0.1 as default

Examples:
  saf normalize:sarif -i sarif-results.json -o output-hdf-name.json
