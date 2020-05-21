Reveal.addEventListener('ready', (event) => {
    const ce_nodes = document.querySelectorAll('code.language-cpp');

    for (let i = 0, len = ce_nodes.length; i < len; i++) {
        let element = ce_nodes[i];
        let compiler = "g82";
        let options = "-O2 -march=haswell";
        let execute = false
        let source = unescape(element.textContent);
        let lines = source.split('\n');
        source = "";
        let displaySource = "";
        const configMatcher = /^\s*\/\/\/\s*([^:]+):(.*)$/;
        const hideMatcher = /^\s*\/\/(\/)?\s*((un)?hide)$/;
        const executeMatcher = /^\s*\/\/(\/)?\s*execute$/;
        let skipDisplay = false;
        let hide = false;
        for (let idx = 0; idx < lines.length; ++idx) {
            let line = lines[idx];
            let match = line.match(configMatcher);
            if (match) {
                compiler = match[1];
                options = match[2];
            } else if (line.match(executeMatcher)) {
                execute = true;
            } else {
                match = line.match(hideMatcher);
                if (match) {
                    if (match[1] !== '/') {
                        console.warn('(un)hide should be preceded by 3 forward slashes')
                    }
                    hide = match[2] === "hide";
                    continue;
                }
                if (line === "// setup") {
                    skipDisplay = true;
                } else if (line[0] !== ' ') {
                    skipDisplay = false;
                }

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

        const baseUrl = 'https://godbolt.org/';

        element.onclick = (evt) => {
            if (evt.ctrlKey || evt.metaKey) {
                window.open(baseUrl + "#" + ceFragment, "ce");
            }
        };
        element.textContent = displaySource;
    }
});
