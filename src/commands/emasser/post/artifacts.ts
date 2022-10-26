import colorize from 'json-colorizer';
import { Zip } from 'zip-lib';
import { Command, Flags } from "@oclif/core"
import { ArtifactsApi } from '@mitre/emass_client';
import { MilestoneResponsePost } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';
import { outputError } from '../../../utils/emasser/outputError';
import fs from 'fs';
//import * as fs from 'fs';
//import * as fs from 'fs/promises';
import FormData from 'form-data';

export default class EmasserPostArtifacts extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = "Uploads [FILES] to the given [SYSTEM_ID] as artifacts"

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-i,--input] [-T,--isTemplate] [-t,--type] [-c,--category] [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) milestones to one or many POA&M items in a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostArtifacts)
    const apiCxn = new ApiConnection();
    const artifactApi = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // const archiver = new Zip();
    // flags.input.forEach((inputFile: string) => {
    //   if (fs_1.existsSync(inputFile)) {
    //     console.log('Adding file to archiver: ', inputFile)
    //     archiver.addFile(inputFile);
    //   }
    // });

    
    // console.log("Archiving zipper");

    // // Generate zip file.
    // await archiver.archive("zipper.zip").then(function () {
    //   console.log("done");
    // }, function (err: any) {
    //   console.log(err);
    // });

    let zipper = fs.readFileSync("../../uploadData/asff_sample2.json");
    //const zipper = fs.createReadStream("../../uploadData/asff_sample2.json",'utf8');

console.log("zipper is: ", zipper);
//    process.exit(0);
const form = new FormData();
//form.append('field', 'my value');
form.append('file', fs.createReadStream('../../uploadData/asff_sample2.json'));

    let requestBodyArray: object[] = [];
    requestBodyArray.push({
      description: flags.description,
      refPageNumber: flags.refPageNumber,
      ccis: flags.ccis,      
      controls: flags.controls,
      artifactExpirationDate: parseFloat(flags.scheduledCompletionDate),
      lastReviewDate: flags.lastReviewDate
    });

    
    let optionObj: {[key: string]: any} = {};
    optionObj.description = flags.description;
    optionObj.refPageNumber = flags.refPageNumber,
    optionObj.ccis = flags.ccis,      
    optionObj.controls = flags.controls,
    optionObj.artifactExpirationDate = parseFloat(flags.scheduledCompletionDate),
    optionObj.lastReviewDate = flags.lastReviewDate
    requestBodyArray.push(optionObj);

    //artifactApi.addArtifactsBySystemId(flags.systemId, zipper, flags.isTemplate, flags.type, flags.category, {}).then((response: any) => {
      artifactApi.addArtifactsBySystemId(35, zipper, false, 'Other', 'Evidence').then((response: any) => {
      console.log(response);
    }).catch((error:any) => console.error(error));
  }
}