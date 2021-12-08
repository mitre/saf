Translate a Nessus XML results file into a Heimdall Data Format JSON file

  The current iteration maps all plugin families except 'Policy Compliance'

  A separate HDF JSON is generated for each host reported in the Nessus Report.

Examples:
  saf convert:nessus -x nessus_results.xml -o file-prefix
