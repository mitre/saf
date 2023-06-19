// As long as we are using commonjs syntax we must use inquirer@^8.0.0
// Inquirer v9 and higher are native esm modules (https://github.com/SBoudrias/Inquirer.js)
declare module 'inquirer';
// If you are still using CJS, please install inquirer-file-tree-selection-prompt@^1 version 1.0.19
// https://github.com/anc95/inquirer-file-tree-selection
declare module 'inquirer-file-tree-selection-prompt';
