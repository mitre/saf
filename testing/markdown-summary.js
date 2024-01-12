"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var yargs_1 = require("yargs");
var get_stdin_1 = require("get-stdin");
var helpers_1 = require("yargs/helpers");
// Define the order of the rows and columns
var ROW_ORDER = ["Total", "Critical", "High", "Medium", "Low", "Not Applicable"];
var COLUMN_ORDER = [
    "Passed :white_check_mark:",
    "Failed :x:",
    "Not Reviewed :leftwards_arrow_with_hook:",
    "Not Applicable :heavy_minus_sign:",
    "Error :warning:",
];
function generateRow(row, data, columnWidths) {
    var values;
    if (row === "Total") {
        values = [
            data["passed"]["total"].toString(),
            data["failed"]["total"].toString(),
            data["skipped"]["total"].toString(),
            data["no_impact"]["total"].toString(),
            data["error"]["total"].toString(),
        ];
    }
    else if (row === "Not Applicable") {
        values = ["-", "-", "-", data["no_impact"]["total"].toString(), "-"];
    }
    else {
        values = [
            data["passed"][row.toLowerCase()].toString(),
            data["failed"][row.toLowerCase()].toString(),
            data["skipped"][row.toLowerCase()].toString(),
            "-",
            data["error"][row.toLowerCase()].toString(),
        ];
    }
    return "| ".concat(row.padEnd(columnWidths), " | ").concat(values.map(function (val) { return val.padEnd(columnWidths); }).join(" | "), " |\n");
}
function processData(data, output) {
    return __awaiter(this, void 0, void 0, function () {
        var columnWidths, table, _i, ROW_ORDER_1, row;
        return __generator(this, function (_a) {
            // Extract the first item from the list (assuming there's only one item)
            data = data[0];
            columnWidths = Math.max.apply(Math, ROW_ORDER.map(function (row, i) { return Math.max(row.length, COLUMN_ORDER[i] ? COLUMN_ORDER[i].length : 0); }));
            table = "| Compliance: ".concat(data["compliance"], "% :test_tube: | ").concat(COLUMN_ORDER.map(function (col) { return col.padEnd(columnWidths); }).join(" | "), " |\n");
            table += "| ".concat("-".padEnd(columnWidths, "-"), " | ").concat(COLUMN_ORDER.map(function () { return "-".padEnd(columnWidths, "-"); }).join(" | "), " |\n");
            for (_i = 0, ROW_ORDER_1 = ROW_ORDER; _i < ROW_ORDER_1.length; _i++) {
                row = ROW_ORDER_1[_i];
                table += generateRow(row, data, columnWidths);
            }
            if (output) {
                fs.writeFileSync(output, table);
            }
            else {
                console.log(table);
            }
            return [2 /*return*/];
        });
    });
}
var argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
    // If an input file was provided, read the data from the file
    var rawData = fs.readFileSync(argv.input);
    var data = JSON.parse(rawData.toString());
    processData(data, argv.output);
}
else {
    // If no input file was provided, read the data from stdin
    (0, get_stdin_1.default)().then(function (rawData) {
        var data = JSON.parse(rawData);
        processData(data, argv.output);
    });
}
// npm install yargs
// npm install get-stdin
