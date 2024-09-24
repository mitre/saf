import { Command, Flags } from '@oclif/core'
import fs from 'fs'
import { processInSpecProfile, processOVAL, UpdatedProfileReturn, updateProfileUsingXCCDF, processXCCDF, updateControl } from '@mitre/inspec-objects'

// TODO: We shouldn't have to import like this, open issue to clean library up for inspec-objects
// test failed in updating inspec-objects to address high lvl vuln
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import Control from '@mitre/inspec-objects/lib/objects/control'

import path from 'path'
import { createWinstonLogger } from '../../utils/logging'
import fse from 'fs-extra'
import Fuse from 'fuse.js'

import colors from 'colors' // eslint-disable-line no-restricted-imports
import { execSync } from 'child_process'

export default class GenerateDelta extends Command {
  static description = 'Update an existing InSpec profile with updated XCCDF guidance'

  static flags = {
    help: Flags.help({ char: 'h' }),
    inspecJsonFile: Flags.string({ char: 'J', required: true, description: 'Input execution/profile (list of controls the delta is being applied from) JSON file - can be generated using the "inspec json <profile path> | jq . > profile.json" command' }),
    xccdfXmlFile: Flags.string({ char: 'X', required: true, description: 'The XCCDF XML file containing the new guidance - in the form of .xml file' }),
    ovalXmlFile: Flags.string({ char: 'O', required: false, description: 'The OVAL XML file containing definitions used in the new guidance - in the form of .xml file' }),
    output: Flags.string({ char: 'o', required: true, description: 'The output folder for the updated profile (will contain the controls that delta was applied too) - if it is not empty, it will be overwritten. Do not use the original controls directory' }),
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
    runMapControls: Flags.boolean({
      char: 'M',
      required: false,
      default: false,
      dependsOn: ['controlsDir'],
      description: 'Run the approximate string matching process'
    }),
    controlsDir: Flags.string({ char: 'c', required: false, description: 'The InSpec profile directory containing the controls being updated (controls Delta is processing)' }),
    backupControls: Flags.boolean({ char: 'b', required: false, default: true, allowNo: true, description: 'Preserve modified controls in a backup directory (oldControls) inside the controls directory\n[default: true]' }),
  }

  static examples = [
    'saf generate delta -J <profile_json_file.json> -X <xccdf_guidance_file.xml, -o <updated_controls_directory>',
    'saf generate delta -J <profile_json_file.json> -X <xccdf_guidance_file.xml, -o <updated_controls_directory> -M -c <controls_directory_being_processed_by_delta>',
  ]

