import fs from 'fs'
import path from 'path'
import {readdir} from 'fs/promises'
import {execSync} from 'child_process'
import {Command, Flags} from '@oclif/core'
import {createWinstonLogger} from '../../utils/logging'
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import {processInSpecProfile, processXCCDF} from '@mitre/inspec-objects'
import colors from 'colors' // eslint-disable-line no-restricted-imports

export default class GenerateUpdateControls extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = 'Update the control names and/or format for an existing InSpec profile with updated XCCDF guidance, old controls are saved by default'

  static flags = {
    help: Flags.help({char: 'h'}),
    xccdfXmlFile: Flags.string({char: 'X', required: true, description: 'The XCCDF XML file containing the new guidance - in the form of .xml file'}),
    inspecJsonFile: Flags.string({char: 'J', required: false, description: 'Input execution/profile JSON file - can be generated using the "inspec json <profile path> > profile.json" command'}),
    controlsDir: Flags.string({char: 'c', required: true, description: 'The InSpec profile controls directory containing the profiles to be updated'}),
    controlPrefix: Flags.string({char: 'P', required: false, default: 'V', options: ['V', 'SV'], description: 'Old control number prefix V or SV, default V'}),
    useXccdfGroupId: Flags.boolean({char: 'g', required: false, default: false, allowNo: true, description: 'Use the XCCDF `Group Id` to rename the controls. Uses prefix V or SV based on controlPrefix option\n[default: false]'}),
    formatControls: Flags.boolean({char: 'f', required: false, default: true, allowNo: true, description: 'Format control contents in the same way `generate delta` will write controls\n[default: true]'}),
    backupControls: Flags.boolean({char: 'b', required: false, default: true, allowNo: true, description: 'Preserve modified controls in a backup directory (oldControls) inside the controls directory\n[default: true]'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = [
    'saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -c the_controls_directory -L debug',
    'saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -c the_controls_directory -g -L debug',
    'saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -c the_controls_directory -J ./the_profile_json-L debug',
    'saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -c the_controls_directory --no-formatControls -P SV -L debug',
    'saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -c the_controls_directory --no-backupControls --no-formatControls -P SV -L debug',
  ]

  // skipcq: JS-R1005
  async run(): Promise<any> { // skipcq: JS-0044
    const {flags} = await this.parse(GenerateUpdateControls)
    const logger = createWinstonLogger('generate:update_controls', flags.logLevel)

    this.warn(colors.yellow('╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗'))
    this.warn(colors.yellow('║ Make sure that profile controls are in cookstyle format - see https://docs.chef.io/workstation/cookstyle/ ║'))
    this.warn(colors.yellow('╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝'))

    let inspecProfile: Profile

    // Process the XCCDF XML file containing the new/updated profile guidance
    try {
      if (fs.lstatSync(flags.xccdfXmlFile).isFile()) {
        const xccdfXmlFile = flags.xccdfXmlFile
        logger.debug(`Processing the ${xccdfXmlFile} XCCDF file`)
        const inputFile = fs.readFileSync(xccdfXmlFile, 'utf8')
        const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()
        if (inputFirstLine.includes('xccdf')) {
          logger.debug(`The ${xccdfXmlFile} is a valid XCCDF file`)
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

    // Check if we have a controls folder
    if (fs.existsSync(flags.controlsDir)) {
      logger.debug('Found controls directory')
      fs.readdir(flags.controlsDir, function (err, files) { // skipcq: JS-0241
        if (err) {
          logger.error(`ERROR: Checking in controls directory is empty, received: ${err.message}`)
          throw new Error(`Error checking controls directory, error: ${err.message}`)
        } else if (files.length) {
          logger.debug(`Found ${files.length} Controls in the controls directory`)
          if (flags.backupControls) {
            const oldControlsDir = path.join(flags.controlsDir, 'oldControls')
            if (fs.existsSync(oldControlsDir)) {
              fs.rmSync(oldControlsDir, {recursive: true, force: true})
            }

            fs.mkdirSync(oldControlsDir)
          }
        } else {
          // directory appears to be empty
          logger.error(`No controls were found in the provide directory: ${flags.controlsDir}`)
          throw new Error(`No controls were found in the provide directory: ${flags.controlsDir}`)
        }
      })
    } else {
      throw new Error('Controls folder not specified or does not exist')
    }

    // Generate or Process the Input execution/profile JSON file
    if (flags.formatControls) {
      // Process provided Profile JSON file
      if (flags.inspecJsonFile) {
        try {
          if (fs.lstatSync(flags.inspecJsonFile).isFile()) {
            const inspecJsonFile = flags.inspecJsonFile
            logger.debug(`Loading ${inspecJsonFile} as Profile JSON/Execution JSON`)
            inspecProfile = processInSpecProfile(fs.readFileSync(inspecJsonFile, 'utf8'))
            logger.debug(`Loaded ${inspecJsonFile} as Profile JSON/Execution JSON`)
          } else {
            throw new Error(`No entity found for: ${flags.inspecJsonFile}. Run the --help command to more information on expected input files.`)
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
      } else {
        // Generate the profile json
        try {
          logger.info(`Generating the profile json using inspec json command on '${flags.controlsDir}'`)
          // Get the directory name without the trailing "controls" directory
          const profileDir = path.dirname(flags.controlsDir)
          const inspecJsonFile = execSync(`inspec json '${profileDir}'`, {encoding: 'utf8', maxBuffer: 50 * 1024 * 1024})

          logger.info('Generating InSpec Profiles from InSpec JSON summary')
          inspecProfile = processInSpecProfile(inspecJsonFile)
        } catch (error: any) {
          logger.error(`ERROR: Unable to generate the profile json because: ${error}`)
          throw error
        }
      }
    }

    // Process the XCCDF file and convert entries into a Profile object
    // The XCCDF contains the profiles metadata - it does not have the code descriptions
    logger.debug(`Processing XCCDF Benchmark file: ${flags.xccdfXmlFile} using rule id (SAF inspect objects - processXCCDF).`)
    const xccdf = fs.readFileSync(flags.xccdfXmlFile, 'utf8')
    /* eslint-disable prefer-const, max-depth */
    let xccdfProfile: Profile
    xccdfProfile = processXCCDF(xccdf, false, 'rule') // skipcq: JS-0242

    // Create a map data type (xccdfLegacyToControlMap) with: key = legacy Id (V or SV number) and value = new Id (SV number)
    // Create a map data type (xccdfLegacyControlsMap) to be used as a flag to identify new controls (key and value are the new control Id)
    // Create a map data type (xccdfControlsMap) to be used as a flag to identify legacy controls (key and value are the legacy control Id)
    // The xccdfLegacyControlsMap and xccdfControlsMap are used so we can invoke the .has(key) method (test if map contains provided key),
    //   there is, did we processed the legacy tag and the new tag
    logger.info('Mapping legacy control Ids')
    const xccdfLegacyToControlMap = new Map()
    const xccdfLegacyControlsMap = new Map()
    const xccdfControlsMap = new Map()
    if (flags.useXccdfGroupId) {
      logger.debug('Using Group Id for mapping')
      xccdfProfile.controls.forEach(control => {
        const controlId = flags.controlPrefix === 'V' ? control.tags.gid?.match(/^V-\d+/)?.toString() : control.tags.gid?.match(/^SV-\d+/)?.toString()
        xccdfLegacyToControlMap.set(controlId, control.id)
        xccdfLegacyControlsMap.set(controlId, controlId)
        xccdfControlsMap.set(control.id, control.id)
      })
    } else {
      logger.debug('Using tags to determine legacy Ids')
      xccdfProfile.controls.forEach(control => {
        const controlId = control.tags.legacy?.map(value => {
          const control = flags.controlPrefix === 'V' ? value.match(/^V-\d+/)?.toString() : value.match(/^SV-\d+/)?.toString()
          return (control === undefined) ? '' : control
        }).find(Boolean)
        xccdfLegacyToControlMap.set(controlId, control.id)
        xccdfLegacyControlsMap.set(controlId, controlId)
        xccdfControlsMap.set(control.id, control.id)
      })
    }

    // Create a map data type containing the controls found in the processed InSpec JSON file
    //   The InSpec JSON file contains the controls and associated code block (these are
    //   created from the existing controls - They are updated via the Delta process)
    // Lint the controls using the toRuby method provided by the Controls class
    const inspecProfileFormattedControls = new Map()
    if (flags.formatControls) {
      logger.debug('Formatting control contents in the same way `generate delta` will write controls.')
      inspecProfile!.controls.forEach(control => { // skipcq: JS-0339
        inspecProfileFormattedControls.set(control.id, control.toRuby(false))
      })
    }

    logger.debug(`Processing controls directory: ${flags.controlsDir} and updating controls file name and new control number (id).`)
    const ext = '.rb'
    let skipped = 0
    let processed = 0
    let isCorrectControl = 0
    let notInProfileJSON = 0
    const controlsDir = flags.controlsDir
    const files = await readdir(controlsDir)

    // Iterate trough all files processing ony control files, have a .rb extension
    const skippedControls: string[] = []
    const skippedFormatting: string[] = []
    const isCorrectControlMap  = new Map()
    const controlsProcessedMap = new Map()

    for (const file of files) {
      const fileExt = path.extname(file)
      if (fileExt === ext) {
        logger.debug(`Processing file: ${file}`)
        const currentFileFullPath = path.join(controlsDir, file)
        const currentControlNumber = path.parse(file).name
        const newXCCDFControlNumber = xccdfLegacyToControlMap.get(currentControlNumber)
        const xccdfControlNumber = xccdfControlsMap.get(currentControlNumber)
        const xccdfLegacyControlNumber = xccdfLegacyControlsMap.get(currentControlNumber)
        let updatedControl
        // FILE = XCCDF
        if (currentControlNumber === xccdfControlNumber) {
          logger.debug(`  The profile control number is current: ${currentControlNumber} `)

          isCorrectControl++
          isCorrectControlMap.set(currentControlNumber, currentControlNumber) // Map used to compute output statistics (value does not matter)
          if (flags.formatControls) {
            // Check if the formatted control is indexed by current control - if it isn't, this control was already processed
            /* eslint-disable-next-line unicorn/prefer-ternary */
            if (inspecProfileFormattedControls.get(currentControlNumber)) {
              updatedControl = inspecProfileFormattedControls.get(currentControlNumber)
            } else {
              updatedControl = getUpdatedControl(currentFileFullPath, currentControlNumber, 'undefined')
            }
          } else {
            // Just get the control data
            updatedControl = getUpdatedControl(currentFileFullPath, currentControlNumber, 'undefined')
          }

          // Save file
          saveControl(currentFileFullPath, currentControlNumber, currentControlNumber, updatedControl, flags.backupControls, false)

          // FILE = LEGACY NUMBER
        } else if (currentControlNumber === xccdfLegacyControlNumber) {
          logger.debug(`  Control number is not current - changing: ${currentControlNumber} with: ${newXCCDFControlNumber}`)

          // Change the V or SV Id to the SV Id based on format flag
          if (flags.formatControls) {
            if (inspecProfileFormattedControls.has(xccdfLegacyControlNumber)) {
              updatedControl = inspecProfileFormattedControls.get(xccdfLegacyControlNumber).replace(`${currentControlNumber}`, `${newXCCDFControlNumber}`)
            } else {
              notInProfileJSON++
              skippedFormatting.push(`(Profile: ${currentControlNumber} XCCDF: ${newXCCDFControlNumber})`)
              updatedControl = getUpdatedControl(currentFileFullPath, currentControlNumber, 'undefined')
            }
            // Don't format, just replace the control name (SV or V) and assign value to the updatedControl variable
          } else {
            updatedControl = getUpdatedControl(currentFileFullPath, currentControlNumber, newXCCDFControlNumber)
          }

          saveControl(currentFileFullPath, newXCCDFControlNumber, currentControlNumber, updatedControl, flags.backupControls, true)
          processed++
          controlsProcessedMap.set(newXCCDFControlNumber, 'processed')

          // FILE ≠ XCCDF
        } else if (xccdfControlNumber === undefined) {
          logger.debug(`  Control not included in the SAF inspect objects (processXCCDF) output: ${currentControlNumber}`)
          skipped++
          skippedControls.push(currentControlNumber)
          // FILE ≠ XCCDF ≠ LEGACY NUMBER
        } else {
          logger.debug(`  No logic found processing Control: ${currentControlNumber}`)
        }
      }
    }

    let newControls = 0
    const newControlsFound: any[] = []
    for (const newControl of xccdfControlsMap.values()) {
      if (!controlsProcessedMap.has(newControl) && !isCorrectControlMap.has(newControl)) {
        newControls++
        newControlsFound.push(newControl)
      }
    }

    logger.on('finish', () => {
      console.log(colors.yellow('\n     Total skipped files - no mapping to new control Id:'), colors.green(`${skipped.toString().padStart(4)}`))
      console.log(colors.yellow('Total processed files - found mapping to new control Id: '), colors.green(`${processed.toString().padStart(3)}`))

      console.log(colors.yellow('\n    Total controls with correct identification: '), colors.green(`${isCorrectControl.toString().padStart(3)}`))
      console.log(colors.yellow('Total new controls found in the XCCDF guidance: '), colors.green(`${newControls.toString().padStart(3)}`))

      console.log(colors.yellow('\nSkipped control(s) - not included in XCCDF guidance: '), `${colors.green(skippedControls.toString())}`)
      console.log(colors.yellow('\n  New control(s) found - included in XCCDF guidance: '), `${colors.green(newControlsFound.toString())}`)

      if (flags.formatControls && notInProfileJSON > 0) {
        console.log(colors.bold.red('\nTotal skipped formatting - not found in the profile json: '), colors.green(`${notInProfileJSON.toString().padStart(3)}`))
        console.log(colors.bold.red('Control(s) skipped formatting: '), colors.green(`${skippedFormatting.toString()}`))
      }
    })

    logger.end()
  }
}

function getUpdatedControl(path: fs.PathOrFileDescriptor, currentControlNumber: string, newControlNumber: string) {
  // Read the control content
  const controlData = fs.readFileSync(path, {encoding: 'utf8', flag: 'r'})
  if (newControlNumber !== undefined) {
    controlData.replace(currentControlNumber, newControlNumber)
  }

  return controlData
}

/* eslint-disable-next-line max-params */
function saveControl(filePath: string, newXCCDFControlNumber: string, currentControlNumber: string,
  updatedControl: string, backupControls: boolean, renamedControl: boolean) {
  const controlsDir = path.dirname(filePath)
  const newFileName = path.join(controlsDir, newXCCDFControlNumber + '.rb')

  // Move processed (old) control to oldControls folder
  if (backupControls) {
    const destFilePath = path.resolve(path.join(controlsDir, 'oldControls', currentControlNumber + '.rb'))
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
