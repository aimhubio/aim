/* eslint-disable no-console */
// npm run create-component -- --name=ComponentName --path=/path/where/component/shouldBeCreated
// @TODO enhance cli options, to have full support of two styles i.e. --lint, -l, and use yargs config

const fs = require('fs');
const { execSync } = require('child_process');

const yargs = require('yargs/yargs');

const {
  getTypesBaseCode,
  getStylesBaseCode,
  getComponentBaseCode,
  getExportsBaseCode,
} = require('../src/componentData');

const messages = {
  ERROR_NAME: "error: Component's name missing.",
  ERROR_PATH: 'error: Wrong Path.',
  ERROR_DUPLICATE_NAME: 'error: Component with this name already exists.',
  SUCCESS: 'Component Successfully Created!',
  LINT_SUCCESS: 'Code Style Successfully formatted!',
};

const exitWithMessage = (message) => {
  console.error(message);
  process.exit(1);
};

const getDetails = () => {
  let { name, path: folderPath, lint } = yargs(process.argv.slice(2)).argv;
  if (!name) {
    exitWithMessage(messages.ERROR_NAME);
  }
  if (!folderPath) {
    folderPath = process.env.INIT_CWD;
  }
  return [name, folderPath, lint];
};

const checkPath = (path) => {
  if (!fs.existsSync(path)) {
    exitWithMessage(messages.ERROR_PATH);
  }
};

const createFolder = (path, name) => {
  const fullPath = path + '/' + name;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
  } else {
    exitWithMessage(messages.ERROR_DUPLICATE_NAME);
  }
};

const createFiles = (path, name) => {
  console.warn('Creating files ...');
  const fullPath = path + '/' + name;
  try {
    fs.writeFileSync(fullPath + `/${name}.d.ts`, getTypesBaseCode(name));
    fs.writeFileSync(fullPath + `/${name}.scss`, getStylesBaseCode(name));
    fs.writeFileSync(
      fullPath + '/' + name + '.tsx',
      getComponentBaseCode(name),
    );
    fs.writeFileSync(fullPath + '/index.tsx', getExportsBaseCode(name));
  } catch (err) {
    exitWithMessage(err);
  }
};

const lintFix = (name, path) => {
  const cmd = `npx eslint ./${name}/*.{ts,tsx} --quiet --fix`;
  console.warn('Formatting code style ... ');
  console.warn(`Executing $${cmd} ...`);
  try {
    // execSync(`eslint ${path}/*.{ts,tsx} --quiet --fix`);
    execSync(cmd, {
      cwd: path,
      stdio: 'inherit',
    });

    console.log(messages.LINT_SUCCESS);
  } catch (err) {
    exitWithMessage("Error - Couldn't fix formatting");
    exitWithMessage(`Original error message - ${err.message}`);
  }
};
const [componentName, folderPath, lint] = getDetails();

checkPath(folderPath);
createFolder(folderPath, componentName);
createFiles(folderPath, componentName);

console.log(messages.SUCCESS);

// fix lint
if (lint) {
  lintFix(componentName, folderPath);
}
