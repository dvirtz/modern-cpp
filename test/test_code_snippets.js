const { parseMarkdownSync, compile } = require('reveal-test');
const assert = require('assert');
const path = require('path');
const { cwd } = require('process');
const FileHound = require('filehound');

const config = {
  compiler: 'g83'
};

FileHound.create().path('slides').ext('md').findSync()
  .map(file => {
    return {
      file: path.relative('slides', file),
      snippets: parseMarkdownSync(path.join(cwd(), file), config)
    };
  })
  .filter(fileSnippets => fileSnippets.snippets.length > 0)
  .map(fileSnippets => {
    describe(`compile snippets from ${fileSnippets.file}`, function () {

      fileSnippets.snippets.forEach(function (codeSnippet, index) {
        it(`should compile snippet #${index} of ${fileSnippets.file}`, async function () {
          await compile(codeSnippet);
        });
      });
    });
  });