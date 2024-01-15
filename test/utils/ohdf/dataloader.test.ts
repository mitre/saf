import {expect} from 'chai'
import path from 'path'
import {ContextualizedEvaluation} from 'inspecjs'
import {loadExecJSONs} from '../../../src/utils/ohdf/dataLoader'

describe('dataLoader.ts utils', () => {
  let hdfFilePath: string
  let evaluation: ContextualizedEvaluation
  let result: { [key: string]: ContextualizedEvaluation }

  before(() => {
    // Arrange
    hdfFilePath = path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json')

    // Act
    result = loadExecJSONs([hdfFilePath])
    evaluation = result[hdfFilePath]
  })

  it('should have hdfFilePath as a key in the result', () => {
    expect(result).to.have.key(hdfFilePath)
  })

  it('should have a property named profiles', () => {
    expect(evaluation.data).to.have.property('profiles')
  })

  it('should have the first profile name as redhat-enterprise-linux-8-stig-baseline', () => {
    expect(evaluation.data.profiles[0].name).to.equal('redhat-enterprise-linux-8-stig-baseline')
  })
})
