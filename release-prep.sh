#!/bin/bash

#-----------------------------------------------------------------------------#
#               S U P P O R T I N G  F U N C T I O N S                        #
#----------------------------------------------------------------------------<#
RESET="\e[0m"
CYAN="\e[36m"

# Function to print in color
PrintColor() {
  local color=$1
  local text=$2
  case "$color" in
    "Yellow") echo -e "\033[33m$text\033[0m" ;;  # Yellow
    "Cyan")   echo -e "\033[36m$text\033[0m" ;;  # Cyan
    "Red")    echo -e "\033[31m$text\033[0m" ;;  # Red
    "Green")  echo -e "\033[32m$text\033[0m" ;;  # Green
    *) echo "$text" ;;                           # Default (no color)
  esac
}

# Define TerminateScript function
TerminateScript() {
  PrintColor "Red" "--- Script Terminated ---"
  exit 0  # Exit the script
}

#-----------------------------------------------------------------------------#
#                       S T A R T  of  S C R I P T                            #
#-----------------------------------------------------------------------------#
PrintColor "Yellow" "#------------------------------------------------------------------------------"
PrintColor "Yellow" "# This PowerShell script automates the preliminary steps necessary to conduct  "
PrintColor "Yellow" "# a SAF CLI release. The script performs the following tasks:                  "
PrintColor "Yellow" "#    - Retrieve the latest main content                                        "
PrintColor "Yellow" "#    - Bump the SAF CLI version number in the package.json file (version tag)  "
PrintColor "Yellow" "#    - Update MITRE dependencies to latest versions                            "
PrintColor "Yellow" "#    - Remove the 'node_modules' if they exists                                "
PrintColor "Yellow" "#    - Install all supporting modules                                          "
PrintColor "Yellow" "#    - Build and run all tests                                                 "
PrintColor "Yellow" "#    - Add unstaged files to the staging area (package.json) or any other file "
PrintColor "Yellow" "#      with the modified flag (M) set                                          "
PrintColor "Yellow" "#    - Commit previously staged files with 'signoff' tag (new version number)  "
PrintColor "Yellow" "#    - Tag the commit with new release version                                 "
PrintColor "Yellow" "#    - Push and updated the repository three references (new version number)   "
PrintColor "Yellow" "# Prerequisites:                                                               "
PrintColor "Yellow" "#    - Before executing the preparatory script ensure that the you're on a     "
PrintColor "Yellow" "#      directory containing the most recent commit of the SAF CLI.             "
PrintColor "Yellow" "#------------------------------------------------------------------------------"

#------------------------------------------------------------------------------
# Start the Script
PrintColor "Green" "Press enter to continue - or type exit/EXIT to terminate"
read srtInput # Read user input
# Check if input is 'exit', 'Exit', or 'EXIT'
if [[ "$srtInput" == "exit" || "$srtInput" == "Exit" || "$srtInput" == "EXIT" ]]; then
  TerminateScript
fi

#------------------------------------------------------------------------------
# Retrieve the latest main content from github 
PrintColor "Yellow" "Retrieve the latest main content from github..."
git checkout main
PrintColor "Green" "Done"
echo

#------------------------------------------------------------------------------
# Pull the main branch content from github 
PrintColor "Yellow" "Pull the main branch from github..."
git pull origin main
if [ $? -ne 0 ]; then
  PrintColor "Red" "  Failed to Pull the main branch from github"
  TerminateScript
fi
PrintColor "Green" "Done"
echo

#------------------------------------------------------------------------------
# Update the version tag with the next value (package.json file)
PrintColor "Yellow" "Increment the SAF CLI version number..."

# 1. Read the JSON file
json_content=$(cat "package.json")
version=$(echo "$json_content" | jq -r '.version')

# 2. Update the version (Increment the build number)
IFS='.' read -r -a version_array <<< "$version" # Split the version into an array
version_array[2]=$((version_array[2] + 1))      # Increment the last element (patch version)
new_version="${version_array[0]}.${version_array[1]}.${version_array[2]}" # Join back into a string

