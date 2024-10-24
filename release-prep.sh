#!/bin/bash
# 1. Checkout master branch and pull latest commit
# Note: inform user what is about to happen (e.g. "this script will do x,y,x. Pre-reqs: a,b,c. Ready? y/n)
# Assumptions: This script is in the root directory of our repository, there are no existing changes to be stashed if on dife
# Provide more context ***
echo "executing git checkout"
git checkout main
echo "pulling main branch"
git pull origin main

# 2a. Bump SAF CLI version number in VERSION file and package.json given user input
echo "Enter the new version number for the SAF CLI release you are looking to publish: "
read version

echo "Updating the necessary files with new version number ${version}" 
echo $version > VERSION
jq ".version=\"$version\"" package.json > temp.json && mv temp.json package.json

# 2b cont. Update MITRE dependencies to latest versions
# Do not update @mitre/emass_client until further notice
packages=("@mitre/hdf-converters" "@mitre/heimdall-lite" "@mitre/inspec-objects")
# Loop through the packages
for package in "${packages[@]}"
do
  # Get the latest version of the package from npm
  latest_version=$(npm show "$package" version)
  # Get the current version of the package from package.json
  current_version=$(jq -r ".dependencies[\"$package\"]" package.json)
  # Compare the versions
  if [ "$latest_version" != "$current_version" ]
  then
    # If the versions are different, update the package
    echo "Updating $package from $current_version to $latest_version"
    jq ".dependencies[\"$package\"] = \"$latest_version\"" package.json > temp.json && mv temp.json package.json
  else
    echo "$package is up to date"
  fi
done

# 3. Delete node_modules if it exists, run npm install
echo "Checking if Node_Modules needs to be deleted"
if [ -d "node_modules" ]; then
    echo "Deleting existing node_modules directory"
    rm -rf node_modules
else 
    echo "node_modules directory not found, continuing with npm install"
fi
echo "Running npm install"
npm install 

# 4. Run npm pack and test, abort if tests return failures
echo "Running npm pack to create the tarball (.tgz) from the packages"
npm pack
echo "Running tests via npm run test"
npm run test
# $? holds exit status of last command run, npm run test returns non-zero exit status if all tests don't pass
if [ $? -ne 0 ]; then
    echo "Tests failed, aborting script"
    exit 1
fi

# Add changes to git
# Currently add all files with the "M" (modified) status
echo "Adding unstaged changes (VERSION, package.json) to the commit"
git status --porcelain | while  read -r line
do
    first_word=$(echo $line | cut -d ' ' -f 1)
    if [ "$first_word" = "M" ]; then
        second_word=$(echo $line | cut -d ' ' -f 2)
        echo "adding ${second_word} to git commit"
        git add $second_word
    fi
done

# Commit, tag, and push release
echo "Commit previously staged files"
git commit --signoff -m "${version}"
echo "Tag the new release with provided version number"
git tag -a -m "Release for version ${version}" $version
echo "Push the tagged commit to the main branch of the SAF CLI repository"
git push --atomic origin main $version

echo "The automated process of the release has completed. Please proceed to upload the artifacts from this commit in step 6 of the SAF CLI release instructions on the Github Wiki"
