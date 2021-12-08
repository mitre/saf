  sonarqube_mapper pulls SonarQube vulnerabilities for the specified project name from the API, and outputs into an HDF JSON to be viewed within Heimdall

Examples:

  heimdall_tools sonarqube_mapper -n sonar_project_key -u http://sonar:9000 --auth YOUR_API_KEY -o scan_results.json
