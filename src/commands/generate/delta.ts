/* eslint-disable @typescript-eslint/no-explicit-any */
import {Flags} from '@oclif/core'
import winston from 'winston'
import fs from 'fs'
import {
  processInSpecProfile,
  processOVAL,
  UpdatedProfileReturn,
  updateProfileUsingXCCDF,
  processXCCDF,
  updateControl,
  Profile,
  Control,
} from '@mitre/inspec-objects'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import fse from 'fs-extra'
import Fuse from 'fuse.js'
import {execSync} from 'child_process'
import tmp from 'tmp'
import _, {isEmpty} from 'lodash'
import {
  addToProcessLogData,
  printBgMagentaRed,
  printBgRed,
  printBgRedRed,
  printBgYellow,
  printCyan,
  printGreen,
  printMagenta,
  printRed,
  printYellow,
  printYellowBgGreen,
  printYellowGreen,
  saveProcessLogData,
} from '../../utils/oclif/cliHelper'
import {BaseCommand} from '../../utils/oclif/baseCommand'
import {EventEmitter} from 'events'

import colors from 'colors'
import {input, confirm, select} from '@inquirer/prompts'
import {downloadFile, extractFileFromZip, getErrorMessage} from '../../utils/global'

/**
 * This class extends the capabilities of the update_controls4delta providing the following capabilities:
 *   1 - Creates new controls found in updated guidances
*    2 - Fuzzy matching capability (optional)
*        a - Maps controls based on similarity and not control IDs
*        b - For controls which a match is found, the describe block (code)
*            within the old control is mapped over to the new control
*    3 - Detailed logging
*        a - report file (.md), mapping statistics (CliProcessOutput.log)
*/
export default class GenerateDelta extends BaseCommand<typeof GenerateDelta> {
  static description = 'Update an existing InSpec profile with updated XCCDF guidance'

  static flags = {
    inspecJsonFile: Flags.string({
      char: 'J', required: false, exclusive: ['interactive'],
      description: '\x1B[31m(required if not --interactive)\x1B[34mInSpec Profiles JSON summary file - can be generated using the "[cinc-auditor or inspec] json <profile path> | jq . > profile.json" command',
    }),
    xccdfXmlFile: Flags.string({
      char: 'X', exclusive: ['interactive', 'xccdfUrl'],
      description: '\x1B[31m(required [-X or -U] or --interactive)\x1B[34mThe XCCDF XML file containing the new guidance - in the form of .xml file',
    }),
    xccdfUrl: Flags.url({
      char: 'U', exclusive: ['interactive', 'xccdfXmlFile'],
      description: '\x1B[31m(required [-X or -U] or --interactive)\x1B[34mThe URL pointing to the XCCDF file containing the new guidance (DISA STIG downloads)',
    }),
    deltaOutputDir: Flags.string({
      char: 'o', required: false, exclusive: ['interactive'],
      description: '\x1B[31m(required if not --interactive)\x1B[34mThe output folder for the updated profile (will contain the controls that delta was applied too) - if it is not empty, it will be overwritten. Do not use the original controls directory'}),
    ovalXmlFile: Flags.string({
      char: 'O', required: false, exclusive: ['interactive'],
      description: 'The OVAL XML file containing definitions used in the new guidance - in the form of .xml file'}),
    reportFile: Flags.string({
      char: 'r', required: false, exclusive: ['interactive'],
      description: 'Output markdown report file - must have an extension of .md'}),
    idType: Flags.string({
      char: 'T', required: false, exclusive: ['interactive'],
      default: 'rule', options: ['rule', 'group', 'cis', 'version'],
      description: "Control ID Types: 'rule' - Vulnerability IDs (ex. 'SV-XXXXX'), 'group' - Group IDs (ex. 'V-XXXXX'), 'cis' - CIS Rule IDs (ex. C-1.1.1.1), 'version' - Version IDs (ex. RHEL-07-010020 - also known as STIG IDs)",
    }),
    // New flag -M for whether to try mapping controls to new profile
    runMapControls: Flags.boolean({
      char: 'M', required: false,
      exclusive: ['interactive'],
      dependsOn: ['controlsDir'],
      description: 'Run the approximate string matching process',
    }),
    controlsDir: Flags.string({
      char: 'c', required: false, exclusive: ['interactive'],
      description: '\x1B[31m(required with -M or -J not provided)\x1B[34mThe InSpec profile directory containing the controls being updated (controls Delta is processing)'}),
  }

  static readonly examples = [
    {
      description: '\x1B[93mRunning the CLI interactively\x1B[0m',
      command: '<%= config.bin %> <%= command.id %> --interactive',
    },
    {
      description: '\x1B[93mProviding a XCCDF (file), a Profile Controls Summary, and no Fuzzy matching)\x1B[0m',
      command: '<%= config.bin %> <%= command.id %> -X <xccdf_benchmarks.xml>, -J <profile_summary.json> -c <current-controls-dir> -o <updated_controls_dir>, [options]',
    },
    {
      description: '\x1B[93mProviding a XCCDF (URL), a Profile Controls Summary, and no Fuzzy matching)\x1B[0m',
      command: '<%= config.bin %> <%= command.id %> -U <URL-to-benchmark.zip>, -J <profile_summary.json> -c <current-controls-dir> -o <updated_controls_dir>, [options]',
    },
    {
      description: '\x1B[93mProviding a XCCDF (file), a Profile Controls Summary, with Fuzzy matching)\x1B[0m',
      command: '<%= config.bin %> <%= command.id %> -X <xccdf_benchmarks.xml>, -J <profile_summary.json> -c <current-controls-dir> -o <updated_controls_dir>, -M, [options]',
    },
    {
      description: '\x1B[93mProviding a XCCDF (URL), a Profile Controls Summary, with Fuzzy matching)\x1B[0m',
      command: '<%= config.bin %> <%= command.id %> -U <URL-to-benchmark.zip>, -J <profile_summary.json> -c <current-controls-dir> -o <updated_controls_dir>, -M, [options]',
    },
  ]

