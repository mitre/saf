import { Command, Flags } from '@oclif/core'
import fs from 'fs'
import { processInSpecProfile, processOVAL, UpdatedProfileReturn, updateProfileUsingXCCDF, processXCCDF } from '@mitre/inspec-objects'
import prompt from 'prompt-sync'
// TODO: We shouldn't have to import like this, open issue to clean library up for inspec-objects
// test failed in updating inspec-objects to address high lvl vuln
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import Control from '@mitre/inspec-objects/lib/objects/control'

import path from 'path'
import { createWinstonLogger } from '../../utils/logging'
import fse from 'fs-extra'
import { match } from 'assert'

//import Fuse from 'fuse.js';
import table from 'table'
import readline from 'readline'
import { execSync } from 'child_process'

export default class GenerateDelta extends Command {
  static description = 'Update an existing InSpec profile with updated XCCDF guidance'

  static flags = {
    help: Flags.help({ char: 'h' }),
    inspecJsonFile: Flags.string({ char: 'J', required: true, description: 'Input execution/profile JSON file - can be generated using the "inspec json <profile path> | jq . > profile.json" command' }),
    xccdfXmlFile: Flags.string({ char: 'X', required: true, description: 'The XCCDF XML file containing the new guidance - in the form of .xml file' }),
    ovalXmlFile: Flags.string({ char: 'O', required: false, description: 'The OVAL XML file containing definitions used in the new guidance - in the form of .xml file' }),
    output: Flags.string({ char: 'o', required: true, description: 'The output folder for the updated profile - if it is not empty, it will be overwritten' }),
    report: Flags.string({ char: 'r', required: false, description: 'Output markdown report file - must have an extension of .md' }),
    idType: Flags.string({
      char: 'T',
      required: false,
      default: 'rule',
      options: ['rule', 'group', 'cis', 'version'],
      description: "Control ID Types: 'rule' - Vulnerability IDs (ex. 'SV-XXXXX'), 'group' - Group IDs (ex. 'V-XXXXX'), 'cis' - CIS Rule IDs (ex. C-1.1.1.1), 'version' - Version IDs (ex. RHEL-07-010020 - also known as STIG IDs)",
    }),
    logLevel: Flags.string({ char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose'] }),
    // New flag -M for whether to try mapping controls to new profile
    runMapControls: Flags.boolean({ char: 'M', required: false, default: false, description: 'Run the mapControls function' }),
  }

  static examples = [
    'saf generate delta -J ./the_profile_json_file.json -X ./the_xccdf_guidance_file.xml  -o the_output_directory -O ./the_oval_file.xml -T group -r the_update_report_file.md -L debug',
  ]

  async run() { // skipcq: JS-0044
    const { flags } = await this.parse(GenerateDelta)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    logger.warn("'saf generate delta' is currently a release candidate. Please report any questions/bugs to https://github.com/mitre/saf/issues.")

    // Create a readline prompt for user input
    // Probably a better way to do this, prompt-sync is already in the package.json
    const promptUser = (query: string): Promise<string> => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
      }));
    };

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

    try {
      if (flags.runMapControls) {
        logger.info(`Mapping controls from the old profile to the new profile`)
        let promptSync = prompt();
        // Process XCCDF of new profile to get controls
        processedXCCDF = processXCCDF(updatedXCCDF, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
        // profile = processXCCDF(xccdf, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)


        // let thresholdInput = parseFloat(promptSync('Enter the threshold for fuzzy search (default is 0.3): '))
        // if(thresholdInput === '')
        // {
        //   thresholdInput = '0.3'
        // }
        // Create a dictionary mapping new control GIDs to their old control counterparts
        let mappedControls = this.mapControls(existingProfile, processedXCCDF)

        // request directory of controls to be mapped from user

        //let controlsDir = await promptUser('Enter the pathname of controls directory to be mapped: ')
        //console.log(`controlsDir: ${controlsDir}`)
        let controlsDir = promptSync('Enter the pathname of controls directory to be mapped: ');
        console.log(`controlsDir: ${controlsDir}`)
        //logger.debug(`controlsDir: ${controlsDir}`)
        // Iterate through each mapped control
        // key = new control, controls[key] = old control
        const controls: { [key: string]: any } = await mappedControls;
        for (let key in controls) {
          console.log(`ITERATE MAP: ${key} --> ${controls[key]}`)
          //logger.debug(`ITERATE MAP: ${key} --> ${controls[key]}`)

          // For each control, modify the control file in the old controls directory
          // Then regenerate json profile
          const sourceControlFile = path.join(controlsDir, `${controls[key]}.rb`)

          if (fs.existsSync(sourceControlFile)) {
            console.log(`Found control file: ${sourceControlFile}`)
            //logger.debug(`Found control file: ${sourceControlFile}`)
            
            const lines = fs.readFileSync(sourceControlFile, 'utf-8').split('\n');

            // Find the line with the control name and replace it with the new control name
            // Single or double quotes are used on this line, check for both
            // Template literals (`${controls[key]}`) must be used with dynamically created regular expression (RegExp() not / ... /)
            const controlLineIndex = lines.findIndex(line => new RegExp(`control ['"]${controls[key]}['"] do`).test(line));
            lines[controlLineIndex] = lines[controlLineIndex].replace(new RegExp(`control ['"]${controls[key]}['"] do`), `control '${key}' do`);

            fs.writeFileSync(sourceControlFile, lines.join('\n'));

            // TODO: Maybe copy files from the source directory and rename for duplicates and to preserve source files
            console.log(`mapped control file: ${sourceControlFile} to reference ID ${key}\n new line: ${lines[controlLineIndex]}`)
            //logger.debug(`mapped control file: ${sourceControlFile} to reference ID ${key}\n new line: ${lines[controlLineIndex]}`)
            

          }
          else {
            console.log(`File not found at ${sourceControlFile}`)
            //logger.debug(`File not found at ${sourceControlFile}`)
          }
        }

        // Regenerate the profile json
        try {
          logger.info(`Generating the profile json using inspec json command on '${controlsDir}'`)
          // Get the directory name without the trailing "controls" directory
          const profileDir = path.dirname(controlsDir)

          // TODO: normally it's 'inspec json ...' but vscode doesn't recognize my alias?
          const inspecJsonFile = execSync(`cinc-auditor json '${profileDir}'`, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 })

          logger.info('Generating InSpec Profiles from InSpec JSON summary')

          // Replace existing profile (inputted JSON of source profile to be mapped)
          // Allow delta to take care of the rest
          existingProfile = processInSpecProfile(inspecJsonFile)
        } catch (error: any) {
          logger.error(`ERROR: Unable to generate the profile json because: ${error}`)
          throw error
        }

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
        fs.mkdirSync(path.join(flags.output), { recursive: true })
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
   * TODO: Source directory (old controls) should preserve original file names for git diff
   * 
   * Example usage:
   * ```typescript
   * const oldProfile = processInSpecProfile(fs.readFileSync(inspecJsonFile, 'utf8'))
   * const newProfile = processXCCDF(updatedXCCDF, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
   * const generateDelta = new GenerateDelta()
   * generateDelta.mapControls(oldProfile, newProfile);
   * ```
   */
  async mapControls(oldProfile: Profile, newProfile: Profile): Promise<object> {
    /*
    If a control isn't found to have a match at all, then req is missing or has been dropped
    Delta *should* be removing it automatically
    */
    let oldControls: Control[] = oldProfile.controls
    let newControls: Control[] = newProfile.controls

    const { default: Fuse } = await import('fuse.js');

    const fuseOptions = {
      // isCaseSensitive: false,
      includeScore: true,
      shouldSort: true,
      includeMatches: true,
      // findAllMatches: false,
      // minMatchCharLength: 1,
      // location: 0,
      threshold: 0.4,
      // distance: 100,
      // useExtendedSearch: false,

      // text / character movements are inherent when text is changed
      ignoreLocation: true,
      // puts weight on length of field, skews results since often text is expanded in revisions
      ignoreFieldNorm: true,
      // fieldNormWeight: 1,
      keys: [
        "title"
      ]
    };
    let controlMappings: { [key: string]: string } = {}

    // Create list of just the GIDs and the title / relevant keys of old controls 
    let searchList = oldControls.map((control) => {
      if (control.title) {
        return {
          // Remove all non-displayed characters in the control title
          title: control.title.replace(/[\n\r\t\f\v]/g, ''),
          gid: control.tags.gid
        }
      }
    })

    for (const newControl of newControls) {

      // Create fuse object for searching through matchList
      const fuse = new Fuse(oldControls, fuseOptions);

      // Check for existence of title, remove non-displayed characters
      // TODO: Determine whether removing symbols other than non-displayed characters is helpful
      // words separated by newlines don't have spaces between them
      if (newControl.title) {
        const result = fuse.search(newControl.title.replace(/[^\w\s]|[\r\t\f\v]/g, '').replace(/\n/g, ' '));

        console.log(`newControl: ${newControl.tags.gid}`)
        //logger.debug(`newControl: ${newControl.tags.gid}`)

        if (newControl.title) {
          console.log(`newControl w/ non-displayed: ${this.showNonDisplayedCharacters(newControl.title.replace(/[^\w\s]|[\r\t\f\v]/g, '').replace(/\n/g, ' '))}`)
          //logger.debug(`newControl with non-displayed: ${this.showNonDisplayedCharacters(newControl.title.replace(/[^\w\s]|[\r\t\f\v]/g, '').replace(/\n/g, ' '))
        }

        if (result[0] && result[0].score && result[0].score < 0.3) {
          if (typeof newControl.tags.gid === 'string' &&
            typeof result[0].item.tags.gid === 'string') {


            //if (result[0].score > 0.1) {
              // todo: modify output report or logger to show potential mismatches
              // alternatively: add a match decision feature for high-scoring results
            //  console.log(`Potential mismatch`)
            //}

            // Check non displayed characters of title  
            if (result[0].item.title) {
              console.log(`oldControl w/ non-displayed: ${this.showNonDisplayedCharacters(result[0].item.title.replace(/[^\w\s]|[\r\t\f\v]/g, '').replace(/\n/g, ' '))}`)
              //logger.debug(`oldControl with non-displayed: ${this.showNonDisplayedCharacters(result[0].item.title.replace(/[^\w\s]|[\r\t\f\v]/g, '').replace(/\n/g, ' '))}`)
            }
            console.log(`Best match in list: ${newControl.tags.gid} --> ${result[0].item.tags.gid}`);
            //logger.debug(`Best match in list: ${newControl.tags.gid} --> ${result[0].item.tags.gid}`);
            console.log(`Score: ${result[0].score} \n`)
            //logger.debug(`Score: ${result[0].score} \n`)

            controlMappings[newControl.tags.gid] = result[0].item.tags.gid

          }
        }
        else {
          console.log(`No matches found for ${newControl.tags.gid}`)
          //logger.debug(`No matches found for ${newControl.tags.gid}`)
        }
      }
    }

    console.log("Hashmap:\n")
    //logger.debug("Hashmap:\n")
    console.log(controlMappings)
    //logger.debug(controlMappings)
    console.log(Object.keys(controlMappings).length)
    //logger.debug(Object.keys(controlMappings).length)

    return controlMappings
  }

  // decideMatch(oldControl: Control, newControl: Control): boolean {

  //   let data = [
  //     [oldControl.tags.gid, newControl.tags.gid],
  //     [oldControl.title, newControl.title]
  //   ]
  //   console.log("TABLE===========================================================================\n")
  //   //console.log(table(data))

  //   return true
  // }

  showNonDisplayedCharacters(str: string): string {
    return str
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/\v/g, '\\v');
  }

}