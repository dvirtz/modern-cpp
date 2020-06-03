const { readFile } = require('fs').promises;
const path = require('path');

const LINE_SEPARATOR = '\n';
const FILE_REF_REGEX = /^FILE: (.+)$/;

const loadFileContent = async (filePath, basePath) => {
  return readFile(path.join(basePath, filePath));
};

const processLine = async (line, basePath) => {
  const match = line.match(FILE_REF_REGEX)

  if (match) {
    return loadFileContent(match[1], basePath);
  }

  return new Promise((resolve) => resolve(line));
}

const readIndex = async (markdown, options) =>
  Promise.all(markdown
    .split(LINE_SEPARATOR)
    .map(line => processLine(line, options.includeDir)))
    .then(lines => lines.join(LINE_SEPARATOR));

const fileList = (markdown) =>
  [...markdown.matchAll(new RegExp(FILE_REF_REGEX, 'gm'))]
    .map(m => m[1]);

module.exports = {
  readIndex,
  fileList
}
