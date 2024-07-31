import { expect, test } from "@oclif/test";
import tmp from "tmp";
import path from "path";
import fs from "fs";
import { omitHDFChangingFields } from "../utils";

describe("Test Trufflehog", () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command([
      "convert Trufflehog2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/Trufflehog/sample_input_report/trufflehog.json"
      ),
      "-o",
      `${tmpobj.name}/Trufflehogtest.json`,
    ])
    .it("hdf-converter output test", () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/Trufflehogtest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve("./test/sample_data/Trufflehog/trufflehog-hdf.json"),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});

describe("Test Trufflehog withraw flag", () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command([
      "convert Trufflehog2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/Trufflehog/sample_input_report/trufflehog.json"
      ),
      "-o",
      `${tmpobj.name}/Trufflehogtest.json`,
      "-w",
    ])
    .it("hdf-converter withraw output test", () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/Trufflehogtest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            "./test/sample_data/Trufflehog/trufflehog-hdf-withraw.json"
          ),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});

describe("Test Trufflehog Docker Example", () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command([
      "convert Trufflehog2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/Trufflehog/sample_input_report/trufflehog_docker_example.json"
      ),
      "-o",
      `${tmpobj.name}/Trufflehogtest.json`,
    ])
    .it("hdf-converter output test", () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/Trufflehogdockertest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            "./test/sample_data/Trufflehog/trufflehog-docker-hdf.json"
          ),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});

describe("Test Trufflehog docker example withraw flag", () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command([
      "convert Trufflehog2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/Trufflehog/sample_input_report/trufflehog_docker_example.json"
      ),
      "-o",
      `${tmpobj.name}/Trufflehogtest.json`,
      "-w",
    ])
    .it("hdf-converter withraw output test", () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/Trufflehogtest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            "./test/sample_data/Trufflehog/trufflehog-docker-hdf-withraw.json"
          ),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});

describe("Test Trufflehog json object", () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command([
      "convert Trufflehog2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/Trufflehog/sample_input_report/trufflehog-report-example.json"
      ),
      "-o",
      `${tmpobj.name}/Trufflehogtest.json`,
    ])
    .it("hdf-converter output test", () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/Trufflehogtest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            "./test/sample_data/Trufflehog/trufflehog-report-example-hdf.json"
          ),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});

describe("Test Trufflehog json object withraw flag", () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command([
      "convert Trufflehog2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/Trufflehog/sample_input_report/trufflehog-report-example.json"
      ),
      "-o",
      `${tmpobj.name}/Trufflehogtest.json`,
      "-w",
    ])
    .it("hdf-converter withraw output test", () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/Trufflehogtest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            "./test/sample_data/Trufflehog/trufflehog-report-example-hdf-withraw.json"
          ),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});

describe("Test Trufflehog saf example", () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command([
      "convert Trufflehog2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/Trufflehog/sample_input_report/trufflehog_saf_example.json"
      ),
      "-o",
      `${tmpobj.name}/Trufflehogtest.json`,
    ])
    .it("hdf-converter output test", () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/Trufflehogtest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve("./test/sample_data/Trufflehog/trufflehog-saf-hdf.json"),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});

describe("Test Trufflehog saf example withraw flag", () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command([
      "convert Trufflehog2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/Trufflehog/sample_input_report/trufflehog_saf_example.json"
      ),
      "-o",
      `${tmpobj.name}/Trufflehogtest.json`,
      "-w",
    ])
    .it("hdf-converter withraw output test", () => {
      const converted = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/Trufflehogtest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            "./test/sample_data/Trufflehog/trufflehog-saf-hdf-withraw.json"
          ),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(converted)).to.eql(
        omitHDFChangingFields(sample)
      );
    });
});
