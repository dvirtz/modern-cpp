const processElement = require('../scripts/compiler-explorer')
const { fileList } = require('../scripts/index-reader')
const { readFileSync } = require('fs');
const { describe, it } = require('mocha');
const bent = require('bent');
const chai = require('chai')
  , should = chai.should()
const { unstyle } = require('ansi-colors')
const path = require('path');

const CODE_SNIPPET = /```cpp\n([^`]+)```/sg
const compile = bent('https://godbolt.org/', 'POST', 'json')

const slideFile = file => readFileSync(path.join('slides', file), 'ascii');

fileList(slideFile('index.md'))
  .map(file => {
    return {
      file: file,
      snippets: [...slideFile(file).matchAll(CODE_SNIPPET)].map(m => m[1])
    };
  })
  .filter(fileSnippets => fileSnippets.snippets.length > 0)
  .map(fileSnippets => {
    describe(`compile snippets from ${fileSnippets.file}`, function () {
      this.timeout(5000);

      fileSnippets.snippets.forEach(function (codeSnippet, index) {
        it(`should compile snippet ${index}`, async function () {
          const [info] = processElement(codeSnippet)
          const data = {
            source: info.source,
            options: {
              userArguments: info.options,
              filters: {
                execute: info.execute
              },
              libraries: info.libs.map(function (lib) {
                return {
                  id: lib.name,
                  version: lib.ver
                };
              })
            }
          };
          const response = await compile(`api/compiler/${info.compiler}/compile`, data);
          const message = `\noutput:\n${unstyle(response.stderr.map(x => x.text).join('\n'))}\ncode:\n${info.source}`;
          if (info.shouldFail) {
            response.code.should.not.equal(0, message);
          } else {
            response.code.should.equal(0, message);
          }
        });
      });

    });
  });