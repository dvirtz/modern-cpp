const { readFile } = require('fs').promises;
const path = require('path');

const LINE_SEPARATOR = '\n';
const FILE_REF_REGEX = /^FILE: (.+)$/;

const loadFileContent = async (filePath, options) => {
  const contents = await readFile(path.join(options.includeDir, filePath), 'utf-8');
  if (path.extname(filePath) === '.md') {
    return preprocess(contents, options);
  }
  return contents;
};

const processLine = async (line, options) => {
  for (const m of (line.match(FILE_REF_REGEX) || []).slice(1)) {
    return loadFileContent(m, options);
  }

  return Promise.resolve(line);
}

const preprocess = async (markdown, options) =>
Promise.all(markdown
  .split(LINE_SEPARATOR)
  .map(line => processLine(line, options)))
  .then(lines => lines.join(LINE_SEPARATOR));

module.exports = preprocess;
