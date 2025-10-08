import fs from 'fs'
import path from 'path'
import {readdir} from 'fs/promises'
import {execSync} from 'child_process'
import {Flags} from '@oclif/core'
import {createWinstonLogger} from '../../utils/logging'
import {
  getExistingDescribeFromControl,
  processInSpecProfile,
  processXCCDF,
  Profile,
} from '@mitre/inspec-objects'
import colors from 'colors'
import {BaseCommand} from '../../utils/oclif/baseCommand'
import {
  printGreen,
  printRed,
  printBoldRedGreen,
  printYellowGreen,
  addToProcessLogData,
  saveProcessLogData,
} from '../../utils/oclif/cliHelper'
import {basename, downloadFile, extractFileFromZip, getErrorMessage} from '../../utils/global'
import tmp from 'tmp'
import type {Logger} from 'winston'

/**
 * This class is used to prepare profile controls from one SRG or STIG baseline
 * to another. The controls are updated based on guidances provided by the
 * Extensible Configuration Checklist Description Format (XCCDF) document.
 *
 * The XCCDF document is an XML formatted file that containing the updated
 * structured collection of security configuration rules for a specific target
 * system.
 *
 * How are profile controls updated from baseline X to baseline Y
 * 1 - The directory where baseline X controls are located is provided
 * 2 - An InSpec json formatted file containing all baseline X controls is
 *     provided or generated
 *     a - The json file is generated using the inspec json CLI command
 * 3 - A XCCDF file containing the new baseline guidances is provided. The file
 *     is obtained from the DISA site
 *
 * Process:
 * 1 - Housekeeping is done to ensure required data is provided
 * 2 - The InSpec json object is processed - it is converted into a
 *     Profile object (baseline X)
 * 3 - The XCCDF XML data is converted into a json Profile (includes controls)
 *     (baseline Y)
 * 4 - The baseline Y metadata is combined with baseline X code
 * 5 - New controls are written to provided output directory
 */

export default class GenerateUpdateControls extends BaseCommand<typeof GenerateUpdateControls> {
  // static readonly usage = '<%= command.id %> [ARGUMENTS]'

  static readonly description = 'Update Profile Control(s) from baseline X to Y based on DISA XCCDF guidance'

  static readonly examples = [
    {
      description: '\x1B[93mProviding an XCCDF File\x1B[0m',
      command: '<%= config.bin %> <%= command.id %> -X ./the_xccdf_guidance_file.xml [-J <profile_json_file.json>] [-c the_controls_directory --no-backupControls --no-formatControls -P <V or SV> -g -L debug]',
    },
    {
      description: '\x1B[93mProviding an URL point to an ZIP XCCDF (from DISA STIG downloads)\x1B[0m',
      command: '<%= config.bin %> <%= command.id %> -U <URL to DISA STIGs downloads> [-J <profile_json_file.json>] [-c the_controls_directory --no-backupControls --no-formatControls -P <V or SV> -g -L debug]',
    },
  ]

  static readonly flags = {
    xccdfXmlFile: Flags.string({
      char: 'X',
      description: '\x1B[31m(required [-X or -U])\x1B[34m The XCCDF XML file containing the new guidance - in the form of .xml file',
      exclusive: ['xccdfUrl'],
    }),
    xccdfUrl: Flags.url({
      char: 'U',
      description: '\x1B[31m(required [-X or -U])\x1B[34m The URL pointing to the XCCDF file containing the new guidance (DISA STIG downloads)',
      exclusive: ['xccdfXmlFile'],
    }),
    inspecJsonFile: Flags.string({
      char: 'J', required: false,
      description: 'InSpec Profiles JSON summary file - can be generated using the "cinc-auditor or inspec] json <profile path> > profile.json" command',
    }),
    controlsDir: Flags.string({
      char: 'c', required: true,
      description: 'The InSpec profile controls directory containing the profiles to be updated',
    }),
    controlPrefix: Flags.string({
      char: 'P', required: false, default: 'V', options: ['V', 'SV'],
      description: 'Old control number prefix V or SV, default V',
    }),
    useXccdfGroupId: Flags.boolean({
      char: 'g', required: false, default: false, allowNo: true,
      description: 'Use the XCCDF `Group Id` to rename the controls. Uses prefix V or SV based on controlPrefix option\n[default: false]',
    }),
    formatControls: Flags.boolean({
      char: 'f', required: false, default: true, allowNo: true,
      description: 'Format control contents in the same way `generate delta` will write controls\n[default: true]',
    }),
    backupControls: Flags.boolean({
      char: 'b', required: false, default: true, allowNo: true,
      description: 'Preserve modified controls in a backup directory (oldControls) inside the controls directory\n[default: true]',
    }),
  }