# 3. Ask the user to update or confirm the new version number
PrintColor "Cyan" "Current SAF CLI version is: $version"
prompt="Enter the new SAF CLI version number (default is: $new_version)"
while true; do
  read -p "$(echo -e ${CYAN}$prompt: ${RESET})" next_version
  if [ -z "$next_version" ]; then
    next_version=$new_version
  fi

  # Ask for confirmation
  read -p "$(echo -e ${CYAN}Use version $next_version [y/n] exit to quit: ${RESET})" srtInput
  if [[ "$srtInput" =~ ^(exit|Exit|EXIT)$ ]]; then
    TerminateScript
  elif [ "$srtInput" == "y" ]; then
    break
  fi
done
PrintColor "Green" "Setting SAF CLI version to: $next_version"

# 4. Update the package.json and VERSION files
updated_json=$(echo "$json_content" | jq --arg version "$next_version" '.version = $version')
echo "$updated_json" > package.json
echo "$next_version" > VERSION

PrintColor "Green" "Done"
echo

#------------------------------------------------------------------------------
# Update MITRE dependencies to latest version
PrintColor "Yellow" "Update MITRE dependencies to latest version..."
# List of MITRE packages to be checked - Add as needed
# NOTE: Do not update @mitre/emass_client until further notice
packages=("@mitre/hdf-converters" "@mitre/heimdall-lite" "@mitre/inspec-objects")

# Iterate over each package
for package in "${packages[@]}"; do
  PrintColor "Cyan" "  Processing package: $package"
  # Get the latest version of the package from npm
  latest_version=$(npm show "$package" version)
  # Get the current version from package.json
  current_version=$(jq -r ".dependencies[\"$package\"]" package.json)
  # Compare and update package.json as needed
  if [[ "$latest_version" != "$current_version" ]]; then
    PrintColor "Yellow" "    Updated package to version: $latest_version"
    # Update the package version in package.json
    jq ".dependencies[\"$package\"] = \"$latest_version\"" package.json > temp.json && mv temp.json package.json
  else
    PrintColor "Cyan" "    Package version is current: $current_version"
  fi
done
PrintColor "Green" "Done"
echo


#------------------------------------------------------------------------------
# Delete node_modules if it exists, install all supporting modules
PrintColor "Yellow" "Delete node_modules if it exists, install supporting modules..."
if [ -d "node_modules" ]; then
  PrintColor "Cyan" "  Removing the node_modules directory"
  rm -rf node_modules
fi

PrintColor "Cyan" "  Installing node modules"
npm install 
PrintColor "Green" "Done"
echo

#------------------------------------------------------------------------------
# Build the SAF CLI package and run all tests
PrintColor "Yellow" "Build the SAF CLI package and run all tests..."
PrintColor "Cyan" "  Building the SAF CLI package"
npm pack

PrintColor "Cyan" "  Running the SAF CLI tests"
npm run test
# $? holds exit status of last command run, npm run test returns non-zero exit status if all tests don't pass
if [ $? -ne 0 ]; then
  PrintColor "Red" "  Failed the SAF CLI test(s)"
  TerminateScript
fi
PrintColor "Green" "Done"
echo

#------------------------------------------------------------------------------
# Add unstaged files to the staging area - Files with modified flag (M) set
PrintColor "Yellow" "Add unstaged files to the staging area..."
git status --porcelain | while  read -r line
do
    first_word=$(echo $line | cut -d ' ' -f 1)
    if [ "$first_word" = "M" ]; then
      second_word=$(echo $line | cut -d ' ' -f 2)
      PrintColor "Cyan" "  Adding $second_word to git commit"
      git add $second_word
    fi
done
PrintColor "Green" "Done"
echo

#------------------------------------------------------------------------------
# Commit, tag, and push release to GitHub
PrintColor "Yellow" "Commit, tag, and push release to GitHub..."

# Commit the previously staged files
PrintColor "Cyan" "  Committing previously staged files with 'signoff' tag"
git commit --signoff -m "${version}"

# Tag the new release with the provided version number
PrintColor "Cyan" "  Tagging the new release with version $version"
git tag -a -m "Release for version ${version}" $version

# Push the tagged commit to the main branch of the repository
PrintColor "Cyan" "  Pushing atomic to the main branch with version $version"
git push --atomic origin main $version

PrintColor "Green" "Done"
echo

PrintColor "Green" "╔══════════════════════════════════════════════════════════════════╗"
PrintColor "Green" "║  ******* SAF CLI pre-release automated process finished *******  ║"
PrintColor "Green" "║Please proceed to the SAF CLI GitHub Wiki to complete the release.║"
PrintColor "Green" "╚══════════════════════════════════════════════════════════════════╝"
