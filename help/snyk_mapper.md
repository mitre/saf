  snyk_mapper translates an Snyk results JSON file into HDF format json to be viewable in Heimdall

  A separate HDF JSON is generated for each project reported in the Snyk Report.

Examples:
heimdall_tools snyk_mapper -j snyk_results.json -o output-file-prefix
