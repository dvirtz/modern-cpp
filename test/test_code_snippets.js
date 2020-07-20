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
const { assert, dir } = require('console');

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
      this.timeout(60000);

      fileSnippets.snippets.forEach(function (codeSnippet, index) {
        it(`should compile ${fileSnippets.file} snippet #${index}`, async function () {
          for (const line of codeSnippet.code) {
            const directiveMessage = `${codeSnippet.fullLocation} :\nwrong directive: ${line}`
            if (line.startsWith('//') && !line.startsWith('///')) {
              for (directive of directives) {
                line.should.not.match(directive, directiveMessage);
              };
            }
            else if (line.startsWith('///')) {
              line.should.satisfy(line => directives.some(directive => line.match(directive)), directiveMessage);
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
          const message = (stderr) => `\n${codeSnippet.fullLocation} :\n${unstyle(stderr.map(x => x.text).join('\n'))}`;
          const compileMessage = message(response.stderr);
          if (info.execute) {
            const execMessage = message( response.execResult.buildResult.stderr.concat(response.execResult.stderr));
            if (info.failReason) {
              if (response.code === 0) {
                response.execResult.code.should.not.equal(0, execMessage);
                execMessage.should.contain(info.failReason);
              } else {
                compileMessage.should.contain(info.failReason)
              }
            }
            else {
              response.execResult.code.should.be.at.least(0, execMessage);
            }
          }
          else if (info.failReason) {
            response.code.should.not.equal(0, compileMessage);
            compileMessage.should.contain(info.failReason)
          } else {
            response.code.should.equal(0, compileMessage);
          }
        });
      });

    });
  });