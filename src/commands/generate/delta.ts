import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import { processInSpecProfile, processOVAL, UpdatedProfileReturn, updateProfileUsingXCCDF, processXCCDF} from '@mitre/inspec-objects'

// TODO: We shouldn't have to import like this, open issue to clean library up for inspec-objects
// test failed in updating inspec-objects to address high lvl vuln
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import Control from '@mitre/inspec-objects/lib/objects/control'

import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import fse from 'fs-extra'
import { match } from 'assert'
//import Fuse from 'fuse.js';

export default class GenerateDelta extends Command {
  static description = 'Update an existing InSpec profile with updated XCCDF guidance'

  static flags = {
    help: Flags.help({char: 'h'}),
    inspecJsonFile: Flags.string({char: 'J', required: true, description: 'Input execution/profile JSON file - can be generated using the "inspec json <profile path> | jq . > profile.json" command'}),
    xccdfXmlFile: Flags.string({char: 'X', required: true, description: 'The XCCDF XML file containing the new guidance - in the form of .xml file'}),
    ovalXmlFile: Flags.string({char: 'O', required: false, description: 'The OVAL XML file containing definitions used in the new guidance - in the form of .xml file'}),
    output: Flags.string({char: 'o', required: true, description: 'The output folder for the updated profile - if it is not empty, it will be overwritten'}),
    report: Flags.string({char: 'r', required: false, description: 'Output markdown report file - must have an extension of .md'}),
    idType: Flags.string({
      char: 'T',
      required: false,
      default: 'rule',
      options: ['rule', 'group', 'cis', 'version'],
      description: "Control ID Types: 'rule' - Vulnerability IDs (ex. 'SV-XXXXX'), 'group' - Group IDs (ex. 'V-XXXXX'), 'cis' - CIS Rule IDs (ex. C-1.1.1.1), 'version' - Version IDs (ex. RHEL-07-010020 - also known as STIG IDs)",
    }),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
    // New flag -M for whether to try mapping controls to new profile
    runMapControls: Flags.boolean({char: 'M', required: false, default: false, description: 'Run the mapControls function'}),
  }

  static examples = [
    'saf generate delta -J ./the_profile_json_file.json -X ./the_xccdf_guidance_file.xml  -o the_output_directory -O ./the_oval_file.xml -T group -r the_update_report_file.md -L debug',
  ]

  async run() { // skipcq: JS-0044
    const {flags} = await this.parse(GenerateDelta)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    logger.warn("'saf generate delta' is currently a release candidate. Please report any questions/bugs to https://github.com/mitre/saf/issues.")

    let existingProfile: any | null = null
    let updatedXCCDF: any = {}
    let ovalDefinitions: any = {}

    let processedXCCDF: any = {}

    let markDownFile = ''
    let outputProfileFolderPath = ''

    // Process the Input execution/profile JSON file
    try {
      if (fs.lstatSync(flags.inspecJsonFile).isFile()) {
        const inspecJsonFile = flags.inspecJsonFile
        logger.debug(`Loading ${inspecJsonFile} as Profile JSON/Execution JSON`)
        existingProfile = processInSpecProfile(fs.readFileSync(inspecJsonFile, 'utf8'))
        logger.debug(`Loaded ${inspecJsonFile} as Profile JSON/Execution JSON`)
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`ERROR: No entity found for: ${flags.inspecJsonFile}. Run the --help command to more information on expected input files.`)
        throw error
      } else {
        logger.error(`ERROR: Unable to process Input execution/profile JSON ${flags.inspecJsonFile} because: ${error}`)
        throw error
      }
    }

