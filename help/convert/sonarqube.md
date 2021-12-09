Pull SonarQube vulnerabilities for the specified project name from an API and convert into a Heimdall Data Format JSON file

Examples:

saf convert:sonarqube -n sonar_project_key -u http://sonar:9000 --auth YOUR_API_KEY -o scan_results.json
