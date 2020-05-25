Reveal.addEventListener('ready', (event) => {
    const isLocal = !!window.location.host.match(/localhost/gi);
    const ce_nodes = document.querySelectorAll('code.language-cpp');

    for (element of ce_nodes) {
        let compiler = isLocal ? "clangdefault" : "g82";
        let options = "-O2 -march=haswell";
        let execute = false
        let libs = []
        let source = unescape(element.textContent);
        let lines = source.split('\n');
        source = "";
        let displaySource = "";
        const hideMatcher = /^\s*\/\/\/\s*((un)?hide)$/;
        const executeMatcher = /^\s*\/\/\/\s*execute$/;
        const compilerMatcher = /^\s*\/\/\/\s*compiler=(.*)$/;
        const optionsMatcher = /^\s*\/\/\/\s*options=(.*)$/;
        const libsMatcher = /^\s*\/\/\/\s*libs=(\w+:\w+(?:,\w+:\w+)*)$/;
        let skipDisplay = false;
        let hide = false;
        for (line of lines) {
            if (line.match(/^\/\/\//)) {
                (line.match(compilerMatcher) || []).slice(1).forEach(match => compiler = match);
                (line.match(optionsMatcher) || []).slice(1).forEach(match => options = match);
                (line.match(libsMatcher) || []).slice(1).forEach(match => {
                    [...match.matchAll(/(\w+):(\w+)/g)].forEach(match => {
                        libs.push({
                            name: match[1],
                            ver: match[2]
                        });
                    })
                });
                (line.match(executeMatcher) || []).forEach(_ => execute = true);
                (line.match(hideMatcher) || []).slice(1, 2).forEach(match => hide = match == "hide");
            } else {
                source += line + "\n";
                if (!skipDisplay && !hide)
                    displaySource += line + "\n";
                if (line.length > 63) {
                    console.error(`Line too long: "${line}"`);
                }
            }
        }

        function trim(source) {
            while (source.startsWith("\n")) {
                source = source.slice(1, source.length);
            }
            while (source.endsWith("\n\n")) {
                source = source.slice(0, source.length - 1);
            }
            return source;
        }

        displaySource = trim(displaySource);
        source = trim(source);
        options += " -Wall -Wextra -pedantic";
        let content = [];
        content.push({
            type: 'component',
            componentName: 'codeEditor',
            componentState: {
                id: 1,
                source: source,
                options: { compileOnChange: true, colouriseAsm: true },
                fontScale: 2.5
            }
        });
        content.push({
            type: 'column',
            content: [{
                type: 'component',
                componentName: 'compiler',
                componentState: {
                    source: 1,
                    filters: {
                        commentOnly: true,
                        directives: true,
                        intel: true,
                        labels: true,
                        trim: true,
                        execute: execute
                    },
                    options: options,
                    compiler: compiler,
                    libs: libs,
                    fontScale: 3.0
                }
            }, {
                type: 'component',
                componentName: 'output',
                componentState: {
                    compiler: 1
                }
            }
            ]
        });
        let obj = {
            version: 4,
            content: [{ type: 'row', content: content }],
            settings: {
                theme: 'dark'
            }
        };
        let ceFragment = encodeURIComponent(JSON.stringify(obj));

        const baseUrl = isLocal ? 'http://localhost:10240/' : 'https://godbolt.org/';

        element.onclick = (evt) => {
            if (evt.ctrlKey || evt.metaKey) {
                window.open(baseUrl + "#" + ceFragment, "ce");
            }
        };
        element.textContent = displaySource;
    }
});