  // Class common variables
  static backupDir = ''

  // skipcq: JS-R1005
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, complexity
  async run(): Promise<any> { // skipcq: JS-0044
    const {flags} = await this.parse(GenerateUpdateControls)

    if (!flags.xccdfXmlFile && !flags.xccdfUrl) {
      this.error('\x1B[31mYou must specify either [-X, --xccdfXmlFile or -U --xccdfUrl]\x1B[0m')
    }

    const logger = createWinstonLogger('generate:update_controls', flags.logLevel)

    logger.warn(colors.yellow('╔═══════════════════════════════════════════════╗'))
    logger.warn(colors.yellow('║ Profile controls are formatted using Rubocop  ║'))
    logger.warn(colors.yellow('╚═══════════════════════════════════════════════╝'))

    let inspecProfile: Profile = new Profile()
    GenerateUpdateControls.backupDir = path.join(path.dirname(flags.controlsDir), 'oldControls')

    addToProcessLogData('==================== Update Controls for Delta Process =====================')
    addToProcessLogData(`Date: ${new Date().toISOString()}`)
    addToProcessLogData('\nProcess Flags ===========================================')
    for (const key in flags) {
      if (Object.prototype.hasOwnProperty.call(flags, key)) {
        addToProcessLogData(key + '=' + flags[key as keyof typeof flags])
      }
    }

    // -------------------------------------------------------------------------
    // Check if we have a XCCDF XML or URL file containing the new/updated
    // profile guidance - Must provide either File or URL
    let xccdfXmlFile = ''
    let xccdfContent = ''
    if (flags.xccdfXmlFile) {
      xccdfXmlFile = basename(flags.xccdfXmlFile)
      logger.info(`Verifying that the XCCDF file is valid: ${xccdfXmlFile}...`)
      if (isXccdfFile(flags.xccdfXmlFile, logger)) {
        xccdfContent = fs.readFileSync(flags.xccdfXmlFile, 'utf8')
      } else {
        return
      }
    // XCCDF is an URL
    } else {
      logger.info(`Verifying that the URL contains a valid XCCDF: ${flags.xccdfUrl}...`)
      const tmpobj = tmp.dirSync({unsafeCleanup: true})
      let fileBuffer: Buffer | null = null
      let url

      if (flags.xccdfUrl === undefined) {
        logger.error('URL flag is undefined or invalid')
        return
      } else {
        url = flags.xccdfUrl?.toString()
      }
      await (async () => {
        const zipFile = url.split('/').pop() // Extracts the last segment

        if (!zipFile) {
          throw new Error('Failed to extract zip file name from URL')
        }

        const zipFilePath = path.join(tmpobj.name, zipFile)

        try {
          await downloadFile(url, zipFilePath)
          logger.debug('  Valid XCCDF URL provided')
          const fileNameToExtract = '-xccdf.xml'
          const result = extractFileFromZip(zipFilePath, fileNameToExtract)
          fileBuffer = result[0]
          xccdfXmlFile = result[1].split('/')[1]
          if (fileBuffer) {
            logger.debug(`  Extracted XCCDF file from: ${xccdfXmlFile}`)
            xccdfContent = fileBuffer.toString()
          }
        } catch (error) {
          logger.error('Processing URL failed.', error)
          process.exit(1)
        }
      })()
      tmp.setGracefulCleanup()
    }

    // -------------------------------------------------------------------------
    // Check if we have a controls folder
    logger.info('Verifying that a controls folder exists...')
    if (fs.existsSync(flags.controlsDir)) {
      logger.debug('  Found controls directory')
      try {
        const files = await readdir(flags.controlsDir)
        if (files.length) {
          logger.debug(`  Found ${files.length} Controls in the controls directory`)
          if (flags.backupControls) {
            // Create the backup directory inside the parent controls directory

            if (fs.existsSync(GenerateUpdateControls.backupDir)) {
              fs.rmSync(GenerateUpdateControls.backupDir, {recursive: true, force: true})
            }

            fs.mkdirSync(GenerateUpdateControls.backupDir)
          }
        } else {
          // The controls directory appears to be empty
          logger.error(`No controls were found in the provide directory: ${flags.controlsDir}`)
          throw new Error(`No controls were found in the provide directory: ${flags.controlsDir}`)
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          logger.error(`ERROR: Checking if controls directory is empty, received: ${error.message}`)
          throw new Error(`Error checking controls directory, error: ${error.message}`)
        } else {
          logger.error('ERROR: An unknown error occurred while checking the controls directory.')
          throw new Error('Error checking controls directory. Unknown error encountered.')
        }
      }
    } else {
      logger.error(`Profile Controls directory (folder) not specified or does not exist: ${flags.controlsDir}`)
      process.exit(1)
    }

    // Shorten the controls directory to sow the 'controls' directory and its parent
    const shortControlsDir = path.sep + basename(path.dirname(flags.controlsDir))
      + path.sep + basename(flags.controlsDir)

    // -------------------------------------------------------------------------
    // Check if we have an InSpec json file, generate if not provided
    // Process the InSpec json content, convert entries into a Profile object
    logger.info('Processing the Input execution/profile JSON summary...')
    if (flags.inspecJsonFile) {
      logger.info(`  Using execution/profile summary file: ${basename(flags.inspecJsonFile!)}`) // skipcq: JS-0339
      try {
        if (fs.lstatSync(flags.inspecJsonFile).isFile()) {
          const inspecJsonFile = flags.inspecJsonFile
          inspecProfile = processInSpecProfile(fs.readFileSync(inspecJsonFile, 'utf8'))
          logger.debug('  Converted JSON file into a Profile JSON/Execution object')
        } else {
          throw new Error(`Input execution/profile JSON file not found: ${basename(flags.inspecJsonFile)}.\n`
            + 'Run the --help command to more information on expected input files.')
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          const errorCode = (error as {code?: string}).code // Safe access to `code`
          if (errorCode === 'ENOENT') {
            logger.error(`ERROR: No entity found for: ${flags.inspecJsonFile}. Run the --help command for more information on expected input files.`)
            throw error
          }
          logger.error(`ERROR: Unable to process Input execution/profile JSON ${flags.inspecJsonFile} because: ${error.message}`)
          throw error
        }
        // Fallback for non-Error objects
        logger.error(`ERROR: An unknown error occurred while processing Input execution/profile JSON ${flags.inspecJsonFile}.`)
        throw new Error('Unknown error occurred while processing the input JSON.')
      }
    } else {
      // Generate the profile json
      try {
        logger.info(`  Generating the summary file on directory: ${shortControlsDir}`)
        // Get the directory name without the trailing "controls" directory
        const profileDir = path.dirname(flags.controlsDir)
        const inspecJsonFile = execSync(`cinc-auditor json '${profileDir}'`, {encoding: 'utf8', maxBuffer: 50 * 1024 * 1024})

        logger.info('Generating InSpec Profiles from InSpec JSON summary')
        inspecProfile = processInSpecProfile(inspecJsonFile)
      } catch (error: unknown) {
        if (error instanceof Error) {
          logger.error(`ERROR: Unable to generate the profile JSON because: ${error.message}`)
          throw error
        }
        // Handle cases where error is not an instance of Error
        logger.error('ERROR: An unknown error occurred while generating the profile JSON.')
        throw new Error('Unknown error occurred while generating the profile JSON.')
      }
    }

    // -------------------------------------------------------------------------
    // Process the XCCDF file (convert entries into a Profile object)
    // The XCCDF contains the profiles metadata - it does not have the code descriptions
    logger.info(`Processing XCCDF Benchmark file: ${xccdfXmlFile}...`)
    const idType = (flags.useXccdfGroupId) ? 'group' : 'rule'
    const xccdfProfile = processXCCDF(xccdfContent, false, idType)
    logger.debug(`  Converted XCCDF Benchmark file into a Profile JSON/Execution object using ${idType} Id`)

    // -------------------------------------------------------------------------
    // Create variable map data types containing various Controls Id mappings.
    // The xccdfProfile object has the following identifications (id's):
    //   "id": "SV-205624" -> the new control Id (generated from the Rule or Group Id)
    //   "tags"."gid": "V-205624" -> the group control Id
    //   "tags"."legacy": ["SV-103063", "V-92975"] -> legacy control Id's
    //
    // Mapping is determined based on the "useXccdfGroupId" flag, if set mapping
    // (old control Id to new Id) is accomplished using the tags.gid value,
    // otherwise it is accomplished using the tags.legacy values.
    // NOTE: If using tags.legacy and there isn't any legacy tags, the XCCDF
    //       control Id is used which is defaulted to the Rule Id
    //
    //  xccdfLegacyToControlMap -> maps control legacy Ids to new Ids
    //    (key = legacy Id (V or SV number) and value = new Id (SV number))
    //
    //  xccdfLegacyControlsMap ->  maps old control Ids, used to identify old controls
    //    (key and value are the old control Id)
    //
    //  xccdfControlsMap -> maps new control Ids, used to identify new controls
    //    (key and value are the new control Id)
    //
    //  xccdfNewControlsMetaDataMap -> Contains baseline Y metadata indexed by old control Id
    //    (key = legacy Id (V or SV number) and value = new control metadata)
    //
    // The xccdfLegacyControlsMap and xccdfControlsMap are used so we can invoke the .has(key)
    // method (test if map contains provided key), did we processed the legacy and the new tag
    logger.info('Mapping legacy control Ids...')
    const xccdfLegacyToControlMap = new Map()
    const xccdfLegacyControlsMap = new Map()
    const xccdfControlsMap = new Map()
    const xccdfNewControlsMetaDataMap = new Map()
    for (const control of xccdfProfile.controls) {
      let controlId
      const newControlId = basename(control.id) // Ensure there aren't any leading or trailing slashes
      if (flags.useXccdfGroupId) {
        logger.debug('  Using `tags.gid` to determine new Control Name/Id')
        controlId = (flags.controlPrefix === 'V')
          ? control.tags.gid?.match(/^V-\d+/)?.toString()
          : control.tags.gid?.match(/^SV-\d+/)?.toString()
      } else {
        logger.debug('  Using `tags.legacy` to determine new Control Name/Id')
        controlId = control.tags.legacy?.map((value) => {
          const control = (flags.controlPrefix === 'V')
            ? value.match(/^V-\d+/)?.toString()
            : value.match(/^SV-\d+/)?.toString()
          return (control === undefined) ? '' : control
        }).find(Boolean)
        // If there isn't a legacy tag, use the XCCDF Id (see note above)
        if (controlId === '') {
          controlId = newControlId
        }
      }
      controlId = basename(controlId || '')

      logger.debug(`    Old Control Name/Id: ${controlId} -> New Control Name/Id: ${newControlId}`)
      xccdfLegacyToControlMap.set(controlId, newControlId)
      xccdfLegacyControlsMap.set(controlId, controlId)
      xccdfControlsMap.set(newControlId, newControlId)
      xccdfNewControlsMetaDataMap.set(controlId, control)
    }

    // -------------------------------------------------------------------------
    // Generate a map data type containing the XCCDF metadata (all content minus the code)
    // and add the code from the old control (in InSpec json object)
    //
    //  The xccdfNewControlsMetaDataMap contains the metadata generated from
    //  the XCCDF file (baseline Y)
    //  The InSpec JSON file contains the controls and associated code block generated
    //  from the existing controls (baseline X)
    //
    // Lint the controls using the toRuby method provided by the Controls
    // class if format controls flag is set
    logger.info('Formatting control contents...')
    const baselineYControls = new Map()
    for (const control of inspecProfile.controls) {
      if (control.tags.nist) {
        // Remove any previously added Rev versions to the nist tags
        const index = control.tags.nist.findIndex(value => /Rev_[0-9]/g.test(value))
        if (index !== -1) {
          const badNistTag = control.tags.nist.splice(index, 1)
          logger.debug(`  Removed invalid tags.nist Rev version: ${badNistTag}`)
        }
      }

      // NOTE: Not using the ts-object updateControl function as it maps the
      // metadata (aka tags) from the source onto the new control. Need to add
      // a new function that simply retrieves the describe block (code) from
      // the source and adds to the destination (update) control)
      if (xccdfNewControlsMetaDataMap.has(control.id)) {
        const newControl = xccdfNewControlsMetaDataMap.get(control.id)
        const existingDescribeBlock = getExistingDescribeFromControl(control)
        newControl.describe = existingDescribeBlock

        if (flags.formatControls) {
          logger.debug('  Formatted the same way `generate delta` will write controls.')
          baselineYControls.set(control.id, newControl.toRuby(false))
        } else {
          logger.debug('  Did not formatted the same way `generate delta` will write controls.')
          baselineYControls.set(control.id, newControl.toString())
        }
      }
    }

    // -------------------------------------------------------------------------
    // Update all baseline X controls with content from baseline Y
    // Updated controls have:
    //   Metadata from XCCDF guidances
    //   Code block from matching old control (inspec json)
    logger.info(`Updating controls in directory: ..${shortControlsDir}`)

    const ext = '.rb'
    let skipped = 0
    let processed = 0
    let isCorrectControl = 0
    let notInProfileJSON = 0
    const controlsDir = flags.controlsDir
    const files = await readdir(controlsDir)

    // Iterate trough all files processing ony control files, have a .rb extension
    const skippedControls: string[] = []
    const skipMetadataUpdate: string[] = []
    const isCorrectControlMap = new Map()
    const controlsProcessedMap = new Map()

    for (const file of files) {
      const fileExt = path.extname(file)
      if (fileExt === ext) {
        logger.info(`Processing Control (file): ${file}`)
        const currentFileFullPath = path.join(controlsDir, basename(file))
        const currentControlNumber = basename(path.parse(file).name)
        const newXCCDFControlNumber = xccdfLegacyToControlMap.get(currentControlNumber) // old control Id to new control Id
        const xccdfNewControlNumber = xccdfControlsMap.get(currentControlNumber) // new control Id to new control Id
        const xccdfLegacyControlNumber = xccdfLegacyControlsMap.get(currentControlNumber) // old control Id to old control Id
        let updatedControl

        // FILE = XCCDF (new control Id)
        if (currentControlNumber === xccdfNewControlNumber) {
          logger.debug(`  Baseline X Control is current: ${currentControlNumber} `)

          // Update statistics (value does not matter)
          isCorrectControl++
          isCorrectControlMap.set(currentControlNumber, currentControlNumber)

          // Process the control
          if (baselineYControls.has(currentControlNumber)) {
            logger.debug('  \x1B[32mUpdating Control metadata with XCCDF content\x1B[0m')
            updatedControl = baselineYControls.get(currentControlNumber)
            // Save file
            saveControl(currentFileFullPath, currentControlNumber, currentControlNumber, updatedControl, flags.backupControls, false)
          }

        // FILE = LEGACY NUMBER (old control Id)
        } else if (currentControlNumber === xccdfLegacyControlNumber) {
          logger.debug(`  Baseline X Control Id is not the same as baseline Y, changing From: ${currentControlNumber} To: ${newXCCDFControlNumber}`)

          // Change the V or SV Id to the SV Id based on format flag
          if (baselineYControls.has(currentControlNumber)) {
            logger.debug('  \x1B[32mUpdating Control metadata with XCCDF content\x1B[0m')
            updatedControl = baselineYControls.get(currentControlNumber)
          } else {
            logger.debug('  \x1B[31mKeeping Control metadata content - Updating Control name\x1B[0m')
            notInProfileJSON++
            skipMetadataUpdate.push(`(${currentControlNumber} wasn't updated with metadata from: ${newXCCDFControlNumber})`)
            updatedControl = getUpdatedControl(currentFileFullPath, currentControlNumber, newXCCDFControlNumber)
          }

          saveControl(currentFileFullPath, newXCCDFControlNumber, currentControlNumber, updatedControl, flags.backupControls, true)
          processed++
          controlsProcessedMap.set(newXCCDFControlNumber, 'processed')

        // FILE ≠ XCCDF
        } else if (xccdfNewControlNumber === undefined) {
          logger.warn(`  Control skipped updating (not in the XCCDF guidance): ${currentControlNumber}`)
          skipped++
          skippedControls.push(currentControlNumber)
        // FILE ≠ XCCDF ≠ LEGACY NUMBER
        } else {
          logger.error('  No logic found processing Control (not current, or in the XCCDF guidance, or a legacy Control)')
        }
      }
    }

    let newControls = 0
    const newControlsFound: unknown[] = []
    for (const newControl of xccdfControlsMap.values()) {
      if (!controlsProcessedMap.has(newControl) && !isCorrectControlMap.has(newControl)) {
        newControls++
        newControlsFound.push(newControl)
      }
    }

    // listen for the logger finish event to know when logging has completely finished
    logger.on('finish', () => {
      addToProcessLogData('\nProcess Statistics ===========================================================================\n')

      if (flags.formatControls) {
        printGreen('╔════════════════════════════════════════════════════════════════════════════════╗')
        printGreen('║ Controls were formatted the same way `generate delta` will update the controls ║')
        printGreen('╚════════════════════════════════════════════════════════════════════════════════╝')
      } else {
        printRed('╔════════════════════════════════════════════════════════════════════════════════════╗')
        printRed('║ Controls were NOT formatted the same way `generate delta` will update the controls ║')
        printRed('╚════════════════════════════════════════════════════════════════════════════════════╝')
      }

      printYellowGreen('\n     Total skipped files (no mapping to new control Id):', `${skipped.toString().padStart(4)}`)
      printYellowGreen('Total processed files (found mapping to new control Id): ', `${processed.toString().padStart(3)}`)

      printYellowGreen('\n    Total controls with correct identification: ', `${isCorrectControl.toString().padStart(3)}`)
      printYellowGreen('Total new controls found in the XCCDF guidance: ', `${newControls.toString().padStart(3)}`)

      printYellowGreen('\nSkipped control(s) (not included in XCCDF guidance): ', `${skippedControls.toString()}`)
      printYellowGreen('\n  New control(s) found (included in XCCDF guidance): ', `${newControlsFound.toString()}`)

      if (notInProfileJSON > 0) {
        printBoldRedGreen('\nTotal skipped metadata update (not found in Input execution/profile JSON file): ', `${notInProfileJSON.toString().padStart(3)}`)
        printBoldRedGreen('Control(s) skipped metadata update: ', `${skipMetadataUpdate.toString()}`)
      }

      if (flags.logLevel !== 'info') {
        saveProcessLogData()
      }
    })

    // Signal that you're done logging - emits a finish event
    logger.end()
  }
}

