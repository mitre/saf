const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const ROW_ORDER = ["Total", "Critical", "High", "Medium", "Low", "Not Applicable"];
const COLUMN_ORDER = [
    "Passed :white_check_mark:",
    "Failed :x:",
    "Not Reviewed :leftwards_arrow_with_hook:",
    "Not Applicable :heavy_minus_sign:",
    "Error :warning:",
];

function generateRow(row, data, columnWidths) {
    let values;
    if (row === "Total") {
        values = [
            data["passed"]["total"].toString(),
            data["failed"]["total"].toString(),
            data["skipped"]["total"].toString(),
            data["no_impact"]["total"].toString(),
            data["error"]["total"].toString(),
        ];
    } else if (row === "Not Applicable") {
        values = ["-", "-", "-", data["no_impact"]["total"].toString(), "-"];
    } else {
        values = [
            data["passed"][row.toLowerCase()].toString(),
            data["failed"][row.toLowerCase()].toString(),
            data["skipped"][row.toLowerCase()].toString(),
            "-",
            data["error"][row.toLowerCase()].toString(),
        ];
    }
    return `| ${row.padEnd(columnWidths)} | ${values.map(val => val.padEnd(columnWidths)).join(" | ")} |\n`;
}

function processData(data, output) {
    data = data[0];
    let columnWidths = Math.max(...ROW_ORDER.map((row, i) => Math.max(row.length, COLUMN_ORDER[i] ? COLUMN_ORDER[i].length : 0)));
    let table = `| Compliance: ${data["compliance"]}% :test_tube: | ${COLUMN_ORDER.map(col => col.padEnd(columnWidths)).join(" | ")} |\n`;
    table += `| ${"-".padEnd(columnWidths, "-")} | ${COLUMN_ORDER.map(() => "-".padEnd(columnWidths, "-")).join(" | ")} |\n`;
    for (let row of ROW_ORDER) {
        table += generateRow(row, data, columnWidths);
    }
    if (output) {
        fs.writeFileSync(output, table);
    } else {
        console.log(table);
    }
}

const argv = yargs(hideBin(process.argv))
    .option('input', {
        alias: 'i',
        description: 'The JSON file to process',
        type: 'string',
    })
    .option('output', {
        alias: 'o',
        description: 'The file to write the output to',
        type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv.input) {
    let rawData = fs.readFileSync(argv.input);
    let data = JSON.parse(rawData.toString());
    processData(data, argv.output);
} else {
    import('get-stdin').then((module) => {
        module.default().then((rawData) => {
            let data = JSON.parse(rawData);
            processData(data, argv.output);
        });
    });
}