  async run() { // skipcq: JS-0044
    const { flags } = await this.parse(GenerateDelta)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    logger.warn("'saf generate delta' is currently a release candidate. Please report any questions/bugs to https://github.com/mitre/saf/issues.")

    let existingProfile: any | null = null
    let updatedXCCDF: any = {}
    let ovalDefinitions: any = {}

    let processedXCCDF: any = {}

    let markDownFile = ''
    let outputProfileFolderPath = ''

    let mappedControls: any = {}
    // Process the Input execution/profile JSON file. The processInSpecProfile
    // method will throw an error if an invalid profile file is provided.
    // NOTE: If mapping controls to new profile (using the -M) the
    //       existingProfile variable is re-generated as the controls change.
    logger.info('Checking if an InSpec JSON file was provided...')
    try {
      if (fs.lstatSync(flags.inspecJsonFile).isFile()) {
        const inspecJsonFile = flags.inspecJsonFile
        logger.debug(`  Loading ${inspecJsonFile} as Profile JSON/Execution JSON`)
        existingProfile = processInSpecProfile(fs.readFileSync(inspecJsonFile, 'utf8'))
        logger.debug(`  Loaded ${inspecJsonFile} as Profile JSON/Execution JSON`)
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

    // Validate that the provided XCDDF containing the new/updated profile
    // guidance is actually an XCCDF XML file by checking the XML schema
    // location and name space
    // TODO: Use an XML parser to determine if the provided XCCDF file is an
    //       XCCDF by checking the schema location (xsi:schemaLocation) includes xccdf
    //       and that includes an XCCDF namespace (xmlns)
    logger.info('Checking if the provided XCCDF is valid...')
    try {
      if (fs.lstatSync(flags.xccdfXmlFile).isFile()) {
        const xccdfXmlFile = flags.xccdfXmlFile
        const inputFile = fs.readFileSync(xccdfXmlFile, 'utf8')
        const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()
        if (inputFirstLine.includes('xccdf')) {
          logger.debug('  Loading ${xccdfXmlFile} as XCCDF')
          updatedXCCDF = inputFile
          logger.debug('  Loaded ${xccdfXmlFile} as XCCDF')
        } else {
          logger.error(`  ERROR: Unable to load ${xccdfXmlFile} as XCCDF`)
          throw new Error('  Cannot load XCCDF file')
        }
        logger.debug(`  Loaded ${xccdfXmlFile} as XCCDF`)
      } else {
        throw new Error('  No benchmark (XCCDF) file was provided.')
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`  ERROR: No entity found for: ${flags.xccdfXmlFile}. Run the --help command to more information on expected input files.`)
        throw error
      } else {
        logger.error(`  ERROR: Unable to process the XCCDF XML file ${flags.xccdfXmlFile} because: ${error}`)
        throw error
      }
    }

    // Process the OVAL XML file
    logger.info('Checking if an OVAL XML file was provided...')
    try {
      if (flags.ovalXmlFile) {
        if (fs.lstatSync(flags.ovalXmlFile).isFile()) {
          const ovalXmlFile = flags.ovalXmlFile
          const inputFile = fs.readFileSync(ovalXmlFile, 'utf8')
          const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()

          if (inputFirstLine.includes('oval_definitions')) {
            logger.debug(`  Loading ${ovalXmlFile} as OVAL`)
            ovalDefinitions = processOVAL(inputFile)
            logger.debug(`  Loaded ${ovalXmlFile} as OVAL`)
          } else {
            logger.error(`  ERROR: Unable to load ${ovalXmlFile} as OVAL`)
            throw new Error('Cannot load OVAL file')
          }
        } else {
          logger.error(`  ERROR: An OVAL flag option was detected, but no file was provided, received: ${flags.ovalXmlFile}`)
          throw new Error('No OVAL file detected')
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`  ERROR: No entity found for: ${flags.ovalXmlFile}. Run the --help command to more information on expected input files.`)
        throw error
      } else {
        logger.error(`  Unable to process the OVAL XML file ${flags.ovalXmlFile} because: ${error}`)
        throw error
      }
    }

    // Process the fuzzy search logic
    logger.info('Checking if control mapping is required...')
    try {
      if (flags.runMapControls && flags.controlsDir) {
        logger.info('  Mapping controls from the old profile to the new profile')
        // Process XCCDF of new profile to get controls
        processedXCCDF = processXCCDF(updatedXCCDF, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
        // profile = processXCCDF(xccdf, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)

        // Create a dictionary mapping new control GIDs to their old control counterparts
        mappedControls = await this.mapControls(existingProfile, processedXCCDF)

        const controlsDir = flags.controlsDir

        // Iterate through each mapped control
        // key = new control, controls[key] = old control
        const controls: { [key: string]: any } = mappedControls

        // Create a directory where we are storing the newly created mapped controls
        // Do not over right the original controls in the directory (controlsDir)
        const mappedDir = this.createMappedDirectory(controlsDir)
        logger.info('  Updating the controls')
        console.log(colors.yellow('Updating Controls ===========================================================================\n'))
        // eslint-disable-next-line guard-for-in
        for (const key in controls) {
          // console.log(`ITERATE MAP: ${key} --> ${controls[key]}`)
          console.log(colors.yellow('        ITERATE MAP: '), colors.green(`${key} --> ${controls[key]}`))
          // for each control, modify the control file in the old controls directory
          // then regenerate json profile
          const sourceControlFile = path.join(controlsDir, `${controls[key]}.rb`)
          const mappedControlFile = path.join(mappedDir, `${controls[key]}.rb`)

          if (fs.existsSync(sourceControlFile)) {
            // console.log(`Found control file: ${sourceControlFile}`)
            // console.log(colors.yellow(' Found control file: '), colors.green(`${sourceControlFile}`))
            console.log(colors.yellow(' Processing control: '), colors.green(`${sourceControlFile}`))
            const lines = fs.readFileSync(sourceControlFile, 'utf8').split('\n')

            // Find the line with the control name and replace it with the new control name
            // single or double quotes are used on this line, check for both
            // Template literals (`${controls[key]}`) must be used with dynamically created regular expression (RegExp() not / ... /)
            const controlLineIndex = lines.findIndex(line => new RegExp(`control ['"]${controls[key]}['"] do`).test(line))
            if (controlLineIndex == -1) {
              console.log(colors.bgRed('  Control not found:'), colors.red(` ${sourceControlFile}\n`))
            } else {
              lines[controlLineIndex] = lines[controlLineIndex].replace(new RegExp(`control ['"]${controls[key]}['"] do`), `control '${key}' do`)

              // Saved processed control to the 'mapped_controls' directory
              console.log(colors.yellow('  Processed control: '), colors.green(`${mappedControlFile}`))
              fs.writeFileSync(mappedControlFile, lines.join('\n'))

              // TODO: Maybe copy files from the source directory and rename for duplicates and to preserve source files
              // console.log(`mapped control file: ${sourceControlFile} to reference ID ${key}\n new line: ${lines[controlLineIndex]}`)
              console.log(colors.yellow('Mapped control file: '), colors.green(`${sourceControlFile} to reference ID ${key}`))
              console.log(colors.yellow(' New do Block Title: '), colors.bgGreen(`${lines[controlLineIndex]}\n`))
            }
          } else {
            // console.log(`File not found at ${sourceControlFile}`)
            console.log(colors.bgRed('  File not found at:'), colors.red(` ${sourceControlFile}\n`))
          }
        }

        // Regenerate the profile json based on the updated mapped controls
        try {
          logger.info(`  Generating the profile json using the new mapped controls on: '${mappedDir}'`)
          // Get the directory name without the trailing "controls" directory
          // Here we are using the newly updated (mapped) controls
          //const profileDir = path.dirname(controlsDir)
          const profileDir = path.dirname(mappedDir)

          // use mappedDir
          const inspecJsonFile = execSync(`cinc-auditor json '${mappedDir}'`, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 })

          logger.info('  Generating InSpec Profiles from InSpec JSON summary')

          // Replace existing profile (inputted JSON of source profile to be mapped)
          // Allow delta to take care of the rest
          existingProfile = processInSpecProfile(inspecJsonFile)
        } catch (error: any) {
          logger.error(`  ERROR: Unable to generate the profile json because: ${error}`)
          throw error
        }
      } else if (flags.runMapControls && !flags.controlsDir) {
        logger.error('  If the -M (Run the approximate string matching process) is specified\n' +
          'the -c (The InSpec profile controls directory containing the profiles to be updated) is required')
      }
    } catch (error: any) {
      logger.error(`  ERROR: Could not process runMapControls ${flags.runMapControls}. Check the --help command for more information on the -o flag.`)
      throw error
    }

    // TODO: Modify the output report to include the mapping of controls and describe what was mapped
    // Process the output folder
    logger.info('Checking if provided output directory exists (create if it does not, clear if it exists)...')
    try {
      // Create the folder if it doesn't exist
      if (!fs.existsSync(flags.output)) {
        fs.mkdirSync(path.join(flags.output), { recursive: true })
      }

      if (path.basename(flags.output) === 'controls') {
        logger.debug(`  Deleting existing profile folder ${flags.output}`)
        fse.emptyDirSync(flags.output)
        outputProfileFolderPath = path.dirname(flags.output)
      } else {
        const controlDir = path.join(flags.output, 'controls')
        if (fs.existsSync(controlDir)) {
          logger.debug(`  Deleting content within existing controls folder within the profile folder ${flags.output}`)
          fse.emptyDirSync(controlDir)
        } else {
          fse.mkdirSync(controlDir)
        }

        outputProfileFolderPath = flags.output
      }
    } catch (error: any) {
      logger.error(`  ERROR: Could not process output ${flags.output}. Check the --help command for more information on the -o flag.`)
      throw error
    }

    // Set the report markdown file location
    logger.info('Check if an output markdown report was requested...')
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
    else {
      logger.debug('  An output markdown report was not requested')
    }

    // If all variables have been satisfied, we can generate the delta
    // If the -M was used the delta is generated based on the mapped controls
    logger.info('Executing the Delta process...')
    if (existingProfile && updatedXCCDF) {
      let updatedResult: UpdatedProfileReturn
      logger.debug(`  Processing XCCDF Benchmark file: ${flags.input} using ${flags.idType} id.`)
      const idTypes = ['rule', 'group', 'cis', 'version']
      if (idTypes.includes(flags.idType)) {
        updatedResult = updateProfileUsingXCCDF(existingProfile, updatedXCCDF, flags.idType as 'cis' | 'version' | 'rule' | 'group', logger, ovalDefinitions)
      } else {
        logger.error(`  ERROR: Invalid ID Type: ${flags.idType}. Check the --help command for the available ID Type options.`)
        throw new Error('Invalid ID Type')
      }

      logger.debug('  Computed the delta between the existing profile and updated benchmark.')

      updatedResult.profile.controls.forEach(control => {
        const controls = existingProfile.controls

        let index = 0;
        for (let i in controls) {
          const controlLine = controls[i].code.split('\n')[0]
          // NOTE: The control.id can be in the form of V-123456 or SV-123456  
          //       check the entire value or just the numeric value for a match
          if (controlLine.includes(control.id) || controlLine.includes(control.id.split('-')[1])) {
            index = parseInt(i)
            break
          }
        }
        const newControl = updateControl(existingProfile.controls[index], control, logger)
        // Call the .toRuby verbose if the log level is debug or verbose
        const logLevel = (flags.logLevel == 'debug' || flags.logLevel == 'verbose') ? true : false
        fs.writeFileSync(path.join(outputProfileFolderPath, 'controls', `${control.id}.rb`), newControl.toRuby(logLevel))
      })

      logger.info(`  Writing delta file for ${existingProfile.title}`)
      fs.writeFileSync(path.join(outputProfileFolderPath, 'delta.json'), JSON.stringify(updatedResult.diff, null, 2))

      if (flags.report) {
        logger.debug('  Writing report markdown file')

        // Mapped controls report data
        if (flags.runMapControls) {
          const reportData = '## Map Controls\nNew Control: Old Control\n' +
            JSON.stringify(mappedControls!, null, 2) +
            `\nTotal controls mapped: ${Object.keys(mappedControls!).length}\n\n` +
            updatedResult.markdown
          fs.writeFileSync(path.join(markDownFile), reportData)
        }
        else {
          fs.writeFileSync(path.join(markDownFile), updatedResult.markdown)
        }
      }
    } else {
      if (!existingProfile) {
        logger.error('  ERROR: Could not generate delta because the existingProfile variable was not satisfied.')
      }

      if (!updatedXCCDF) {
        logger.error('  ERROR: Could not generate delta because the updatedXCCDF variable was not satisfied.')
      }
    }
  }

  async catch(error: any) { // skipcq: JS-0116
    if (error.message) {
      this.warn(error.message)
    } else {
      const suggestions = 'saf generate delta -J <profile_json_file.json> -X <xccdf_guidance_file.xml, -o <directory_for_updated_profiles>\n\t' +
        'saf generate delta -J <profile_json_file.json> -X <xccdf_guidance_file.xml, -o <directory_for_updated_profiles> -M -c <directory_of_profiles_being_matched>'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }

  // Maps controls from an old profile to a new profile by updating the control IDs
  // based on matching SRG IDs and titles.
  //
  // This method uses Fuse.js for fuzzy searching, a technique of finding
  // strings that are approximately equal to a given pattern (rather than
  // exactly) to find matching controls in the new profile based on the
  // SRG ID (`tags.gtitle`). If a match is found and the titles match, the old
  // control's ID is updated to the new control's ID.
  //
  // Example usage:
  // ```typescript
  // const oldProfile = processInSpecProfile(fs.readFileSync(inspecJsonFile, 'utf8'))
  // const newProfile = processXCCDF(updatedXCCDF, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
  // const generateDelta = new GenerateDelta()
  // generateDelta.mapControls(oldProfile, newProfile);
  // ```
  //
  // @param oldProfile - The profile containing the old controls.
  // @param newProfile - The profile containing the new controls.
  async mapControls(oldProfile: Profile, newProfile: Profile): Promise<object> {
    /*
    If a control isn't found to have a match at all, then req is missing or has been dropped
    Delta *should* be removing it automatically
    */
    const oldControls: Control[] = oldProfile.controls
    const newControls: Control[] = newProfile.controls

    // const {default: Fuse} = await import('fuse.js')

    const fuseOptions = {
      // isCaseSensitive: false,
      includeScore: true,
      shouldSort: true,
      includeMatches: true,
      // findAllMatches: false,
      // minMatchCharLength: 1,
      // location: 0,
      // A threshold of 0.0 requires a perfect match (of both letters and location),
      //   threshold of 1.0 would match anything
      threshold: 0.4,
      // distance: 100,
      // useExtendedSearch: false,

      // text / character movements are inherent when text is changed
      ignoreLocation: true,
      // puts weight on length of field, skews results since often text is expanded in revisions
      ignoreFieldNorm: true,
      // fieldNormWeight: 1,
      keys: ['title'],
    }
    const controlMappings: { [key: string]: string } = {}

    // Create list of just the GIDs and the title / relevant keys of old controls
    // eslint-disable-next-line array-callback-return
    const searchList = oldControls.map(control => {
      if (control.title) {
        return {
          // Remove all non-displayed characters in the control title
          title: control.title.replaceAll(/[\n\r\t\f\v]/g, ''),
          gid: control.tags.gid,
        }
      }
    })

    console.log(colors.yellow('Mapping Process ===========================================================================\n'))
    // Create fuse object for searching through matchList
    const fuse = new Fuse(oldControls, fuseOptions)
    for (const newControl of newControls) {
      // Check for existence of title, remove non-displayed characters
      // eslint-disable-next-line no-warning-comments
      // TODO: Determine whether removing symbols other than non-displayed characters is helpful
      // words separated by newlines don't have spaces between them
      if (newControl.title) {
        const result = fuse.search(newControl.title.replaceAll(/[^\w\s]|[\r\t\f\v]/g, '').replaceAll('\n', ''))

        console.log(colors.yellow('Processing New Control: '), colors.green(`${newControl.tags.gid}`))

        if (newControl.title) {
          console.log(colors.yellow('      newControl Title: '), colors.green(`${this.updateTitle(newControl.title)}`))
        }

        if (result[0] && result[0].score && result[0].score < 0.3) {
          if (typeof newControl.tags.gid === 'string' &&
            typeof result[0].item.tags.gid === 'string') {

            // Check non displayed characters of title
            console.log(colors.yellow('      oldControl Title: '), colors.green(`${this.updateTitle(result[0].item.title)}`))
            // NOTE: We determined that 0.1 needs to be reviewed due to possible
            // words exchange that could alter the entire meaning of the title.
            if (result[0].score > 0.1) {
              // eslint-disable-next-line no-warning-comments
              // TODO: modify output report or logger to show potential mismatches
              // alternatively: add a match decision feature for high-scoring results
              console.log(colors.bgRed('** Potential mismatch **'))
            }
            console.log(colors.yellow('    Best match in list: '), colors.green(`${newControl.tags.gid} --> ${result[0].item.tags.gid}`))
            console.log(colors.yellow('                 Score: '), colors.green(`${result[0].score}\n`))

            controlMappings[newControl.tags.gid] = result[0].item.tags.gid
          }
        } else {
          console.log(colors.bgRed('      oldControl Title:'), colors.red(` ${this.updateTitle(result[0].item.title)}`))
          console.log(colors.bgRed('  No matches found for:'), colors.red(` ${newControl.tags.gid}`))
          console.log(colors.bgRed('                 Score:'), colors.red(` ${result[0].score} \n`))
        }
      }
    }

    this.printYellow('Mapping Results ===========================================================================')
    this.printYellow('\tNew Control -> Old Control')
    for (const [key, value] of Object.entries(controlMappings)) {
      this.printGreen(`\t   ${key} -> ${value}`)
    }

    this.printYellowGreen('Total controls processed: ', `${Object.keys(controlMappings).length}\n`)

    return controlMappings
  }

  updateTitle(str: string): string {
    const replace = str.replaceAll(/[^\w\s]|[\r\t\f\v]/g, '')
    return this.showNonDisplayedCharacters(replace).replaceAll('  ', ' ')
  }

  showNonDisplayedCharacters(str: string): string {
    return str
      .replaceAll('\n', String.raw``)
      .replaceAll('\r', String.raw``)
      .replaceAll('\t', String.raw``)
      .replaceAll('\f', String.raw``)
      .replaceAll('', String.raw``)
  }

  createMappedDirectory(controlsDir: string): string {
    const destFilePath = path.basename(controlsDir)
    //console.log(`destFilePath is: ${destFilePath}`)

    const mappedDir = controlsDir.replace(destFilePath, 'mapped_controls')
    //console.log(`mappedDir is: ${mappedDir}`)
    //console.log(`controlsDir is: ${controlsDir}`)
    if (fs.existsSync(mappedDir)) {
      fs.rmSync(mappedDir, { recursive: true, force: true })
    }

    fs.mkdirSync(mappedDir)

    return mappedDir

  }

  printYellowGreen(title: string, info: string) {
    console.log(colors.yellow(title), colors.green(info))
  }

  printYellow(info: string) {
    console.log(colors.yellow(info))
  }

  printGreen(info: string) {
    console.log(colors.green(info))
  }
}