const { readFileSync } = require('fs');
const path = require('path');

const LINE_SEPARATOR = '\n';
const FILE_REF_REGEX = /^FILE: (.+)$/;
const SVG_START = /<svg.*>/;
const SVG_END = /<\/svg>/;
const SVG_ID = /id="([^"]+)"/;
const SVG_URL = /url\(#([^)]+)\)/;
const QUOTED_IMAGE_REF = /"(\w+\.(jpg|png|gif|svg))"/;
const PARENS_IMAGE_REF = /\((\w+\.(jpg|png|gif|svg))\)/

const loadFileContent = (filePath, options) => {
  options.filePath = filePath;
  const contents = readFileSync(path.join(options.includeDir, filePath), 'utf-8');
  if (path.extname(filePath) === '.md') {
    return preprocessImpl(contents, options);
  }
  return contents;
};

const processLine = (line, options) => {
  if (options.insideSvg) {
    if (line.match(SVG_END)) {
      options.insideSvg = false;
      options.svgCounter = options.svgCounter + 1;
      return line;
    } 
    
    return line.replace(SVG_ID, `id="$1${options.svgCounter}"`).replace(SVG_URL, `url(#$1${options.svgCounter})`);
  } 
  
  if (line.match(SVG_START)) {
    options.insideSvg = true;
    return line;
  } 
  
  for (const m of (line.match(FILE_REF_REGEX) || []).slice(1)) {
    return loadFileContent(m, options);
  }

  if (options.filePath) {
    if (QUOTED_IMAGE_REF.test(line)) {
      return line.replace(QUOTED_IMAGE_REF, `"${path.basename(path.dirname((options.filePath)))}/$1"`);
    } 

    return line.replace(PARENS_IMAGE_REF, `(${path.basename(path.dirname((options.filePath)))}/$1)`);
  }

  return line;
}

const preprocessImpl = (markdown, options) => {
  return markdown
    .split(LINE_SEPARATOR)
    .map(line => processLine(line, options))
    .join(LINE_SEPARATOR);
}

const preprocess = async (markdown, options) => {
  let preprocessOptions = Object.assign({}, options, {
    insideSvg: false,
    svgCounter: 0
  });

  let res = preprocessImpl(markdown, preprocessOptions);
  return res;
}

module.exports = preprocess;
