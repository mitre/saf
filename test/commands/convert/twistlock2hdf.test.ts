import {expect, test} from "@oclif/test";
import tmp from "tmp";
import path from "path";
import fs from "fs";
import {omitHDFChangingFields} from "../utils";

describe("Test twistlock", () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true});

  test
    .stdout()
    .command([
      "convert twistlock2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/twistlock/sample_input_report/twistlock-twistcli-sample-1.json"
      ),
      "-o",
      `${tmpobj.name}/twistlocktest.json`,
    ])
    .it("hdf-converter output test", () => {
      const test = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/twistlocktest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve("./test/sample_data/twistlock/twistlock-hdf.json"),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
    });
});

describe("Test twistlock withraw flag", () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true});

  test
    .stdout()
    .command([
      "convert twistlock2hdf",
      "-i",
      path.resolve(
        "./test/sample_data/twistlock/sample_input_report/twistlock-twistcli-sample-1.json"
      ),
      "-o",
      `${tmpobj.name}/twistlocktest.json`,
      "-w",
    ])
    .it("hdf-converter withraw output test", () => {
      const test = JSON.parse(
        fs.readFileSync(`${tmpobj.name}/twistlocktest.json`, "utf8")
      );
      const sample = JSON.parse(
        fs.readFileSync(
          path.resolve(
            "./test/sample_data/twistlock/twistlock-hdf-withraw.json"
          ),
          "utf8"
        )
      );
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
    });
});
