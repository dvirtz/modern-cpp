const processElement = (content, isLocal) => {
    let compiler = isLocal ? "clangdefault" : "g82";
    let options = "-O2 -march=haswell -Wall -Wextra -pedantic -Wno-unused-variable";
    let execute = false
    let libs = []
    let forceExternal = false;
    let shouldFail = false;
    let source = unescape(content);
    let lines = source.split('\n');
    source = "";
    let displaySource = "";
    let matcher = pattern => new RegExp(`^\s*\/\/\/\s*${pattern}$`);
    let skipDisplay = false;
    let hide = false;
    for (line of lines) {
        if (line.match(/^\/\/\//)) {
            (line.match(matcher('compiler=(.*)')) || []).slice(1).forEach(match => compiler = match);
            (line.match(matcher('options=(.*)')) || []).slice(1).forEach(match => options = match);
            (line.match(matcher('libs=(\\w+:\\w+(?:,\\w+:\\w+)*)')) || []).slice(1).forEach(match => {
                [...match.matchAll(/(\w+):(\w+)/g)].forEach(match => {
                    libs.push({
                        name: match[1],
                        ver: match[2]
                    });
                })
            });
            (line.match(matcher('execute')) || []).forEach(_ => execute = true);
            (line.match(matcher('external')) || []).forEach(_ => forceExternal = true);
            (line.match(matcher('fails')) || []).forEach(_ => shouldFail = true);
            (line.match(matcher('((un)?hide)')) || []).slice(1, 2).forEach(match => hide = match == "hide");
        } else {
            source += line + "\n";
            if (!skipDisplay && !hide)
                displaySource += line + "\n";
        }
    }

    const info = {
        source: source,
        compiler: compiler,
        options: options,
        libs: libs,
        execute: execute,
        forceExternal: forceExternal,
        shouldFail: shouldFail
    };

    return [info, displaySource]
};

function prepareUrl(info, isLocal) {
    function trim(source) {
        while (source.startsWith("\n")) {
            source = source.slice(1, source.length);
        }
        while (source.endsWith("\n\n")) {
            source = source.slice(0, source.length - 1);
        }
        return source;
    }

    let content = [
        {
            type: 'component',
            componentName: 'codeEditor',
            componentState: {
                id: 1,
                source: trim(info.source),
                options: { compileOnChange: true, colouriseAsm: true },
                fontScale: 2.5
            }
        },
        {
            type: 'column',
            content: [{
                type: 'component',
                componentName: 'compiler',
                componentState: {
                    source: 1,
                    lang: 'c++',
                    compiler: info.compiler,
                    options: info.options,
                    libs: info.libs,
                    fontScale: 3.0,
                    filters: {
                        commentOnly: true,
                        directives: true,
                        intel: true,
                        labels: true,
                        trim: true,
                        execute: info.execute
                    }
                }
            }, {
                type: 'component',
                componentName: 'output',
                componentState: {
                    compiler: 1
                }
            }
            ]
        }
    ];
    let obj = {
        version: 4,
        content: [{ type: 'row', content: content }],
        settings: {
            theme: 'dark'
        }
    };

    const baseUrl = (isLocal && !info.forceExternal) ? 'http://localhost:10240/' : 'https://godbolt.org/';

    let ceFragment = encodeURIComponent(JSON.stringify(obj));

    return `${baseUrl}#${ceFragment}`;
};

const Plugin = () => {
    return {
        id: 'compiler-explorer',
        init: function (reveal) {
            const isLocal = !!window.location.host.match(/localhost/gi);
            const ce_nodes = reveal.getRevealElement().querySelectorAll('code.language-cpp');

            for (element of ce_nodes) {
                const [info, displaySource] = processElement(element.textContent, isLocal)
                const url = prepareUrl(info, isLocal);
                element.parentNode.onclick = (evt) => {
                    if (evt.ctrlKey || evt.metaKey) {
                        window.open(url, "ce");
                    }
                };
                element.textContent = displaySource;
            }
        }
    };
};

// export default Plugin;
if (typeof exports === 'object') {
    module.exports = processElement;
}
else if (defaultOptions != 'undefined') {
    defaultOptions.plugins.push(Plugin);
}