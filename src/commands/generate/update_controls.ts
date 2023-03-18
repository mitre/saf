import fs from 'fs'
import {readdir} from 'fs/promises'
import {Command, Flags} from '@oclif/core'
import {processXCCDF} from '@mitre/inspec-objects'
import {createWinstonLogger} from '../../utils/logging'
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import path from 'path'


export default class UpdateControls extends Command {

  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = 'Update the controls names of an existing InSpec profile with updated XCCDF guidance, old controls are place in oldControls directory'

  static flags = {
    help: Flags.help({char: 'h'}),
    xccdfXmlFile: Flags.string({char: 'X', required: true, description: 'The XCCDF XML file containing the new guidance - in the form of .xml file'}),
    controlsDir: Flags.string({char: 'o', required: true, description: 'The InsPect profile controls directory containing the profiles to be updated'}),
    backupControls: Flags.boolean({char: 'b', required: false, default: true, description: 'Create an oldControls ddirectory in the controls directory and save old controls there'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = [
    'saf generate update_controls -X ./the_xccdf_guidance_file.xml  -o the_output_directory -o ./path_to_inspect_controls_directory -L debug',
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
    if (!fs.existsSync(flags.controlsDir)) {
      throw new Error('Controls folder not specified or does not exist')
    } else {
      logger.debug('Found controls directory')
      fs.readdir(flags.controlsDir, function(err, files) {
        if (err) {
          logger.error(`ERROR: Checking in controls directory is empty, received: ${err.message}`)
          throw new Error(`Error checking controls directory, error: ${err.message}`)
        } else {
          if (!files.length) {
            // directory appears to be empty
            logger.error(`No controls were found in the provide directory: ${flags.controlsDir}`)
            throw new Error(`No controls were found in the provide directory: ${flags.controlsDir}`)
          } else {
            logger.debug(`Found controls in the controls directory files.length is: ${files.length}`)
            if (flags.backupControls) {
              let oldControlsDir = path.join(flags.controlsDir, 'oldControls')
              if (!fs.existsSync(oldControlsDir)) {
                fs.mkdirSync(oldControlsDir)
              }
            }
          }
        }
      });
    }

    logger.debug(`Processing XCCDF Benchmark file: ${flags.xccdfXmlFile} using rule id.`)
    let profile: Profile
    const xccdf = fs.readFileSync(flags.xccdfXmlFile, 'utf8')
    profile = processXCCDF(xccdf, false, 'rule')
   
    // Create a map with: key = legacy id (v number) and value = new id (SV number)
    let controlsMap = new Map();
    profile.controls.forEach(control => {
      let controlId = control.tags.legacy?.map((value) => {
        let control = value.match(/^V-\d+/)?.toString()
        return (control == undefined) ? '':control
      }).filter(Boolean)[0]; 

      //console.log("TAG ID: ", control.id)
      //console.log("TAG LEGACY: ", controlId)
      //console.log("----------------------------------------")
      
      controlsMap.set(controlId, control.id)
    });

    //console.log("profile length is: ", profile.controls.length)
    //console.log("New SV number for V-92979 is: ", controlsMap.get('V-92979'))

    logger.debug(`Processing controls directory: ${flags.controlsDir} and updating controls file name and Id.`)
    let ext = '.rb'
    let processed = 0
    let skipped = 0
    let tasks: any[] = []
    let controlsDir = flags.controlsDir
    const files = await readdir(controlsDir);
    for (const file of files) {
      const fileExt = path.extname(file);
      if (fileExt === ext) {
        // console.log("found file: ", path.parse(file).name)
        // console.log("New SV number for is: ", controlsMap.get(path.parse(file).name))
        let oldControlNumber = path.parse(file).name
        let newControlNumber = controlsMap.get(path.parse(file).name)
        // console.log("oldControlNumber is: ", oldControlNumber)
        // console.log("newControlNumber is: ", newControlNumber)
        // console.log("File is: ", path.join(controlsDir,file))
        // console.log("----------------------------------------")
        if (newControlNumber == undefined) {
          skipped ++
          console.log("No SV number found, skipping file: ", file)
        } else {
          let filePath = path.join(controlsDir,file)
          tasks.push(fs.readFile(filePath, 'utf-8', (err, contents) => {
            if(err) throw err;
            const updated = contents.replace(`${oldControlNumber}`, `${newControlNumber}`)
            let newFileName = path.join(controlsDir, newControlNumber+'.rb')
            tasks.push(fs.writeFile(newFileName, updated, 'utf-8', err2 => {
              if (err2) {
                console.log(err2)
              } else {
                processed ++
                console.log("Updated fie: ", filePath)
                // move old control to oldControls folder
                tasks.push(fs.rename(filePath, path.resolve(path.join(controlsDir,'oldControls'), oldControlNumber+'.rb') , (err)=>{
                  if(err) throw err;
                  //else console.log('Successfully moved old control: ', oldControlNumber+'.rb');
                }))
              }
            }))
          }))
        }
      }
    }
    Promise.all(tasks)
      .then(res => {
          console.log(`Total processed files: ${processed}`)
          console.log(`Total skipped files: ${skipped}`)
        }
      )
      .catch(err => console.log(err));
  }
}
