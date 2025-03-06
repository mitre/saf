#-----------------------------------------------------------------------------#
#               S U P P O R T I N G  F U N C T I O N S                        #
#----------------------------------------------------------------------------<#
function Red {
  process { Write-Host $_ -ForegroundColor Red }
}
function Green {
  process { Write-Host $_ -ForegroundColor Green }
}
function Yellow {
  process { Write-Host $_ -ForegroundColor Yellow }
}

function Cyan {
  process { Write-Host $_ -ForegroundColor Cyan }
}
function TerminateScript {
  Write-Host "--- Script Terminated ---" -ForegroundColor Red
  exit
}

#-----------------------------------------------------------------------------#
#                       S T A R T  of  S C R I P T                            #
#-----------------------------------------------------------------------------#
Write-Output "#------------------------------------------------------------------------------" | Yellow
Write-Output "# This PowerShell script automates the preliminary steps necessary to conduct  " | Yellow
Write-Output "# a SAF CLI release. The script performs the following tasks:                  " | Yellow
Write-Output "#    - Retrieve the latest main content                                        " | Yellow
Write-Output "#    - Bump the SAF CLI version number in the package.json file (version tag)  " | Yellow
Write-Output "#    - Updates MITRE dependencies to latest versions                           " | Yellow
Write-Output "#    - Remove the 'node_modules' if they exists                                " | Yellow
Write-Output "#    - Install all supporting modules                                          " | Yellow
Write-Output "#    - Build and run all tests                                                 " | Yellow
Write-Output "#    - Add unstaged files to the staging area (package.json) or any other file " | Yellow
Write-Output "#      with the modified flag (M) set                                          " | Yellow
Write-Output "#    - Commit previously staged files with 'signoff' tag (new version number)  " | Yellow
Write-Output "#    - Tag the commit with new release version                                 " | Yellow
Write-Output "#    - Push and updated the repository three references (new version number)   " | Yellow
Write-Output "# Prerequisites:                                                               " | Yellow
Write-Output "#    - Before executing the preparatory script ensure that the you're on a     " | Yellow
Write-Output "#      directory containing the most recent commit of the SAF CLI.             " | Yellow
Write-Output "#    - Windows PowerShell 6. PowerShell version less than 6.0.0 will malformed " | Red
Write-Output "#      the output, pretty print does not work properly.                        " | Red
Write-Output "#      (see PowerShell Prettier formatting for ConvertTo-Json output PR #2736) " | Red
Write-Output "#------------------------------------------------------------------------------" | Yellow
Write-Host

# Common color variables declaration
$ESC = [char]27
$YELLOW = $ESC+'[33m'
$CYAN = $ESC+'[36m'

# Check PowerShell version, requires 6 or higher
$currentVersion = $PSVersionTable.PSVersion # Check PowerShell version
$requiredVersion = [version]"6.0.0"

if ($currentVersion -ge $requiredVersion) {
  Write-Output "Using PowerShell version: $currentVersion" | Green
} else {
  Write-Output "Installed PowerShell version:  $currentVersion" | Red
  Write-Output "This script requires PowerShell version >= to: $requiredVersion" | Red
  TerminateScript
}


#------------------------------------------------------------------------------
# Start the Script
Write-Output "Press enter to continue - or type exit/EXIT to terminate" | Green
$srtInput = Read-Host
if ( "exit", "Exit", "EXIT" -Contains $srtInput ) {
  TerminateScript
}

#------------------------------------------------------------------------------
# Retrieve the latest main content from github 
Write-Output "Retrieve the latest main content from github..." | Yellow
git checkout main
Write-Output "Done" | Green
Write-Host

#------------------------------------------------------------------------------
# Pull the main branch content from github 
Write-Output "Pull the main branch from github..." | Yellow
$Error.Clear()
git pull origin main
if ($LastExitCode -gt 0) {
  Write-Output "  Failed to Pull the main branch from github" | Red
  TerminateScript
}
Write-Output "Done" | Green
Write-Host

#------------------------------------------------------------------------------
# Update the version tag with the next value (package.json file)
Write-Output "Increment the SAF CLI version number..." | Yellow

# 1. Read the JSON file
$jsonContent = Get-Content -Path "package.json" -Raw
$jsonObject = $jsonContent | ConvertFrom-Json
$version = $jsonObject.version 

# 2. Update the version (Increment the build number)
$versionArray = $version.Split(".")            # Split the version (array)
$versionArray[-1] = [int]$versionArray[-1] + 1 # Increment the last element (patch version)
$newVersion = $versionArray -join "."          # Join back into a string