    // Process the XCCDF XML file containing the new/updated profile guidance
    try {
      if (fs.lstatSync(flags.xccdfXmlFile).isFile()) {
        const xccdfXmlFile = flags.xccdfXmlFile
        const inputFile = fs.readFileSync(xccdfXmlFile, 'utf8')
        const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()
        if (inputFirstLine.includes('xccdf')) {
          logger.debug(`Loading ${xccdfXmlFile} as XCCDF`)
          updatedXCCDF = inputFile
          logger.debug(`Loaded ${xccdfXmlFile} as XCCDF`)
        } else {
          logger.error(`ERROR: Unable to load ${xccdfXmlFile} as XCCDF`)
          throw new Error('Cannot load XCCDF file')
        }

        logger.debug(`Loaded ${xccdfXmlFile} as XCCDF`)
      } else {
        throw new Error('No benchmark (XCCDF) file was provided.')
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`ERROR: No entity found for: ${flags.xccdfXmlFile}. Run the --help command to more information on expected input files.`)
        throw error
      } else {
        logger.error(`ERROR: Unable to process the XCCDF XML file ${flags.xccdfXmlFile} because: ${error}`)
        throw error
      }
    }

    // Process the OVAL XML file
    try {
      if (flags.ovalXmlFile) {
        if (fs.lstatSync(flags.ovalXmlFile).isFile()) {
          const ovalXmlFile = flags.ovalXmlFile
          const inputFile = fs.readFileSync(ovalXmlFile, 'utf8')
          const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()

          if (inputFirstLine.includes('oval_definitions')) {
            logger.debug(`Loading ${ovalXmlFile} as OVAL`)
            ovalDefinitions = processOVAL(inputFile)
            logger.debug(`Loaded ${ovalXmlFile} as OVAL`)
          } else {
            logger.error(`ERROR: Unable to load ${ovalXmlFile} as OVAL`)
            throw new Error('Cannot load OVAL file')
          }
        } else {
          logger.error(`ERROR: An OVAL flag option was detected, but no file was provided, received: ${flags.ovalXmlFile}`)
          throw new Error('No OVAL file detected')
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`ERROR: No entity found for: ${flags.ovalXmlFile}. Run the --help command to more information on expected input files.`)
        throw error
      } else {
        logger.error(`Unable to process the OVAL XML file ${flags.ovalXmlFile} because: ${error}`)
        throw error
      }
    }

    console.log("TEST BEFORE RUN")
    try {
      if (flags.runMapControls) {
        console.log("test DURING run")
        // Process XCCDF of new profile to get controls
        processedXCCDF = processXCCDF(updatedXCCDF, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
              // profile = processXCCDF(xccdf, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
 
        // Use existingProfile as it processes the existing inspec profile already
        let mappedControls = this.mapControls(existingProfile, processedXCCDF)

      }
    }
    catch (error: any) {
      logger.error(`ERROR: Could not process runMapControls ${flags.runMapControls}. Check the --help command for more information on the -o flag.`)
      throw error
    }

    // TODO: Modify the output report to include the mapping of controls and describe what was mapped
    // Process the output folder
    try {
      // Create the folder if it doesn't exist
      if (!fs.existsSync(flags.output)) {
        fs.mkdirSync(path.join(flags.output), {recursive: true})
      }

      if (path.basename(flags.output) === 'controls') {
        logger.debug(`Deleting existing profile folder ${flags.output}`)
        fse.emptyDirSync(flags.output)
        outputProfileFolderPath = path.dirname(flags.output)
      } else {
        const controlDir = path.join(flags.output, 'controls')
        if (fs.existsSync(controlDir)) {
          logger.debug(`Deleting content within existing controls folder within the profile folder ${flags.output}`)
          fse.emptyDirSync(controlDir)
        } else {
          fse.mkdirSync(controlDir)
        }

        outputProfileFolderPath = flags.output
      }
    } catch (error: any) {
      logger.error(`ERROR: Could not process output ${flags.output}. Check the --help command for more information on the -o flag.`)
      throw error
    }
    // Set the report markdown file location
    if (flags.report) {
      if (fs.existsSync(flags.report) && fs.lstatSync(flags.report).isDirectory()) {
        // Not a file - directory provided
        markDownFile = path.join(flags.report, 'delta.md')
      } else if (fs.existsSync(flags.report) && fs.lstatSync(flags.report).isFile()) {
        // File name provided and exists - will be overwritten
        markDownFile = flags.report
      } else if (path.extname(flags.report) === '.md') {
        markDownFile = flags.report
      } else {
        markDownFile = path.join(outputProfileFolderPath, 'delta.md')
      }
    }

    // If all variables have been satisfied, we can generate the delta
    if (existingProfile && updatedXCCDF) {
      let updatedResult: UpdatedProfileReturn
      logger.debug(`Processing XCCDF Benchmark file: ${flags.input} using ${flags.idType} id.`)
      const idTypes = ['rule', 'group', 'cis', 'version']
      if (idTypes.includes(flags.idType)) {
        updatedResult = updateProfileUsingXCCDF(existingProfile, updatedXCCDF, flags.idType as 'cis' | 'version' | 'rule' | 'group', logger, ovalDefinitions)
      } else {
        logger.error(`ERROR: Invalid ID Type: ${flags.idType}. Check the --help command for the available ID Type options.`)
        throw new Error('Invalid ID Type')
      }

      logger.debug('Computed the delta between the existing profile and updated benchmark.')

      updatedResult.profile.controls.forEach(control => {
        logger.debug(`Writing updated control ${control.id}.`)
        fs.writeFileSync(path.join(outputProfileFolderPath, 'controls', `${control.id}.rb`), control.toRuby())
      })

      logger.info(`Writing delta file for ${existingProfile.title}`)
      fs.writeFileSync(path.join(outputProfileFolderPath, 'delta.json'), JSON.stringify(updatedResult.diff, null, 2))

      if (flags.report) {
        logger.debug('Writing report markdown file')
        fs.writeFileSync(path.join(markDownFile), updatedResult.markdown)
      }
    } else {
      if (!existingProfile) {
        logger.error('ERROR: Could not generate delta because the existingProfile variable was not satisfied.')
      }

      if (!updatedXCCDF) {
        logger.error('ERROR: Could not generate delta because the updatedXCCDF variable was not satisfied.')
      }
    }
  }

