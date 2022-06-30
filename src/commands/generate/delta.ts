import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {diffProfile, processJSON, processXCCDF} from '@mitre/inspec-objects'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import fse from 'fs-extra'
import {knownInspecMetadataKeys} from '../../utils/global'
import {escapeDoubleQuotes, wrap, wrapAndEscapeQuotes} from '../../utils/xccdf2inspec'

export default class GenerateDelta extends Command {
  static usage = 'generate:delta -i, --input=JSON -o, --output=OUTPUT'

  static description: string = 'Update existing InSpec profiles with new STIG metadata'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input execution/profile JSON file(s) OR InSpec Profile Folder, and the updated XCCDF XML files'}),
    output: Flags.string({char: 'o', required: true, description: 'Output updated profile folder'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  removeQuotedStringsNewlines(input: string): string {
    let controlText = input
    const quotedNewlinesRegex = /"([^"\\])*(\\.[^"\\]*)*"/gm
    let currentRegexMatch
    while ((currentRegexMatch = quotedNewlinesRegex.exec(input)) !== null) {
      // This is needed to avoid infinite loops with zero-width matches
      if (currentRegexMatch.index === quotedNewlinesRegex.lastIndex) {
        quotedNewlinesRegex.lastIndex++
      }

      currentRegexMatch.forEach(match => {
        if (match?.includes('\n')) {
          controlText = controlText.replace(match, match.replace(/\n/gm, '{{{{newlineHERE}}}}')).trim()
        }
      })
    }

    return controlText
  }

  getLineIdentifier(line: string): string | null {
    // Get the second word in the line
    // Remove double spaces
    const lineIdentifier = line.replace(/\s+/g, ' ').trim().split(' ')[1]
    if (lineIdentifier.includes(',') || lineIdentifier.includes(':')) {
      return lineIdentifier.replace(/"/g, '').replace(/,/g, '').replace(/:/g, '')
    }

    return null
  }

  async run() {
    const {flags} = await this.parse(GenerateDelta)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    let controls: Record<string, string> | null = null
    let existingProfile: any | null = null
    let updatedXCCDF: any = {}

    let existingProfileFolderPath = ''

    flags.input.forEach(inputPath => {
      // Check if input is a folder
      if (fs.lstatSync(inputPath).isDirectory()) {
        logger.debug(`Loading profile folder ${inputPath}`)
        const controlFiles = fs.readdirSync(path.join(inputPath, 'controls')).filter(file => file.toLowerCase().endsWith('.rb'))
        logger.debug(`Found ${controlFiles.length} control files in ${inputPath}`)

        controls = {}
        // Read all control files into an array as strings
        controlFiles.forEach(control => {
          const controlData = fs.readFileSync(path.join(inputPath, 'controls', control), 'utf8')
          controls![control.replace('.rb', '')] = controlData
        })

        logger.debug(`Loaded ${inputPath} as profile folder`)

        existingProfileFolderPath = inputPath
      } else {
        try {
          // This should fail if we aren't passed an execution/profile JSON
          logger.debug(`Loading ${inputPath} as Profile JSON/Execution JSON`)
          existingProfile = processJSON(fs.readFileSync(inputPath, 'utf8'))
          logger.debug(`Loaded ${inputPath} as Profile JSON/Execution JSON`)
        } catch (error) {
          try {
            // Attempt to read the file as an XCCDF XML file
            logger.debug(`Loading ${inputPath}`)
            const xccdfData = fs.readFileSync(inputPath, 'utf8')
            updatedXCCDF = processXCCDF(xccdfData, true)
            logger.debug(`Loaded ${inputPath} as XCCDF`)
          } catch (xccdfError) {
            logger.error(`Could not load ${inputPath} as an execution/profile JSON because:`)
            logger.error(error)
            logger.error(`Could not load ${inputPath} as an XCCDF XML file because:`)
            logger.error(xccdfError)
            throw error
          }
        }
      }
    })

    // If existingProfileFolderPath exists
    if (existingProfileFolderPath) {
      // Delete the output folder if it already exists
      if (fs.existsSync(flags.output)) {
        logger.debug(`Deleting existing profile folder ${flags.output}`)
        fse.removeSync(flags.output)
      }

      // Copy the profile folder to the output folder
      logger.debug(`Copying profile folder ${existingProfileFolderPath} to ${flags.output}`)
      fse.copySync(existingProfileFolderPath, flags.output)
      logger.debug(`Copied profile folder ${existingProfileFolderPath} to ${flags.output}`)
      // Empty controls folder contents
      logger.debug(`Emptying controls folder ${flags.output}/controls`)
      fse.emptyDirSync(path.join(flags.output, 'controls'))
      logger.debug(`Emptied controls folder ${flags.output}/controls`)
    }

    // If all variables have been satisfied, we can generate the delta
    if (existingProfile && updatedXCCDF) {
      if (!controls) {
        logger.warn('No existing control found in profile folder, delta will only be printedd to the console')
        controls = {}
      }

      // Find the difference between existingProfile and updatedXCCDF
      const diff = diffProfile(existingProfile, updatedXCCDF)

      // Add all new controls to the existingControlsRubyCode
      diff.addedControlIDs.forEach((controlId: string) => {
        logger.debug(`Adding new control ${controlId} to profile`)
        controls![controlId] = diff.changedControls[controlId].toRuby()
        // Delete so we don't try to update the new control
        delete diff.changedControls[controlId]
      })

      let updatedDesc = false

      // Update existing controls with new metadata
      Object.entries(diff.changedControls).forEach(([controlId, updatedControl]: [string, any]) => {
        // Remove newlines within blocks of strings to make replacement easier
        const controlText = this.removeQuotedStringsNewlines(controls![controlId])
        const controlLines = controlText.split('\n')

        // Replace the old control metadata with the new control metadata
        const newControlLines = controlLines.map(line => {
          // Ignore comment lines
          if (line.trim().startsWith('#')) {
            return line
          }

          if (line.trim().startsWith('title') && updatedControl.title) {
            return wrap(`  title "${escapeDoubleQuotes(updatedControl.title)}"`, 80)
          }

          if (line.trim().startsWith('impact') && updatedControl.impact) {
            return `  impact "${updatedControl.impact}"`
          }

          if (line.trim().startsWith('desc ')) {
            const descriptionType = this.getLineIdentifier(line)
            if (descriptionType && descriptionType in updatedControl.descs) {
              return wrap(`  desc "${descriptionType}", "${escapeDoubleQuotes(updatedControl.descs[descriptionType])}"`)
            }

            if (updatedControl.desc && !updatedDesc) {
              updatedDesc = true
              return `  desc "${wrapAndEscapeQuotes(updatedControl.desc, 80)}"`
            }
          }

          if (line.trim().startsWith('tag ')) {
            const tagType = this.getLineIdentifier(line)
            if (tagType && tagType in updatedControl.tags) {
              if (typeof updatedControl.tags[tagType] === 'string') {
                return `  tag ${tagType}: "${wrapAndEscapeQuotes(updatedControl.tags[tagType], 80)}"`
              }

              return `  tag ${tagType}: ${JSON.stringify(updatedControl.tags[tagType])}`
            }
          }

          return line
        })

        // Write the new control to the controls folder
        logger.debug(`Writing new control ${controlId} to profile`)
        const updatedControlText = newControlLines.join('\n').replace(/\{\{\{\{newlineHERE\}\}\}\}/g, '\n')
        fs.writeFileSync(path.join(flags.output, 'controls', `${controlId}.rb`), updatedControlText)
      })

      logger.info(`Generating delta for ${existingProfile.title}`)
      // Write the delta to a file
      fs.writeFileSync(path.join(flags.output, 'delta.json'), JSON.stringify(diff, null, 2))
    } else {
      logger.error('Could not generate delta because one or more of the following variables were not satisfied:')

      if (!existingProfile) {
        logger.error('existingProfile')
      }

      if (!updatedXCCDF) {
        logger.error('updatedXCCDF')
      }
    }
  }
}
