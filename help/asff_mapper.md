  asff_mapper translates AWS Security Finding Format results from JSON to HDF-formatted JSON so as to be viewable on Heimdall

Examples:

  heimdall_tools asff_mapper -i <asff-finding-json> -o <hdf-scan-results-json>
  heimdall_tools asff_mapper -i <asff-finding-json> --sh <standard-1-json> ... <standard-n-json> -o <hdf-scan-results-json>
