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
const promiseRetry = require('promise-retry');

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
          const response = await promiseRetry(async (retry) => {
            try {
              return compile(`api/compiler/${info.compiler}/compile`, data);
            }
            catch (err) {
              if (Math.trunc(err.statusCode / 100) === 5) {
                retry(err);
              }

              throw err;
            }
          });
          const error = (stderr) => unstyle(stderr.map(x => x.text).join('\n'));
          const message = (error) => `\n${codeSnippet.fullLocation} :\n${error}`;
          const compileError = error(response.stderr);
          const compileMessage = message(compileError);
          if (info.execute) {
            const execError = error(response.execResult.buildResult.stderr.concat(response.execResult.stderr));
            const execMessage = message(execError);
            if (info.failReason) {
              if (response.code === 0) {
                response.execResult.code.should.not.equal(0, execMessage);
                execError.should.contain(info.failReason, execMessage);
              } else {
                compileError.should.contain(info.failReason)
              }
            }
            else {
              response.execResult.code.should.be.at.least(0, execMessage);
            }
          }
          else if (info.failReason) {
            response.code.should.not.equal(0, compileMessage);
            compileError.should.contain(info.failReason, compileMessage);
          } else {
            response.code.should.equal(0, compileMessage);
          }
        });
      });

    });
  });