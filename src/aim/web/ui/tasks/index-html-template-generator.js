const fs = require('fs').promises;

const buildDirectoryPath = `${__dirname}/../build/`;
const staticFilesKey = '/static-files/';
const basePathKey = `{{ base_path }}${staticFilesKey}`;

(async () => {
  const HTML = await fs.readFile(`${buildDirectoryPath}index.html`, 'utf8');
  const replacedHTML = HTML.replaceAll(staticFilesKey, basePathKey);

  await fs.writeFile(`${buildDirectoryPath}index-template.html`, replacedHTML);

  console.log('index-template.html file is generated');
})();