  // Statistics variables
  static logger: winston.Logger
  static match = 0
  static noMatch = 0
  static dupMatch = 0
  static posMisMatch = 0
  static newXccdfControl = 0
  static oldControlsLength = 0
  static newControlsLength = 0

  // eslint-disable-next-line complexity
  async run() { // skipcq: JS-0044, JS-R1005
    const {flags} = await this.parse(GenerateDelta)

    // If not interactive must provide either -X or -U
    if (!flags.interactive && !flags.xccdfXmlFile && !flags.xccdfUrl) {
      this.error('\x1B[31mIf not interactive you must specify either [-X, --xccdfXmlFile or -U --xccdfUrl]\x1B[0m')
    }

    // If not interactive and -J not provided the -c must be provided
    if (!flags.interactive && !flags.inspecJsonFile && !flags.controlsDir) {
      this.error('\x1B[31mIf not interactive and -J not provided the Controls Directory (-c) must be provided\x1B[0m')
    }

    if (flags.runMapControls && !flags.controlsDir) {
      this.error('\x1B[31mIf not interactive and -M is provided the Controls Directory (-c) must be provided\x1B[0m')
    }

    GenerateDelta.logger = createWinstonLogger('generate:delta', 'info')

    // Flag variables
    let inspecJsonFile = ''
    let xccdfXmlFile = ''
    let xccdfContent = ''
    let deltaOutputDir = ''
    let ovalXmlFile = ''
    let reportFile = ''
    let idType = ''
    let runMapControls = true
    let controlsDir = ''
    let logLevel = ''

    // Process variables
    let existingProfile: any | null = null
    let ovalDefinitions: any = {}
    let processedXCCDF: any = {}
    let markDownFile = ''
    let outputProfileFolderPath = ''
    let mappedControls: any = {}

    addToProcessLogData('==================== Delta Process =====================')
    addToProcessLogData(`Date: ${new Date().toISOString()}`)

    if (flags.interactive) {
      const interactiveFlags = await getFlags()
      // Required flags
      const dataFileContent = flags.xccdfXmlFile
        ? await this.getXccdfContent('File', interactiveFlags.xccdfXmlFile)
        : flags.xccdfUrl ? await this.getXccdfContent('URL', interactiveFlags.xccdfUrl) : ''
      xccdfXmlFile = dataFileContent ? dataFileContent.xccdfFIle : ''
      xccdfContent = dataFileContent ? dataFileContent.xccdfContent : ''
      deltaOutputDir = interactiveFlags.deltaOutputDir

      // Optional flags
      inspecJsonFile = interactiveFlags.inspecJsonFile
      ovalXmlFile = interactiveFlags.ovalXmlFile
      if (interactiveFlags.reportDirectory) {
        reportFile = path.join(interactiveFlags.reportDirectory, interactiveFlags.reportFileName)
      }

      idType = interactiveFlags.idType
      runMapControls = interactiveFlags.runMapControls
      controlsDir = interactiveFlags.controlsDir
      logLevel = interactiveFlags.logLevel
    } else if (this.requiredFlagsProvided(flags)) {
      // Required flags
      const dataFileContent = flags.xccdfXmlFile
        ? await this.getXccdfContent('File', flags.xccdfXmlFile)
        : flags.xccdfUrl ? await this.getXccdfContent('URL', flags.xccdfUrl.toString()) : ''
      xccdfXmlFile = dataFileContent ? dataFileContent.xccdfFIle : ''
      xccdfContent = dataFileContent ? dataFileContent.xccdfContent : ''
      deltaOutputDir = flags.deltaOutputDir as string

      // Optional flags
      inspecJsonFile = flags.inspecJsonFile as string
      ovalXmlFile = flags.ovalXmlFile as string
      reportFile = flags.reportFile as string
      idType = flags.idType
      runMapControls = flags.runMapControls
      controlsDir = flags.controlsDir as string
      logLevel = flags.logLevel

      // Save the flags to the log object
      addToProcessLogData('Process Flags ===========================================')
      for (const key in flags) {
        if (Object.prototype.hasOwnProperty.call(flags, key)) {
          addToProcessLogData(key + '=' + flags[key as keyof typeof flags])
        }
      }
    } else {
      return
    }

    addToProcessLogData('\n')
    GenerateDelta.logger.level = logLevel

    const thisLogger = GenerateDelta.logger
    thisLogger.warn(colors.green('╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════╗'))
    thisLogger.warn(colors.green('║ saf generate delta is officially released - report any questions/bugs to https://github.com/mitre/saf/issues ║'))
    thisLogger.warn(colors.green('╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════╝'))

    // Shorten the controls directory to sow the 'controls' directory and its parent
    const shortControlsDir = path.sep + path.basename(path.dirname(controlsDir))
      + path.sep + path.basename(controlsDir)

    // -------------------------------------------------------------------------
    // Check if we have an InSpec json file, generate if not provided
    // Process the InSpec json content, convert entries into a Profile object
    // NOTE: If mapping controls to new profile (using the -M) the
    //       existingProfile variable is re-generated as the controls change.
    this.logThis('Processing the InSpec Profiles JSON summary (generate if not provided)...', 'info')
    if (inspecJsonFile) {
      this.logThis(`  Using execution/profile summary file: ${path.basename(inspecJsonFile)}`, 'info')
      try {
        if (fs.lstatSync(inspecJsonFile).isFile()) {
          this.logThis(`  Loading ${inspecJsonFile} as Profile JSON/Execution JSON`, 'debug')
          existingProfile = processInSpecProfile(fs.readFileSync(inspecJsonFile, 'utf8'))
          this.logThis(`  Loaded ${inspecJsonFile} as Profile JSON/Execution JSON`, 'debug')
        } else {
          saveLogs(`  ERROR: An InSpec Profile JSON file was not provided ${inspecJsonFile}`)
          await sleep(2000).then(() => process.exit(1))
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          saveLogs(
            `  ERROR: File (entity) not found: ${inspecJsonFile}.\n  Run the --help command for more information on expected input files.`)
          await sleep(2000).then(() => process.exit(1))
        } else {
          saveLogs(
            `  ERROR: Unable to process Input execution/profile JSON ${inspecJsonFile}\n  ${error}`)
          await sleep(2000).then(() => process.exit(1))
        }
      }
    } else {
      // Generate the profile json
      try {
        this.logThis(`  Generating the summary file on directory: ${shortControlsDir}`, 'info')
        // Get the directory name without the trailing "controls" directory
        const inspecJsonFile = execSync(`cinc-auditor json '${controlsDir}'`, {encoding: 'utf8', maxBuffer: 50 * 1024 * 1024})
        this.logThis('  Generated InSpec Profiles from InSpec JSON summary', 'info')
        existingProfile = processInSpecProfile(inspecJsonFile)
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.logThis(`ERROR: Unable to generate the profile JSON because: ${error.message}`, 'error')
          throw error
        }
        // Handle cases where error is not an instance of Error
        // logger.error('ERROR: An unknown error occurred while generating the profile JSON.')
        this.logThis('ERROR: An unknown error occurred while generating the profile JSON.', 'error')
        throw new Error('Unknown error occurred while generating the profile JSON.')
      }
    }

