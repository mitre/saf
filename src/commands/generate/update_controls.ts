import fs from 'fs'
import path from 'path'
import {readdir} from 'fs/promises'
import {Command, Flags} from '@oclif/core'
import {processXCCDF} from '@mitre/inspec-objects'
import {createWinstonLogger} from '../../utils/logging'
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import colors from 'colors' // eslint-disable-line no-restricted-imports

export default class UpdateControls extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = 'Update the control names for an existing InSpec profile with updated XCCDF guidance, old controls are saved by default'

  static flags = {
    help: Flags.help({char: 'h'}),
    xccdfXmlFile: Flags.string({char: 'X', required: true, description: 'The XCCDF XML file containing the new guidance - in the form of .xml file'}),
    controlsDir: Flags.string({char: 'c', required: true, description: 'The InsPect profile controls directory containing the profiles to be updated'}),
    controlPrefix: Flags.string({char: 'P', required: false, default: 'V', options: ['V', 'SV'], description: 'Old control number prefix V or SV, default V'}),
    backupControls: Flags.boolean({char: 'b', required: false, default: true, allowNo: true, description: 'Create an oldControls directory in the controls directory and save old controls there'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = [
    'saf generate update_controls -X ./the_xccdf_guidance_file.xml  -c the_controls_directory -L debug',
    'saf generate update_controls -X ./the_xccdf_guidance_file.xml  -c the_controls_directory --no-backupControls -P SV -L debug',
  ]

  async run(): Promise<any> {
    const {flags} = await this.parse(UpdateControls)
    const logger = createWinstonLogger('generate:update_controls', flags.logLevel)

    // Process the XCCDF XML file containing the new/updated profile guidance
    try {
      if (fs.lstatSync(flags.xccdfXmlFile).isFile()) {
        const xccdfXmlFile = flags.xccdfXmlFile
        const inputFile = fs.readFileSync(xccdfXmlFile, 'utf8')
        const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()
        if (inputFirstLine.includes('xccdf')) {
          logger.debug(`The ${xccdfXmlFile} is a valid XCCDF file`)
        } else {
          logger.error(`ERROR: Unable to load ${xccdfXmlFile} as XCCDF`)
          throw new Error('Cannot load XCCDF file')
        }

        logger.debug(`Loaded ${xccdfXmlFile} as XCCDF`)
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
          logger.debug(`Found controls in the controls directory files.length is: ${files.length}`)
          if (flags.backupControls) {
            const oldControlsDir = path.join(flags.controlsDir, 'oldControls')
            if (!fs.existsSync(oldControlsDir)) {
              fs.mkdirSync(oldControlsDir)
            }
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

    logger.debug(`Processing XCCDF Benchmark file: ${flags.xccdfXmlFile} using rule id.`)
    const xccdf = fs.readFileSync(flags.xccdfXmlFile, 'utf8')
    /* eslint-disable prefer-const, max-depth */
    let profile: Profile
    profile = processXCCDF(xccdf, false, 'rule') // skipcq: JS-0242

    // Create a map with: key = legacy id (v or SV number) and value = new id (SV number)
    const xccdfControlsMap = new Map()
    const newControlsMap = new Map()
    profile.controls.forEach(control => {
      const controlId = control.tags.legacy?.map(value => {
        const control = flags.controlPrefix === 'V' ? value.match(/^V-\d+/)?.toString() : value.match(/^SV-\d+/)?.toString()
        return (control === undefined) ? '' : control
      }).find(Boolean)

      xccdfControlsMap.set(controlId, control.id)
      newControlsMap.set(control.id, control.id)
    })

    logger.debug(`Processing controls directory: ${flags.controlsDir} and updating controls file name and Id.`)
    const ext = '.rb'
    let skipped = 0
    let processed = 0
    let isNewControl = 0
    const controlsDir = flags.controlsDir
    const files = await readdir(controlsDir)

    // Iterate trough all files processing ony control files, have a .rb extension
    const skippedControls = []
    const isNewControlMap  = new Map()
    const controlsProcessedMap = new Map()
    for (const file of files) {
      const fileExt = path.extname(file)
      if (fileExt === ext) {
        const oldControlNumber = path.parse(file).name
        const newControlNumber = xccdfControlsMap.get(oldControlNumber)
        // No mapping for the control being processed, either:
        //    1-New Control
        //    2-Already has correct control Id
        if (newControlNumber === undefined) {
          if (newControlsMap.has(oldControlNumber)) {
            isNewControl++
            isNewControlMap.set(oldControlNumber, oldControlNumber)
          } else {
            skipped++
            skippedControls.push(oldControlNumber)
          }
        } else {
          const filePath = path.join(controlsDir, file)
          // Read the control content
          const controlData = fs.readFileSync(filePath, {encoding: 'utf8', flag: 'r'})
          // Change the V or SV Id to the SV Id
          const updatedControl = controlData.replace(`${oldControlNumber}`, `${newControlNumber}`)
          controlsProcessedMap.set(newControlNumber, 'processed')
          const newFileName = path.join(controlsDir, newControlNumber + '.rb')
          // Save new file
          fs.writeFileSync(newFileName, updatedControl)
          processed++
          // Move old control to oldControls folder
          if (flags.backupControls) {
            fs.renameSync(filePath, path.resolve(path.join(controlsDir, 'oldControls'), oldControlNumber + '.rb'))
          // Deleted old file
          } else {
            try {
              fs.unlinkSync(filePath)
            } catch (error: any) {
              logger.error(`ERROR: Unable to deleted old file ${filePath} because: ${error}`)
              throw error
            }
          }
        }
      }
    }

    let newControls = 0
    const newControlsFound = []
    for (const newControl of xccdfControlsMap.values()) {
      if (!controlsProcessedMap.has(newControl) && !isNewControlMap.has(newControl)) {
        newControls++
        newControlsFound.push(newControl)
      }
    }

    console.log(colors.yellow('\n     Total skipped files - no mapping to new control Id:'), `${colors.green(skipped.toString())}`)
    console.log(colors.yellow('Total processed files - found mapping to new control Id: '), `${colors.green(processed.toString())}`)

    console.log(colors.yellow('\n    Total controls with correct identification: '), `${colors.green(isNewControl.toString())}`)
    console.log(colors.yellow('Total new controls found in the XCCDF guidance: '), `${colors.green(newControls.toString())}`)

    console.log(colors.yellow('\nSkipped controls - not included in XCCDF guidance: '), `${colors.green(skippedControls.toString())}`)
    console.log(colors.yellow('\nNew control(s) found - included in XCCDF guidance: '), `${colors.green(newControlsFound.toString())}`)
  }
}