function isXccdfFile(xccdfXmlFile: string, logger: Logger): boolean {
  let isXccdf = true
  try {
    if (fs.lstatSync(xccdfXmlFile).isFile()) {
      // logger.debug(`Processing the ${xccdfXmlFile} XCCDF file`)
      const inputFile = fs.readFileSync(xccdfXmlFile, 'utf8')
      const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()
      if (inputFirstLine.includes('xccdf')) {
        logger.debug('  Valid XCCDF file provided')
      } else {
        logger.error(`ERROR: Unable to load ${xccdfXmlFile} as XCCDF`)
        isXccdf = false
      }
    } else {
      logger.error('No benchmark (XCCDF) file was provided.')
      isXccdf = false
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorCode = (error as {code?: string}).code // Type-safe access to `code`
      if (errorCode === 'ENOENT') {
        logger.error(
          `ERROR: No entity found for: ${xccdfXmlFile}. Run the --help command for more information on expected input files.`,
        )
      }
      logger.error(
        `ERROR: Unable to process the XCCDF XML file ${xccdfXmlFile} because: ${error.message}`,
      )
    } else {
      logger.error(`ERROR: An unexpected error occurred: ${getErrorMessage(error)}`)
    }
    isXccdf = false
  }
  return isXccdf
}

function getUpdatedControl(path: fs.PathOrFileDescriptor, currentControlNumber: string, newControlNumber: string) {
  // Read the control content
  const controlData = fs.readFileSync(path, {encoding: 'utf8', flag: 'r'})
  if (newControlNumber !== undefined) {
    controlData.replace(currentControlNumber, newControlNumber)
  }

  return controlData
}

function saveControl(filePath: string, newXCCDFControlNumber: string,
  currentControlNumber: string, updatedControl: string,
  backupControls: boolean, renamedControl: boolean) {
  const newFileName = path.join(path.dirname(filePath), newXCCDFControlNumber + '.rb')

  // Move processed (old) control to oldControls folder
  if (backupControls) {
    const destFilePath = path.resolve(path.join(GenerateUpdateControls.backupDir, currentControlNumber + '.rb'))
    if (renamedControl) {
      fs.renameSync(filePath, destFilePath)
    } else {
      fs.copyFileSync(filePath, destFilePath)
    }

  // Delete processed (old) file
  } else if (renamedControl) {
    fs.unlinkSync(filePath)
  }

  // Save new file
  fs.writeFileSync(newFileName, updatedControl)
}