/**
 * Maps controls from an old profile to a new profile by updating the control IDs
 * based on matching SRG IDs and titles.
 *
 * @param oldProfile - The profile containing the old controls.
 * @param newProfile - The profile containing the new controls.
 *
 * This method uses Fuse.js for fuzzy searching to find matching controls in the new profile
 * based on the SRG ID (`tags.gtitle`). If a match is found and the titles match, the old control's
 * ID is updated to the new control's ID.
 *
 * Example usage:
 * ```typescript
 * const oldProfile = processInSpecProfile(fs.readFileSync(inspecJsonFile, 'utf8'))
 * const newProfile = processXCCDF(updatedXCCDF, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
 * const generateDelta = new GenerateDelta()
 * generateDelta.mapControls(oldProfile, newProfile);
 * ```
 */
  async mapControls(oldProfile: Profile, newProfile: Profile): Promise<object>{
/*
If a control isn't found to have a match at all, then req is missing or has been dropped
Delta *should* be removing it automatically

CLI Table Generator for selecting best matches
*/
    //console.log(newProfile.supports)
  // Todo: use the logger. Debug logging, error logging.
  // Use a debugger to step through code and see what's happening

    let oldControls: Control[] = oldProfile.controls
    let newControls: Control[] = newProfile.controls

    // Get existing controls into an array of control-type objects with id, title, description
    // SRG ID is the common ID for identical controls b/w all profiles
    // group by SRG ID

/*
Process: 
(1) For each control in oldControls, find all controls in new controls with an equal SRG ID (gtitle property in tags)
(2) If there is only one control with the same SRG ID, compare the titles of the two controls. If same, overwrite gid of old control with gid of new control
*/

    // complication: a single rule gets split into multiple checks

    const { default: Fuse } = await import('fuse.js');

    const fuseOptions = {
      // isCaseSensitive: false,
       includeScore: true,
       shouldSort: true,
      // includeMatches: false,
      // findAllMatches: false,
      // minMatchCharLength: 1,
      // location: 0,
      threshold: 0.4,
      // distance: 100,
      // useExtendedSearch: false,
      ignoreLocation: false,
      // ignoreFieldNorm: false,
      // fieldNormWeight: 1,
      keys: [
        "title",
      ]
    };
    let controlMappings: {[key: string]: string} = {}

    for (const oldControl of oldControls) {
      let matchList: Control[] = []

      // Map of oldControl gid to newControl gid

      for (const newControl of newControls) {





        
        // Create match lists of possible matches based on whether SRG IDs match
        if (oldControl.tags.gtitle === newControl.tags.gtitle) {
          console.log(`SRG ID: ${oldControl.tags.gtitle}`)
          matchList.push(newControl)
        }
      }
      // Create fuse object for searching using generated matchList
      const fuse = new Fuse(matchList, fuseOptions);

      if (matchList.length === 0){
        console.log(`No matches found for ${oldControl.tags.gid}`)
      }
      else if (matchList.length === 1) {
        const result = fuse.search(oldControl.title as string);
        // Check score for match

        console.log(`oldControl: ${oldControl.title}`)
        console.log(result)

        if(result[0].score && result[0].score < 0.4 ) {
          //Type guard for map
          if (typeof oldControl.tags.gid === 'string' &&
              typeof result[0].item.tags.gid === 'string'){
          console.log(`Single match: ${oldControl.tags.gid} --> ${matchList[0].tags.gid}\n`)
          controlMappings[oldControl.tags.gid] = result[0].item.tags.gid
          }
        }
        else{
          // Examples of fanning out / consolidating controls: in rhel7 to rhel8
          console.log(`No matches found for ${oldControl.tags.gid}`)
        }
      }
      else if (matchList.length > 1) {
        const result = fuse.search(oldControl.title as string);

        console.log(`oldControl: ${oldControl.title}`)
        console.log(result)

        if(result[0].score && result[0].score < 0.4) {
          if ( typeof oldControl.tags.gid === 'string' &&
              typeof result[0].item.tags.gid === 'string'){
              console.log(`Best match in list: ${oldControl.tags.gid} --> ${result[0].item.tags.gid}\n`);
              controlMappings[oldControl.tags.gid] = result[0].item.tags.gid
            }
          }
          else{
            console.log(`No matches found for ${oldControl.tags.gid}`)
          }
    }
  }
  console.log("Hashmap:\n")
  console.log(controlMappings)
  console.log(Object.keys(controlMappings).length)
  // JS is pass by reference, probably not necessary
  return controlMappings
}
}