    // -------------------------------------------------------------------------
    // Process the OVAL XML file
    this.logThis('Checking if an OVAL XML file was provided...', 'info')
    try {
      if (ovalXmlFile) {
        if (fs.lstatSync(ovalXmlFile).isFile()) {
          const inputFile = fs.readFileSync(ovalXmlFile, 'utf8')
          const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()

          if (inputFirstLine.includes('oval_definitions')) {
            this.logThis(`  Loading ${ovalXmlFile} as OVAL`, 'debug')
            ovalDefinitions = processOVAL(inputFile)
            this.logThis(`  Loaded ${ovalXmlFile} as OVAL`, 'debug')
          } else {
            saveLogs(`  ERROR: Unable to load OVAL file: ${ovalXmlFile}\n  Ensure it is an OVAL file`)
            await sleep(2000).then(() => process.exit(1))
          }
        } else {
          saveLogs(
            `  ERROR: An OVAL flag option was detected, but no file was provided\n  Ensure ${ovalXmlFile} is an OVAL file`)
          await sleep(2000).then(() => process.exit(1))
        }
      } else {
        this.logThis('  An OVAL XML file was not provided', 'debug')
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        saveLogs(
          `  ERROR: File (entity) not found: ${ovalXmlFile}.\n  Run the --help command to more information on expected input files.`)
        await sleep(2000).then(() => process.exit(1))
      } else {
        saveLogs(`  ERROR: Unable to process the OVAL XML file: ${ovalXmlFile}\n  ${error}`)
        await sleep(2000).then(() => process.exit(1))
      }
    }

