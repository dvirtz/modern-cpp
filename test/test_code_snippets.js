const { fileList } = require('../scripts/index-reader');
const { parseMarkdownSync, compile } = require('reveal-test');
const assert = require('assert');
const { readFileSync } = require('fs');
const path = require('path');
const { cwd } = require('process');

const config = {
  compiler: 'g83'
};

fileList(readFileSync(path.join('slides', 'slides.md'), 'utf-8'))
  .map(file => {
    return {
      file: file,
      snippets: parseMarkdownSync(path.join(cwd(), 'slides', file), config)
    };
  })
  .filter(fileSnippets => fileSnippets.snippets.length > 0)
  .map(fileSnippets => {
    describe(`compile snippets from ${fileSnippets.file}`, function () {

      fileSnippets.snippets.forEach(function (codeSnippet, index) {
        it(`should compile snippet #${index} of ${fileSnippets.file}`, async function () {
          await assert.doesNotReject(compile(codeSnippet));
        });
      });
    });
  });