# 3. Ask the user to update or confirm the new version number
Write-Output "$YELLOW Current SAF CLI version is: $version$ESC[0m"
$prompt = "$CYAN Enter the new SAF CLI version number (default is: $newVersion)$ESC[0m"
do {
  if (!($nextVersion = Read-Host -Prompt $prompt)) {
    $nextVersion = $newVersion 
  }
  $srtInput = Read-Host -Prompt "$CYAN Use version $nextVersion [y/n] exit to quit$ESC[0m"
  if ( "exit", "Exit","EXIT" -Contains $srtInput ) { TerminateScript }
} until ($srtInput -eq 'y')

Write-Output "$CYAN Setting SAF CLI version to: $nextVersion" | Green

# 4. Update the package.json and VERSION files
$jsonObject.version = $nextVersion 
$jsonObject | ConvertTo-Json -Depth 3 | Set-Content -Path "package.json"
[System.IO.File]::WriteAllText("VERSION", $nextVersion)
Write-Output "Done" | Green
Write-Host

#------------------------------------------------------------------------------
# Update MITRE dependencies to latest version
Write-Output "Update MITRE dependencies to latest version..." | Yellow
# List of MITRE packages to be checked - Add as needed
$packages = "@mitre/hdf-converters", "@mitre/heimdall-lite", "@mitre/inspec-objects", "@mitre/emass_client"
foreach ($package in $packages) {
  Write-Output "  Processing package: $package" | Cyan
  # Get the latest version of the package from npm
  $latest_version = npm show "$package" version
  # Get the current version of the package from package.json
  $current_version = $jsonObject.dependencies.$package
  # Compare and update the package.json as needed
  if ($latest_version -ne $current_version) {
    Write-Output "    Updated package to version: $latest_version" | Yellow
    $jsonObject.dependencies.$package = $latest_version
    $jsonObject | ConvertTo-Json -Depth 3 | Set-Content -Path "package.json"
  } else {
    Write-Output "    Package version is current: $current_version" | Cyan
  }
}
Write-Output "Done" | Green
Write-Host


#------------------------------------------------------------------------------
# Delete node_modules if it exists, install all supporting modules
Write-Output "Delete node_modules if it exists, install supporting modules..." | Yellow
$nodeFolder = "node_modules"
if (Test-Path $nodeFolder) {
  Remove-Item -Path $nodeFolder -Recurse
  Write-Output "  Node modules folder removed" | Cyan
}

Write-Output "  Installing node modules" | Cyan
npm install
Write-Output "Done" | Green
Write-Host

#------------------------------------------------------------------------------
# Build the SAF CLI package and run all tests
Write-Output "Build the SAF CLI package and run all tests..." | Yellow
Write-Output "  Building the SAF CLI package" | Cyan
npm pack

Write-Output "  Running the SAF CLI tests" | Cyan
$Error.Clear()
npm run test
if ($Error.Count -gt 0) {
  Write-Output "  Failed the SAF CLI test(s)" | Red
  TerminateScript
}
Write-Output "Done" | Green
Write-Host

#------------------------------------------------------------------------------
# Add unstaged files to the staging area - Files with modified flag (M) set
Write-Output "Add unstaged files to the staging area..." | Yellow
# Get the output of git status --porcelain
$gitStatus = git status --porcelain

# Process each line in the output
$gitStatus.Split("`n") | ForEach-Object {
    $line = $_.Trim()
    # Split the line into status and filename
    $firstWord, $secondWord = $line -split '\s+', 2
    # Check if the first word is "M" (modified)
    if ($firstWord -eq "M") {
      Write-Output "  Adding $secondWord to git commit" | Cyan
      git add $secondWord
    }
}
Write-Output "Done" | Green
Write-Host

#------------------------------------------------------------------------------
# Commit, tag, and push release to GitHub
Write-Output "Commit, tag, and push release to GitHub..." | Yellow

# Commit the previously staged files
Write-Output "  Committing previously staged files with 'signoff' tag" | Cyan
git commit --signoff -m "$nextVersion"

# Tag the new release with the provided version number
Write-Output "  Tagging the new release with version $nextVersion" | Cyan
git tag -a -m "Release for version $nextVersion" $nextVersion

# Push the tagged commit to the main branch of the repository
Write-Output "  Pushing atomic to the main branch with version $nextVersion" | Cyan
git push --atomic origin main $nextVersion

Write-Output "Done" | Green
Write-Host

Write-Output "╔══════════════════════════════════════════════════════════════════╗" | Green
Write-Output "║  ******* SAF CLI pre-release automated process finished *******  ║" | Green
Write-Output "║Please proceed to the SAF CLI GitHub Wiki to complete the release.║" | Green
Write-Output "╚══════════════════════════════════════════════════════════════════╝" | Green