    // -------------------------------------------------------------------------
    // Process the fuzzy search logic
    // logger.info('Checking if control mapping is required...')
    this.logThis('Checking if control mapping is required...', 'info')
    try {
      if (runMapControls && controlsDir) {
        this.logThis('  Mapping controls (using fuzzy logic - lower value = best match) from the old profile to the new profile', 'info')
        addToProcessLogData('Mapping controls (using fuzzy logic - lower value = best match) from the old profile to the new profile\n')
        // Process XCCDF of new profile to get controls
        processedXCCDF = processXCCDF(xccdfContent, false, idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
        // Create a dictionary mapping new control GIDs to their old control counterparts
        mappedControls = await this.mapControls(existingProfile, processedXCCDF)

        // Iterate through each mapped control
        // key = new control, controls[key] = old control
        const controls: {[key: string]: any} = mappedControls

        // Create a directory where we are storing the newly created mapped controls
        // Do not over right the original controls in the directory (controlsDir)
        const mappedDir = this.createMappedDirectory(controlsDir)
        const shortRunningDir = path.sep + path.basename(path.dirname(controlsDir))
        const shortProfileDir = shortRunningDir + path.sep + path.basename(controlsDir)
        const shortMappedDir = shortRunningDir + path.sep + path.basename(mappedDir)
        // const controls + path.sep + path.basename(controlsDir)
        // logger.info('  Updating controls with new control number')
        this.logThis('  Updating controls with new control number', 'info')
        printCyan('Updating Controls ===========================================================================')

        // We need to update controls that a mapping were found executing the mapControls method.
        // This is needed because when we re-generate the new profile summary we need the controls
        // to have the new name/Id. So, for each control, modify the control file in the old controls
        // directory with the proper name and Id, than regenerate json profile summary.

        for (const key in controls) { // skipcq: JS-0051
          const sourceShortControlFile = path.join(shortProfileDir, `${controls[key]}.rb`)
          const mappedShortControlFile = path.join(shortMappedDir, `${controls[key]}.rb`)

          const sourceControlFile = path.join(controlsDir, `${controls[key]}.rb`)
          const mappedControlFile = path.join(mappedDir, `${controls[key]}.rb`)

          printYellowGreen('Mapping (From --> To): ', `${controls[key]} --> ${key}`)

          let lines
          if (fs.existsSync(sourceControlFile)) {
            lines = fs.readFileSync(sourceControlFile, 'utf8').split('\n')
          } else {
            printBgRedRed('    File not found at:', ` ${sourceControlFile}\n`)
            printRed('╔═══════════════════════════════════════════════════════════════════════════════╗')
            printRed('║ Make sure the appropriate Input execution/profile JSON file is being used (-J)║')
            printRed('╚═══════════════════════════════════════════════════════════════════════════════╝')
            return
          }

          // If the key equals the controls[wey], the update_controls4delta process was ran
          // and the controls were properly updated to the proper control number and name.
          if (controls[key] === key) {
            // The controls are up to date with the xccdf
            printYellowGreen('   Control is Current: ', `${sourceShortControlFile}`)
            // Saved processed control to the 'mapped_controls' directory
            printYellowGreen('    Processed control: ', `${mappedShortControlFile}\n`)
            fs.writeFileSync(mappedControlFile, lines.join('\n'))
          } else {
            printYellowGreen('   Processing control: ', `${sourceShortControlFile}`)
            // Find the line with the control name and replace it with the new control name
            // single or double quotes are used on this line, check for both
            // Template literals (`${controls[key]}`) must be used with dynamically created regular expression (RegExp() not / ... /)
            const controlLineIndex = lines.findIndex(line => new RegExp(`control ['"]${controls[key]}['"] do`).test(line))
            if (controlLineIndex === -1) {
              printBgRedRed('    Control not found:', ` ${sourceControlFile}\n`)
            } else {
              lines[controlLineIndex] = lines[controlLineIndex].replace(new RegExp(`control ['"]${controls[key]}['"] do`), `control '${key}' do`)

              // Saved processed control to the 'mapped_controls' directory
              printYellowGreen('    Processed control: ', `${mappedShortControlFile}`)
              fs.writeFileSync(mappedControlFile, lines.join('\n'))

              // TODO: Maybe copy files from the source directory and rename for duplicates and to preserve source files // skipcq: JS-0099
              printYellowGreen('  Mapped control file: ', `${sourceShortControlFile} to reference ID ${key}`)
              printYellowBgGreen('     New control name: ', `${key}.rb\n`)
            }
          }
        }

        // Regenerate the profile json summary based on the updated mapped controls
        try {
          this.logThis(`  Generating the profile json using the new mapped controls on: '${mappedDir}'`, 'info')
          // Get the directory name without the trailing "controls" directory
          // Here we are using the newly updated (mapped) controls
          // const profileDir = path.dirname(controlsDir)
          const inspecJsonFileNew = execSync(`cinc-auditor json '${mappedDir}'`, {encoding: 'utf8', maxBuffer: 50 * 1024 * 1024})

          // Replace existing profile (inputted JSON of source profile to be mapped)
          // Allow delta to take care of the rest
          existingProfile = processInSpecProfile(inspecJsonFileNew)
        } catch (error: any) {
          saveLogs(`  ERROR: Unable to generate the profile json summary for the updated controls.  \n ${error}`)
          await sleep(2000).then(() => process.exit(1))
        }
      }
    } catch (error: any) {
      saveLogs(
        `  ERROR: Could not process runMapControls flag. Check the --help command for more information on the -o flag.\n  ${error}`)
      await sleep(2000).then(() => process.exit(1))
    }

    // -------------------------------------------------------------------------
    // Process the output folder
    // logger.info('Checking if provided output directory exists (create it if does not, clear if exists)...')
    this.logThis('Checking if provided output directory exists (create it if does not, clear if exists)...', 'info')
    try {
      // Create the folder if it doesn't exist
      if (!fs.existsSync(deltaOutputDir)) {
        fs.mkdirSync(path.join(deltaOutputDir), {recursive: true})
      }

      if (path.basename(deltaOutputDir) === 'controls') {
        this.logThis(`  Deleting existing profile folder ${deltaOutputDir}`, 'debug')
        fse.emptyDirSync(deltaOutputDir)
        outputProfileFolderPath = path.dirname(deltaOutputDir)
      } else {
        const controlDir = path.join(deltaOutputDir, 'controls')
        if (fs.existsSync(controlDir)) {
          this.logThis(`  Deleting content within existing controls folder within the profile folder ${deltaOutputDir}`, 'debug')
          fse.emptyDirSync(controlDir)
        } else {
          fse.mkdirSync(controlDir)
        }

        outputProfileFolderPath = deltaOutputDir
      }
    } catch (error: any) {
      this.logThis(`  ERROR: Could not process delta output directory: ${deltaOutputDir}. Check the --help command for more information on the -o flag.`, 'error')
      this.logThis(`  ${error}`, 'error')
      saveLogs(
        `  ERROR: Unable to process delta output directory: ${deltaOutputDir}\n  Check the --help command for more information on the -o flag.\n  ${error}`)
      await sleep(2000).then(() => process.exit(1))
    }

    // -------------------------------------------------------------------------
    // Set the report markdown file location
    // logger.info('Checking if an output markdown report was requested...')
    this.logThis('Checking if an output markdown report was requested...', 'info')
    if (reportFile) {
      if (fs.existsSync(reportFile) && fs.lstatSync(reportFile).isDirectory()) {
        // Not a file - directory provided
        markDownFile = path.join(reportFile, 'delta.md')
      } else if (fs.existsSync(reportFile) && fs.lstatSync(reportFile).isFile()) {
        // File name provided and exists - will be overwritten
        markDownFile = reportFile
      } else if (path.extname(reportFile) === '.md') {
        markDownFile = reportFile
      } else {
        markDownFile = path.join(outputProfileFolderPath, 'delta.md')
      }
    } else {
      this.logThis('  An output markdown reports was not requested', 'debug')
    }

    // -------------------------------------------------------------------------
    // If all variables have been satisfied, we can generate the delta
    // If the -M was used the delta is generated based on the mapped controls
    // logger.info('Executing the Delta process...')
    this.logThis('Executing the Delta process...', 'info')
    if (existingProfile && xccdfContent) {
      let updatedResult: UpdatedProfileReturn | undefined
      this.logThis(`  Processing XCCDF Benchmark file: ${xccdfXmlFile} using ${idType} id.`, 'debug')
      const idTypes = ['rule', 'group', 'cis', 'version']
      if (idTypes.includes(idType)) {
        updatedResult = updateProfileUsingXCCDF(existingProfile, xccdfContent, idType as 'cis' | 'version' | 'rule' | 'group', thisLogger, ovalDefinitions)
      } else {
        saveLogs(
          `  ERROR: Invalid ID Type: ${idType}. Check the --help command for the available ID Type options.`)
        await sleep(2000).then(() => process.exit(1))
      }

      this.logThis('  Computed the delta between the existing profile and updated benchmark.', 'debug')

      if (updatedResult) {
        updatedResult.profile.controls.forEach((control) => {
          const controls = existingProfile.controls

          let index = -1

          for (const i in controls) { // skipcq: JS-0051
            const controlLine = controls[i].code.split('\n')[0]
            // NOTE: The control.id can be in the form of V-123456 or SV-123456
            //       check the entire value or just the numeric value for a match
            if (controlLine.includes(control.id) || controlLine.includes(control.id.split('-')[1])) {
              index = Number.parseInt(i, 10)
              break
            }
          }

          // Call the .toRuby verbose if the log level is debug or verbose
          const processLogLevel = Boolean(logLevel === 'debug' || logLevel === 'verbose')
          if (index >= 0) {
            // We found a mapping for this control (aka index >=0)
            // The new control (control) has the new metadata but doesn't have
            // the describe block (code). Using the updateControl method with the new
            // control so we can get the code with the new metadata.

            // NOTE: Can use the getExistingDescribeFromControl(existingProfile.controls[index])
            //       method from inspect-objects
            const newControl = updateControl(existingProfile.controls[index], control, thisLogger)
            this.logThis(`Writing updated control with code block for: ${control.id}.`, 'debug')
            fs.writeFileSync(path.join(outputProfileFolderPath, 'controls', `${control.id}.rb`), newControl.toRuby(processLogLevel))
          } else {
            // We didn't find a mapping for this control - Old style of updating controls
            this.logThis(`Writing new control without code block for: ${control.id}.`, 'debug')
            fs.writeFileSync(path.join(outputProfileFolderPath, 'controls', `${control.id}.rb`), control.toRuby(processLogLevel))
          }
        })

        // logger.info(`  Writing delta file for ${existingProfile.title}`)
        this.logThis(`  Writing delta file for ${existingProfile.title}`, 'info')
        fs.writeFileSync(path.join(outputProfileFolderPath, 'delta.json'), JSON.stringify(updatedResult.diff, null, 2))

        if (reportFile) {
          // logger.debug('  Writing report markdown file')
          this.logThis('  Writing report markdown file', 'debug')
          if (runMapControls) {
            const totalMappedControls = Object.keys(mappedControls!).length // skipcq: JS-0339
            const reportData = '## Map Controls\n'
              + JSON.stringify(mappedControls!, null, 2) // skipcq:  JS-0339
              + `\nTotal Mapped Controls: ${Object.keys(mappedControls!).length}\n\n` // skipcq:  JS-0339
              + `Total Controls Available for Delta: ${GenerateDelta.oldControlsLength}\n`
              + `     Total Controls Found on XCCDF: ${GenerateDelta.newControlsLength}\n`
              + `                    Match Controls: ${GenerateDelta.match}\n`
              + `        Possible Mismatch Controls: ${GenerateDelta.posMisMatch}\n`
              + `          Duplicate Match Controls: ${GenerateDelta.dupMatch}\n`
              + `                 No Match Controls: ${GenerateDelta.noMatch}\n`
              + `                New XCDDF Controls: ${GenerateDelta.newXccdfControl}\n\n`
              + 'Statistics Validation ------------------------------------------\n'
              + `Match + Mismatch = Total Mapped Controls: ${this.getMappedStatisticsValidation(totalMappedControls, 'totalMapped')}\n`
              + `  Total Processed = Total XCCDF Controls: ${this.getMappedStatisticsValidation(totalMappedControls, 'totalProcessed')}\n\n`
              + updatedResult.markdown
            fs.writeFileSync(path.join(markDownFile), reportData)
          } else {
            fs.writeFileSync(path.join(markDownFile), updatedResult.markdown)
          }
        }

        // Print the process output report to current directory
        addToProcessLogData('Update Results ===========================================================================\n')
        addToProcessLogData(updatedResult.markdown)
        printGreen('\nDelta Process completed successfully\n')
        saveProcessLogData()
      } else {
        printRed('\nDelta Process failed\n')
        saveLogs(
          `  ERROR: The updateProfileUsingXCCDF process failed to provide updated profiles, received: ${updatedResult}.`)
        await sleep(2000).then(() => process.exit(1))
      }
    } else {
      if (!existingProfile) {
        this.logThis('  ERROR: Could not generate delta because the existingProfile variable was not satisfied.', 'error')
        printRed('\nDelta Process failed\n')
      }

      if (!xccdfContent) {
        this.logThis('  ERROR: Could not generate delta because the xccdfContent variable was not satisfied.', 'error')
        printRed('\nDelta Process failed\n')
      }
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
  // const newProfile = processXCCDF(xccdfContent, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
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
    GenerateDelta.oldControlsLength = oldControls.length
    GenerateDelta.newControlsLength = newControls.length

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
    const controlMappings: {[key: string]: string} = {}

    printCyan('Mapping Process ===========================================================================')
    // Create fuse object for searching through matchList
    const fuse = await new Fuse(oldControls, fuseOptions)

    // Map that holds processed controls and their scores
    // Need to check if a control is process multiple-times and determine which
    // control has the lower score
    const controlIdToScoreMap = new Map()
    for (const newControl of newControls) {
      // Check for existence of title, remove non-displayed characters

      // TODO: Determine whether removing symbols other than non-displayed characters is helpful // skipcq: JS-0099
      // words separated by newlines don't have spaces between them
      if (newControl.title) {
        // Regex: [\w\s]     -> match word characters and whitespace
        //        [\r\t\f\v] -> carriage return, tab, form feed and vertical tab
        const result = fuse.search(newControl.title.replaceAll(/[^\w\s]|[\r\t\f\v]/g, '').replaceAll('\n', ''))
        if (isEmpty(result)) {
          printYellowGreen('     New XCCDF Control:', ` ${newControl.id}`)
          printBgYellow('* No Mapping Provided *\n')
          GenerateDelta.newXccdfControl++
          continue
        }

        printYellowBgGreen('Processing New Control: ', `${newControl.id}`)
        printYellowBgGreen('     New Control Title: ', `${this.updateTitle(newControl.title)}`)

        if (result[0] && result[0].score && result[0].score < 0.3) { // skipcq: JS-W1044
          if (controlIdToScoreMap.has(result[0].item.id)) {
            const score = controlIdToScoreMap.get(result[0].item.id)

            if (result[0].score < score) {
              controlIdToScoreMap.set(result[0].item.id, result[0].score)
            } else {
              printBgMagentaRed('     Old Control Title:', ` ${this.updateTitle(result[0].item.title)}`)
              printBgMagentaRed('       Duplicate Match:', ` ${result[0].item.id} --> ${newControl.id}`)
              printBgMagentaRed('        Matching Score:', ` ${result[0].score}\n`)
              GenerateDelta.dupMatch++
              continue
            }
          }

          if (typeof newControl.id === 'string'
            && typeof result[0].item.id === 'string') {
            // Check non displayed characters of title
            printYellowGreen('     Old Control Title: ', `${this.updateTitle(result[0].item.title)}`)
            // NOTE: We determined that 0.1 needs to be reviewed due to possible
            // words exchange that could alter the entire meaning of the title.

            if (result[0].score > 0.1) {
              // TODO: modify output report or logger to show potential mismatches // skipcq: JS-0099
              // alternatively: add a match decision feature for high-scoring results
              printBgRed('** Potential Mismatch **')
              GenerateDelta.posMisMatch++
            } else {
              GenerateDelta.match++
            }

            printYellowGreen('  Best Match Candidate: ', `${result[0].item.id} --> ${newControl.id}`)
            printYellowGreen('        Matching Score: ', `${result[0].score}\n`)

            // Check if we have added an entry for the old control being processed
            // The result[0].item.id is the old control id
            for (const key in controlMappings) {
              if (controlMappings[key] === result[0].item.id) {
                delete controlMappings[key] // skipcq: JS-0320
                // Lets now check if this entry was previously processed
                if (controlIdToScoreMap.has(result[0].item.id)) {
                  const score = controlIdToScoreMap.get(result[0].item.id)
                  if (score > 0.1) {
                    GenerateDelta.posMisMatch--
                  } else {
                    GenerateDelta.match--
                  }
                  GenerateDelta.noMatch++
                }
                break
              }
            }
            controlMappings[newControl.id] = result[0].item.id
            controlIdToScoreMap.set(result[0].item.id, result[0].score)
          }
        } else {
          printBgRedRed('     Old Control Title:', ` ${this.updateTitle(result[0].item.title)}`)
          printBgRedRed('    No Match Found for:', ` ${result[0].item.id} --> ${newControl.id}`)
          printBgRedRed('        Matching Score:', ` ${result[0].score} \n`)
          GenerateDelta.noMatch++
        }
      }
    }

    printCyan('Mapping Results ===========================================================================')
    printYellow('\tOld Control -> New Control')
    for (const [key, value] of Object.entries(controlMappings)) {
      printGreen(`\t   ${value} -> ${key}`)
    }

    const totalMappedControls = Object.keys(controlMappings).length
    printYellowGreen('Total Mapped Controls: ', `${totalMappedControls}\n`)

    printCyan('Control Counts ===========================')
    printYellowGreen('Total Controls Available for Delta: ', `${GenerateDelta.oldControlsLength}`)
    printYellowGreen('     Total Controls Found on XCCDF: ', `${GenerateDelta.newControlsLength}\n`)

    printCyan('Match Statistics =========================')
    printYellowGreen('                    Match Controls: ', `${GenerateDelta.match}`)
    printYellowGreen('        Possible Mismatch Controls: ', `${GenerateDelta.posMisMatch}`)
    printYellowGreen('          Duplicate Match Controls: ', `${GenerateDelta.dupMatch}`)
    printYellowGreen('                 No Match Controls: ', `${GenerateDelta.noMatch}`)
    printYellowGreen('                New XCDDF Controls: ', `${GenerateDelta.newXccdfControl}\n`)

    printCyan('Statistics Validation =============================================')
    printYellowGreen('Match + Mismatch = Total Mapped Controls: ', `${this.getMappedStatisticsValidation(totalMappedControls, 'totalMapped')}`)
    printYellowGreen('  Total Processed = Total XCCDF Controls: ', `${this.getMappedStatisticsValidation(totalMappedControls, 'totalProcessed')}\n\n`)

    return controlMappings
  }

  getMappedStatisticsValidation(totalMappedControls: number, statValidation: string): string { // skipcq: JS-0105
    let evalStats = ''
    const match = GenerateDelta.match
    const misMatch = GenerateDelta.posMisMatch
    const statMach = ((match + misMatch) === totalMappedControls)
    const dupMatch = GenerateDelta.dupMatch
    const noMatch = GenerateDelta.noMatch
    const newXccdfControl = GenerateDelta.newXccdfControl
    const statTotalMatch = ((totalMappedControls + dupMatch + noMatch + newXccdfControl) === GenerateDelta.newControlsLength)

    evalStats = statValidation === 'totalMapped'
      ? `(${match}+${misMatch}=${totalMappedControls}) ${statMach}`
      : `(${match}+${misMatch}+${dupMatch}+${noMatch}+${newXccdfControl}=${GenerateDelta.newControlsLength}) ${statTotalMatch}`

    return evalStats
  }

  requiredFlagsProvided(flags: any): boolean { // skipcq: JS-0105
    let missingFlags = false
    let strMsg = 'Warning: The following errors occurred:\n'

    // If we don't have a Controls Profiles summary file or are conducting
    // a fuzzy matching we need the controls directory
    if (!flags.inspecJsonFile || flags.runMapControls) {
      // Check if the directory exists
      if (fs.existsSync(flags.controlsDir)) {
        const files = fs.readdirSync(flags.controlsDir)
        // Filter the files to check if any of them have the .rd extension
        const rdFiles = files.filter(file => path.extname(file) === '.rb')
        strMsg += colors.dim(`  No Controls found in directory: ${flags.controlsDir}\n`)
        missingFlags = !(rdFiles.length > 0)
      } else {
        strMsg += colors.dim(`  Profile controls directory does not exist: ${flags.controlsDir}\n`)
        missingFlags = true
      }
    }

    if (!flags.deltaOutputDir) {
      strMsg += colors.dim('  Missing required flag deltaOutputDir\n')
      missingFlags = true
    }

    if (missingFlags) {
      strMsg += 'See more help with -h or --help'
      this.warn(strMsg)
    }

    return !missingFlags
  }

  async getXccdfContent(type: string, from: string): Promise<{xccdfFIle: string, xccdfContent: string}> {
    let xccdfFIle = ''
    let xccdfContent = ''

    if (type === 'File') {
      xccdfFIle = path.basename(from)
      this.logThis(`Verifying that the XCCDF file is valid: ${xccdfFIle}...`, 'info')
      if (isXccdfFile(from)) {
        xccdfContent = fs.readFileSync(from, 'utf8')
        this.logThis(`  Retrieved XCCDF from: ${xccdfFIle}`, 'debug')
      } else {
        saveLogs('Processing XCCDF JSON Summary file failed.')
        await sleep(2000).then(() => process.exit(1))
      }
    } else {
      this.logThis(`Verifying that the URL contains a valid XCCDF: ${from}...`, 'info')
      const tmpobj = tmp.dirSync({unsafeCleanup: true})
      let fileBuffer: Buffer | null = null

      if (from === undefined) {
        saveLogs('URL flag is undefined or invalid.')
        await sleep(2000).then(() => process.exit(1))
      }

      let url = from
      await (async () => {
        const zipFile = url.split('/').pop() // Extracts the last segment

        if (!zipFile) {
          throw new Error('Failed to extract zip file name from URL')
        }
        const zipFilePath = path.join(tmpobj.name, zipFile)
        xccdfFIle = zipFile

        try {
          await downloadFile(url, zipFilePath)
          this.logThis('  Valid XCCDF URL provided', 'debug')
          const fileNameToExtract = '-xccdf.xml'
          fileBuffer = extractFileFromZip(zipFilePath, fileNameToExtract)
          if (fileBuffer) {
            this.logThis(`  Extracted XCCDF from: ${zipFile}`, 'debug')
            xccdfContent = fileBuffer.toString()
          }
        } catch (error) {
          saveLogs(`Processing URL failed.', ${error}`)
          await sleep(2000).then(() => process.exit(1))
        }
      })()
      tmp.setGracefulCleanup()
    }
    return {xccdfFIle, xccdfContent}
  }

  updateTitle(str: string): string { // skipcq: JS-0105
    return str
      .replaceAll('\n', String.raw``)
      .replaceAll('\r', String.raw``)
      .replaceAll('\t', String.raw``)
      .replaceAll('\f', String.raw``)
      .replaceAll('\v', String.raw``)
  }

  createMappedDirectory(controlsDir: string): string { // skipcq: JS-0105
    const destFilePath = path.basename(controlsDir)
    const mappedDir = controlsDir.replace(destFilePath, 'mapped_controls')
    if (fs.existsSync(mappedDir)) {
      fs.rmSync(mappedDir, {recursive: true, force: true})
    }

    fs.mkdirSync(mappedDir)

    return mappedDir
  }

  logThis(logMsg: string, logLevel: string) {
    switch (logLevel) {
      case 'info': {
        GenerateDelta.logger.info(logMsg)
        addToProcessLogData(logMsg)
        break
      }
      case 'debug': {
        GenerateDelta.logger.debug(logMsg)
        addToProcessLogData(logMsg)
        break
      }
      case 'error': {
        GenerateDelta.logger.error(logMsg)
        addToProcessLogData(logMsg)
        break
      }
    }
  }
}

// Interactively ask the user for the arguments required for the cli.
// All flags, required and optional are asked
async function getFlags(): Promise<any> {
  // The default max listeners is set to 10. The inquire checkbox sets a
  // listener for each entry it displays, we are providing 16 entries,
  // does using 16 listeners. Need to increase the defaultMaxListeners.
  EventEmitter.defaultMaxListeners = 20

  // Dynamically import inquirer-file-selector and chalk
  // Once we move the SAF CLI from a CommonJS to an ES modules we can use the regular import
  const {default: fileSelector} = await import('inquirer-file-selector')
  const {default: chalk} = await import('chalk')

  const fileSelectorTheme = {
    style: {
      file: (text: unknown) => chalk.green(text),
      currentDir: (text: string) => chalk.blueBright(text),
      help: (text: unknown) => chalk.yellow(text),
    },
  }

  // Variable used to store the prompts (question and answers)
  const interactiveValues: {[key: string]: any} = {}

  printYellow('Provide the necessary information:')
  printGreen('  Required flag - The XCCDF XML file or URL containing the new guidance - in the form of .xml file')
  printGreen('  Required flag - Controls directory (path to the profile controls to apply the delta process)')
  printGreen('  Required flag - The output folder for the updated profile (will contain the controls that delta was applied too)')

  printMagenta('  Optional flag - InSpec Profiles JSON summary file (JSON) - auto-generated if not provided')
  printMagenta('  Optional flag - The OVAL XML file containing definitions used in the new guidance - in the form of .xml file')
  printMagenta('  Optional flag - Output markdown report file - must have an extension of .md')
  printMagenta('  Optional flag - Control ID Types: [\'rule\', \'group\', \'cis\', \'version\']')
  printMagenta('  Optional flag - Run the approximate string matching process')
  printMagenta('  Optional flag - The InSpec profile directory containing the controls being updated (controls Delta is processing)\n')

  // Required Flags
  const requiredAnswers = {
    inspecJsonFile: await fileSelector({
      message: 'Select the Input execution/profile (list of controls the delta is being applied from) JSON file:',
      pageSize: 15,
      loop: true,
      type: 'file',
      allowCancel: true,
      emptyText: 'Directory is empty',
      showExcluded: false,
      filter: file => file.isDirectory() || file.name.endsWith('.json'),
      theme: fileSelectorTheme,
    }),
    xccdfXmlFile: await fileSelector({
      message: 'Select the XCCDF XML file containing the new guidance - in the form of .xml file:',
      pageSize: 15,
      loop: true,
      type: 'file',
      allowCancel: true,
      emptyText: 'Directory is empty',
      showExcluded: false,
      filter: file => file.isDirectory() || file.name.endsWith('.xml'),
      theme: fileSelectorTheme,
    }),
    deltaOutputDir: await fileSelector({
      message: 'Select the output folder for the updated profile control(s) (do not use the original controls directory)',
      pageSize: 15,
      loop: true,
      type: 'directory',
      allowCancel: true,
      emptyText: 'Directory is empty',
      theme: fileSelectorTheme,
    }),
  }

  addToProcessLogData('Process Flags ============================================')

  for (const tagName in requiredAnswers) {
    if (Object.prototype.hasOwnProperty.call(requiredAnswers, tagName)) {
      const answerValue = _.get(requiredAnswers, tagName)
      if (answerValue !== null) {
        addToProcessLogData(tagName + '=' + answerValue)
        interactiveValues[tagName] = answerValue
      }
    }
  }

  // Optional - OVAL file Flag
  const useOvalFile = await confirm({message: 'Include an OVAL XML file?'})
  if (useOvalFile) {
    const ovalXmlFile = await fileSelector({
      message: 'Select the OVAL XML file containing definitions used in the new guidance - in the form of .xml file:',
      pageSize: 15,
      loop: true,
      type: 'file',
      allowCancel: true,
      emptyText: 'Directory is empty',
      showExcluded: false,
      filter: file => file.isDirectory() || file.name.endsWith('.xml'),
      theme: fileSelectorTheme,
    })

    addToProcessLogData('useOvalFile=true')
    interactiveValues.useOvalFile = true
    interactiveValues.ovalXmlFile = ovalXmlFile
  } else {
    addToProcessLogData('useOvalFile=false')
    interactiveValues.useOvalFile = false
  }

  // Optional - Map controls using fuzzy logic
  const useFuzzyLogic = await confirm({message: 'Run the approximate string matching process (fuzzy logic)?'})
  if (useFuzzyLogic) {
    const controlsDir = await fileSelector({
      message: 'Select the InSpec profile directory containing the controls being updated (controls Delta is processing):',
      pageSize: 15,
      loop: true,
      type: 'directory',
      allowCancel: true,
      emptyText: 'Directory is empty',
      theme: fileSelectorTheme,
    })

    addToProcessLogData('runMapControls=true')
    interactiveValues.runMapControls = true
    interactiveValues.controlsDir = controlsDir
  } else {
    addToProcessLogData('runMapControls=false')
    interactiveValues.runMapControls = false
  }

  // Optional - Generate markdown report from Inspect-objects process
  const generateReport = await confirm({message: 'Generate the Inspect-Object process markdown report file?'})
  if (generateReport) {
    const answers = {
      reportDirectory: await fileSelector({
        message: 'Select the output directory for the markdown report file:',
        pageSize: 15,
        loop: true,
        type: 'directory',
        allowCancel: true,
        emptyText: 'Directory is empty',
        theme: fileSelectorTheme,
      }),
      reportFileName: await input({
        message: 'Specify the output report filename (must have an extension of .md):',
        default: 'deltaProcessReport.md',
      }),
    }

    addToProcessLogData('generateReport=true')
    interactiveValues.generateReport = true

    for (const tagName in answers) {
      if (Object.prototype.hasOwnProperty.call(answers, tagName)) {
        const answerValue = _.get(answers, tagName)
        if (answerValue !== null) {
          addToProcessLogData(tagName + '=' + answerValue)
          interactiveValues[tagName] = answerValue
        }
      }
    }
  } else {
    addToProcessLogData('generateReport=false')
    interactiveValues.generateReport = false
  }

  // Optional - Select what group Id to process the controls and Log Level
  const answers = {
    idType: await select({
      message: 'Select the Control ID Type used to process the controls:',
      default: 'rule',
      choices: [
        {name: 'rule', value: 'rule'},
        {name: 'group', value: 'group'},
        {name: 'cis', value: 'cis'},
        {name: 'version', value: 'version'},
      ],
    }),
    logLevel: await select({
      message: 'Select the log level:',
      default: 'info',
      choices: [
        {name: 'info', value: 'info'},
        {name: 'warn', value: 'warn'},
        {name: 'debug', value: 'debug'},
        {name: 'verbose', value: 'verbose'},
      ],
    }),
  }

  for (const tagName in answers) {
    if (Object.prototype.hasOwnProperty.call(answers, tagName)) {
      const answerValue = _.get(answers, tagName)
      if (answerValue !== null) {
        addToProcessLogData(tagName + '=' + answerValue)
        interactiveValues[tagName] = answerValue
      }
    }
  }

  return interactiveValues
}

function isXccdfFile(xccdfXmlFile: string): boolean {
  let isXccdf = true
  try {
    if (fs.lstatSync(xccdfXmlFile).isFile()) {
      // logger.debug(`Processing the ${xccdfXmlFile} XCCDF file`)
      const inputFile = fs.readFileSync(xccdfXmlFile, 'utf8')
      const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()
      if (inputFirstLine.includes('xccdf')) {
        GenerateDelta.logger.debug('  Valid XCCDF file provided')
      } else {
        const err = `  ERROR: Unable to load ${xccdfXmlFile} as a valid XCCDF`
        GenerateDelta.logger.error(err)
        addToProcessLogData(err)
        isXccdf = false
      }
    } else {
      const err = 'No benchmark (XCCDF) file was provided.'
      GenerateDelta.logger.error(err)
      addToProcessLogData(err)
      isXccdf = false
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorCode = (error as {code?: string}).code // Type-safe access to `code`
      if (errorCode === 'ENOENT') {
        const err = `  ERROR: File not found: ${xccdfXmlFile}. Run the --help command for more information on expected input files.`
        GenerateDelta.logger.error(err)
        addToProcessLogData(err)
        isXccdf = false
      } else {
        const err = `  ERROR: Unable to process the XCCDF XML file ${xccdfXmlFile} because: ${error.message}`
        GenerateDelta.logger.error(err)
        addToProcessLogData(err)
      }
    } else {
      const err = `ERROR: An unexpected error occurred: ${getErrorMessage(error)}`
      GenerateDelta.logger.error(err)
      addToProcessLogData(err)
    }
    isXccdf = false
  }
  return isXccdf
}

function saveLogs(errorMsg: string) {
  const strArray = errorMsg.split('\n')
  for (const error of strArray) {
    GenerateDelta.logger.error(error)
    addToProcessLogData(error.trim())
  }

  saveProcessLogData()
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
