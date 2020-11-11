const { readFileSync } = require('fs');
const path = require('path');
const assert = require('assert');

const LINE_SEPARATOR = '\n';
const FILE_REF_REGEX = /^FILE: (.+)$/;
const SVG_START = /<svg.*>/;
const SVG_END = /<\/svg>/;
const SVG_ID = /id="([^"]+)"/
const SVG_URL = /url\(#([^)]+)\)/

const loadFileContent = (filePath, options, svgState) => {
  const contents = readFileSync(path.join(options.includeDir, filePath), 'utf-8');
  if (path.extname(filePath) === '.md') {
    return preprocessImpl(contents, options, svgState);
  }
  return contents;
};

const processLine = (line, options, svgState) => {
  for (const m of (line.match(FILE_REF_REGEX) || []).slice(1)) {
    return loadFileContent(m, options, svgState);
  }

  if (svgState.insideSvg) {
    if (line.match(SVG_END)) {
      svgState.insideSvg = false;
      svgState.svgCounter = svgState.svgCounter + 1;
    } else {
      return line.replace(SVG_ID, `id="$1${svgState.svgCounter}"`).replace(SVG_URL, `url(#$1${svgState.svgCounter})`);
    }
  } else if (line.match(SVG_START)) {
    svgState.insideSvg = true;
  }

  return line;
}

const preprocessImpl = (markdown, options, svgState) => {
  return markdown
    .split(LINE_SEPARATOR)
    .map(line => processLine(line, options, svgState))
    .join(LINE_SEPARATOR);
}

const preprocess = async (markdown, options) => {
  var svgState = {
    insideSvg: false,
    svgCounter: 0
  };

  let res = preprocessImpl(markdown, options, svgState);
  return res;
}

module.exports = preprocess;
