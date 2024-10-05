import { parseMarkdownFile, compile } from 'reveal-test';
import path from 'path';
import { cwd } from 'process';
import FileHound from 'filehound';

const config = {
  compiler: 'g102'
};

const snippets = await FileHound.create().path('slides').ext('md').find()
  .map(async file => {
    return {
      file: path.relative('slides', file),
      snippets: await parseMarkdownFile(path.join(cwd(), file), config)
    };
  })
  .filter(fileSnippets => fileSnippets.snippets.length > 0);

snippets
  .map(fileSnippets => {
    describe(`compile snippets from ${fileSnippets.file}`, function () {

      fileSnippets.snippets.forEach(function (codeSnippet, index) {
        it(`should compile snippet #${index} of ${fileSnippets.file}`, async function () {
          await compile(codeSnippet);
        });
      });
    });
  });
