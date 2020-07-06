const { processElement, directives } = require('../scripts/compiler-explorer');
const { fileList } = require('../scripts/index-reader');
const { readFileSync, createReadStream } = require('fs');
const { describe, it } = require('mocha');
const bent = require('bent');
const chai = require('chai')
  , should = chai.should();
const { unstyle } = require('ansi-colors');
const path = require('path');
const { pwd, cwd } = require('process');
const { assert } = require('console');

const SNIPPET_MARK = /^```/;
const compile = bent('https://godbolt.org/', 'POST', 'json');

const slideFile = file => readFileSync(path.join('slides', file), 'ascii');

const fileSnippets = file => {
  let snippets = [];
  let currentSnippet = null;

  slideFile(file)
    .split('\n')
    .forEach((line, index) => {
      if (currentSnippet) {
        if (line.match(SNIPPET_MARK)) {
          snippets.push(currentSnippet);
          currentSnippet = null
        } else {
          currentSnippet.code.push(line)
        }
      } else if (line.match(SNIPPET_MARK)) {
        currentSnippet = {
          shortLocation: `${file}:${index + 1}`,
          fullLocation: `${path.join(cwd(), 'slides', file)}:${index + 1}`,
          code: []
        }
      }
    });

  return snippets;
};

fileList(slideFile('index.md'))
  .map(file => {
    return {
      file: file,
      snippets: fileSnippets(file)
    };
  })
  .filter(fileSnippets => fileSnippets.snippets.length > 0)
  .map(fileSnippets => {
    describe(`compile snippets from ${fileSnippets.file}`, function () {
      this.timeout(5000);

      fileSnippets.snippets.forEach(function (codeSnippet, index) {
        it(`should compile ${fileSnippets.file} snippet #${index}`, async function () {
          for (const line of codeSnippet.code) {
            if (line.startsWith('//') && !line.startsWith('///')) {
              for (directive of directives) {
                line.should.not.match(new RegExp(directive), `${codeSnippet.fullLocation} :\nwrong directive: ${line}`);
              };
            }
          }
          const [info] = processElement(codeSnippet.code.join(['\n']))
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
          const message = `\n${codeSnippet.fullLocation} :\n${unstyle(response.stderr.map(x => x.text).join('\n'))}`;
          if (info.failReason) {
            response.code.should.not.equal(0, message);
            message.should.contain(info.failReason)
          } else {
            response.code.should.equal(0, message);
          }
        });
      });

    });
  });