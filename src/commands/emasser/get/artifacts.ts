import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { ArtifactsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getDescriptionForEndpoint, getExamplesForEndpoint, getFlagsForEndpoint } from '../../../emasscommands/utilities';


// args
// forSystems
// export


// calls 
//getSystemArtifacts(systemId: number, filename?: string, controlAcronyms?: string, ccis?: string, systemOnly

// getSystemArtifactsExport: async (systemId: number, filename: string, compress?: boolean