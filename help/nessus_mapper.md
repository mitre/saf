  nessus_mapper translates an Nessus exported XML results file into HDF format json to be viewable in Heimdall

  The current iteration maps all plugin families except 'Policy Compliance'

  A separate HDF JSON is generated for each host reported in the Nessus Report.

Examples:
heimdall_tools nessus_mapper -x nessus_results.xml -o file-prefix
