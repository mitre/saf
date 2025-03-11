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
