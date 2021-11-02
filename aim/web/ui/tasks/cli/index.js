const yargs = require('yargs/yargs');

const commands = {
  'create-component': './commands/createComponent',
};

const command = yargs(process.argv.slice(2)).argv._[0];

require(commands[command]);
