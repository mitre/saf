import {expect, test} from '@oclif/test';
import tmp from 'tmp';
import path from 'path';
import fs from 'fs';
import {omitHDFChangingFields} from '../utils';

describe('Test NeuVector', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true});

  test
    .stdout()
    .command([
      'convert nevuector2hdf',
      '-i',
      path.resolve(
        './test/sample_data/neuvector/sample_input_report/neuvector-mitre-caldera.json'
      ),
      '-o',
      `${tmpobj.name}/neuvectortest.json`
    ])
    .it('hdf-converter output test', () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8')
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            './test/sample_data/neuvector/neuvector-hdf-mitre-caldera.json'
          ),
          'utf8'
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });

  test
    .stdout()
    .command([
      'convert nevuector2hdf',
      '-i',
      path.resolve(
        './test/sample_data/neuvector/sample_input_report/neuvector-mitre-heimdall.json'
      ),
      '-o',
      `${tmpobj.name}/neuvectortest.json`
    ])
    .it('hdf-converter output test', () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8')
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            './test/sample_data/neuvector/neuvector-hdf-mitre-heimdall.json'
          ),
          'utf8'
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });

  test
    .stdout()
    .command([
      'convert nevuector2hdf',
      '-i',
      path.resolve(
        './test/sample_data/neuvector/sample_input_report/neuvector-mitre-heimdall2.json'
      ),
      '-o',
      `${tmpobj.name}/neuvectortest.json`
    ])
    .it('hdf-converter output test', () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8')
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            './test/sample_data/neuvector/neuvector-hdf-mitre-heimdall2.json'
          ),
          'utf8'
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });

  test
    .stdout()
    .command([
      'convert nevuector2hdf',
      '-i',
      path.resolve(
        './test/sample_data/neuvector/sample_input_report/neuvector-mitre-vulcan.json'
      ),
      '-o',
      `${tmpobj.name}/neuvectortest.json`
    ])
    .it('hdf-converter output test', () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8')
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            './test/sample_data/neuvector/neuvector-hdf-mitre-vulcan.json'
          ),
          'utf8'
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});

describe('Test NeuVector withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true});

  test
    .stdout()
    .command([
      'convert neuvector2hdf',
      '-i',
      path.resolve(
        './test/sample_data/neuvector/sample_input_report/neuvector-mitre-caldera.json'
      ),
      '-o',
      `${tmpobj.name}/neuvectortest.json`,
      '-w'
    ])
    .it('hdf-converter withraw output test', () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8')
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            './test/sample_data/neuvector/neuvector-hdf-withraw-mitre-caldera.json'
          ),
          'utf8'
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });

  test
    .stdout()
    .command([
      'convert neuvector2hdf',
      '-i',
      path.resolve(
        './test/sample_data/neuvector/sample_input_report/neuvector-mitre-heimdall.json'
      ),
      '-o',
      `${tmpobj.name}/neuvectortest.json`,
      '-w'
    ])
    .it('hdf-converter withraw output test', () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8')
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            './test/sample_data/neuvector/neuvector-hdf-withraw-mitre-heimdall.json'
          ),
          'utf8'
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });

  test
    .stdout()
    .command([
      'convert neuvector2hdf',
      '-i',
      path.resolve(
        './test/sample_data/neuvector/sample_input_report/neuvector-mitre-heimdall2.json'
      ),
      '-o',
      `${tmpobj.name}/neuvectortest.json`,
      '-w'
    ])
    .it('hdf-converter withraw output test', () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8')
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            './test/sample_data/neuvector/neuvector-hdf-withraw-mitre-heimdall2.json'
          ),
          'utf8'
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });

  test
    .stdout()
    .command([
      'convert neuvector2hdf',
      '-i',
      path.resolve(
        './test/sample_data/neuvector/sample_input_report/neuvector-mitre-vulcan.json'
      ),
      '-o',
      `${tmpobj.name}/neuvectortest.json`,
      '-w'
    ])
    .it('hdf-converter withraw output test', () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8')
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            './test/sample_data/neuvector/neuvector-hdf-withraw-mitre-vulcan.json'
          ),
          'utf8'
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});
