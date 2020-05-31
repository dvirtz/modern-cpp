const preprocess = require('../scripts/preprocess')
const processElement = require('../scripts/compiler-explorer')
const { readFileSync } = require('fs');
const { describe, it } = require('mocha');
const bent = require('bent');
const chai = require('chai')
  , should = chai.should()
const { unstyle } = require('ansi-colors')

const CODE_SNIPPET = /```cpp\n([^`]+)```/sg
const compile = bent('https://godbolt.org/', 'POST', 'json')


describe('compile snippets', function () {
  const text = preprocess(readFileSync('slides/index.md', 'ascii'), { includeDir: 'slides' })

  const codeSnippets = [...text.matchAll(CODE_SNIPPET)].map(m => m[1]);

  codeSnippets.forEach(function (codeSnippet, index) {
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
      const message = `\ncode:\n${info.source}\noutput:\n${unstyle(response.stderr.map(x => x.text).join('\n'))}`;
      if (info.shouldFail) {
        response.code.should.not.equal(0, message);
      } else {
        response.code.should.equal(0, message);
      }
    });
  });

  console.log(`added ${codeSnippets.length} tests`);
});