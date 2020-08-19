const CODE_LINE_NUMBER_REGEX = /(\d*)\[([\s\d,|-]*)\]/;

markdownPlugin = RevealMarkdown();

origInit = markdownPlugin.init;

markdownPlugin.init = function (reveal) {

  var result = origInit(reveal);

  class Renderer extends markdownPlugin.marked.Renderer {
    code(code, infostring, escaped) {
      // Off by default
      let lineNumbers = '';
      let startNumber = '';
  
      // Users can opt in to show line numbers and highlight
      // specific lines.
      // ```javascript []        show line numbers
      // ```javascript [1,4-8]   highlights lines 1 and 4-8
      const match = infostring && infostring.match(CODE_LINE_NUMBER_REGEX);
      if (match) {
        if (match[1].length > 0) {
          startNumber = `data-line-numbers-start="${match[1]}"`;
        }
        lineNumbers = match[2].trim();
        lineNumbers = `data-line-numbers="${lineNumbers}"`;
        infostring = infostring.replace(CODE_LINE_NUMBER_REGEX, '').trim();
      }
  
      const rendered = super.code(code, infostring, escaped);
  
      if (lineNumbers) {
        return rendered.replace(/<code ([^>]*)>/, `<code $1 ${lineNumbers} ${startNumber}>`)
      }
  
      return rendered;
    }
  };
  
  markdownPlugin.marked.setOptions({
    renderer: new Renderer(),
    headerIds: false
  });

  return result;

};

defaultOptions.plugins[0] = () => markdownPlugin;

highlightPlugin = RevealHighlight();
hljs = highlightPlugin.hljs;

/* highlightjs-line-numbers.js 2.8.0 | (C) 2018 Yauheni Pakala | MIT License | github.com/wcoder/highlightjs-line-numbers.js */
/* Edited by Hakim for reveal.js; removed async timeout */
!function(r,o){"use strict";var e,i="hljs-ln",l="hljs-ln-line",h="hljs-ln-code",s="hljs-ln-numbers",c="hljs-ln-n",m="data-line-number",a=/\r\n|\r|\n/g;function u(e){for(var n=e.toString(),t=e.anchorNode;"TD"!==t.nodeName;)t=t.parentNode;for(var r=e.focusNode;"TD"!==r.nodeName;)r=r.parentNode;var o=parseInt(t.dataset.lineNumber),a=parseInt(r.dataset.lineNumber);if(o==a)return n;var i,l=t.textContent,s=r.textContent;for(a<o&&(i=o,o=a,a=i,i=l,l=s,s=i);0!==n.indexOf(l);)l=l.slice(1);for(;-1===n.lastIndexOf(s);)s=s.slice(0,-1);for(var c=l,u=function(e){for(var n=e;"TABLE"!==n.nodeName;)n=n.parentNode;return n}(t),d=o+1;d<a;++d){var f=p('.{0}[{1}="{2}"]',[h,m,d]);c+="\n"+u.querySelector(f).textContent}return c+="\n"+s}function n(e){try{var n=o.querySelectorAll("code.hljs,code.nohighlight");for(var t in n)n.hasOwnProperty(t)&&(n[t].classList.contains("nohljsln")||d(n[t],e))}catch(e){r.console.error("LineNumbers error: ",e)}}function d(e,n){"object"==typeof e&&(e.innerHTML=f(e,n))}function f(e,n){var t,r,o=(t=e,{singleLine:function(e){return!!e.singleLine&&e.singleLine}(r=(r=n)||{}),startFrom:function(e,n){var t=1;isFinite(n.startFrom)&&(t=n.startFrom);var r=function(e,n){return e.hasAttribute(n)?e.getAttribute(n):null}(e,"data-ln-start-from");return null!==r&&(t=function(e,n){if(!e)return n;var t=Number(e);return isFinite(t)?t:n}(r,1)),t}(t,r)});return function e(n){var t=n.childNodes;for(var r in t){var o;t.hasOwnProperty(r)&&(o=t[r],0<(o.textContent.trim().match(a)||[]).length&&(0<o.childNodes.length?e(o):v(o.parentNode)))}}(e),function(e,n){var t=g(e);""===t[t.length-1].trim()&&t.pop();if(1<t.length||n.singleLine){for(var r="",o=0,a=t.length;o<a;o++)r+=p('<tr><td class="{0} {1}" {3}="{5}"><div class="{2}" {3}="{5}"></div></td><td class="{0} {4}" {3}="{5}">{6}</td></tr>',[l,s,c,m,h,o+n.startFrom,0<t[o].length?t[o]:" "]);return p('<table class="{0}">{1}</table>',[i,r])}return e}(e.innerHTML,o)}function v(e){var n=e.className;if(/hljs-/.test(n)){for(var t=g(e.innerHTML),r=0,o="";r<t.length;r++){o+=p('<span class="{0}">{1}</span>\n',[n,0<t[r].length?t[r]:" "])}e.innerHTML=o.trim()}}function g(e){return 0===e.length?[]:e.split(a)}function p(e,t){return e.replace(/\{(\d+)\}/g,function(e,n){return void 0!==t[n]?t[n]:e})}hljs?(hljs.initLineNumbersOnLoad=function(e){"interactive"===o.readyState||"complete"===o.readyState?n(e):r.addEventListener("DOMContentLoaded",function(){n(e)})},hljs.lineNumbersBlock=d,hljs.lineNumbersValue=function(e,n){if("string"!=typeof e)return;var t=document.createElement("code");return t.innerHTML=e,f(t,n)},(e=o.createElement("style")).type="text/css",e.innerHTML=p(".{0}{border-collapse:collapse}.{0} td{padding:0}.{1}:before{content:attr({2})}",[i,c,m]),o.getElementsByTagName("head")[0].appendChild(e)):r.console.error("highlight.js not detected!"),document.addEventListener("copy",function(e){var n,t=window.getSelection();!function(e){for(var n=e;n;){if(n.className&&-1!==n.className.indexOf("hljs-ln-code"))return 1;n=n.parentNode}}(t.anchorNode)||(n=-1!==window.navigator.userAgent.indexOf("Edge")?u(t):t.toString(),e.clipboardData.setData("text/plain",n),e.preventDefault())})}(window,document);

highlightPlugin.highlightBlock = function( block ) {

  hljs.highlightBlock( block );

  // Don't generate line numbers for empty code blocks
  if( block.innerHTML.trim().length === 0 ) return;

  if( block.hasAttribute( 'data-line-numbers' ) ) {
    const startFrom = parseInt(block.getAttribute('data-line-numbers-start')) || 1;
    hljs.lineNumbersBlock( block, { singleLine: true, startFrom: startFrom } );

    var scrollState = { currentBlock: block };

    // If there is at least one highlight step, generate
    // fragments
    var highlightSteps = highlightPlugin.deserializeHighlightSteps( block.getAttribute( 'data-line-numbers' ) );
    if( highlightSteps.length > 1 ) {

      // If the original code block has a fragment-index,
      // each clone should follow in an incremental sequence
      var fragmentIndex = parseInt( block.getAttribute( 'data-fragment-index' ) || block.parentElement.getAttribute('data-fragment-index'), 10 );

      if( typeof fragmentIndex !== 'number' || isNaN( fragmentIndex ) ) {
        fragmentIndex = null;
      }

      // Generate fragments for all steps except the original block
      highlightSteps.slice(1).forEach( function( highlight ) {

        var fragmentBlock = block.cloneNode( true );
        fragmentBlock.setAttribute( 'data-line-numbers', highlightPlugin.serializeHighlightSteps( [ highlight ] ) );
        fragmentBlock.classList.add( 'fragment' );
        block.parentNode.appendChild( fragmentBlock );
        highlightPlugin.highlightLines( fragmentBlock );

        if( typeof fragmentIndex === 'number' ) {
          fragmentBlock.setAttribute( 'data-fragment-index', fragmentIndex );
          fragmentIndex += 1;
        }
        else {
          fragmentBlock.removeAttribute( 'data-fragment-index' );
        }

        // Scroll highlights into view as we step through them
        fragmentBlock.addEventListener( 'visible', highlightPlugin.scrollHighlightedLineIntoView.bind( highlightPlugin, fragmentBlock, scrollState ) );
        fragmentBlock.addEventListener( 'hidden', highlightPlugin.scrollHighlightedLineIntoView.bind( highlightPlugin, fragmentBlock.previousSibling, scrollState ) );

      } );

      block.removeAttribute( 'data-fragment-index' )
      block.setAttribute( 'data-line-numbers', highlightPlugin.serializeHighlightSteps( [ highlightSteps[0] ] ) );

    }

    // Scroll the first highlight into view when the slide
    // becomes visible. Note supported in IE11 since it lacks
    // support for Element.closest.
    var slide = typeof block.closest === 'function' ? block.closest( 'section:not(.stack)' ) : null;
    if( slide ) {
      var scrollFirstHighlightIntoView = function() {
        highlightPlugin.scrollHighlightedLineIntoView( block, scrollState, true );
        slide.removeEventListener( 'visible', scrollFirstHighlightIntoView );
      }
      slide.addEventListener( 'visible', scrollFirstHighlightIntoView );
    }

    highlightPlugin.highlightLines( block );

  }

};

highlightPlugin.highlightLines = function( block, linesToHighlight ) {

  var highlightSteps = highlightPlugin.deserializeHighlightSteps( linesToHighlight || block.getAttribute( 'data-line-numbers' ) );
  const startFrom = parseInt(block.getAttribute('data-line-numbers-start')) || 1;

  if( highlightSteps.length ) {

    highlightSteps[0].forEach( function( highlight ) {

      var elementsToHighlight = [];
      var highlightNoLines = false;

      // Highlight a range
      if( typeof highlight.end === 'number' ) {
        highlight.start = highlight.start - startFrom + 1;
        highlight.end = highlight.end - startFrom + 1;
        elementsToHighlight = [].slice.call( block.querySelectorAll( 'table tr:nth-child(n+'+highlight.start+'):nth-child(-n+'+highlight.end+')' ) );
      }
      // Highlight a single line
      else if( typeof highlight.start === 'number' ) {
        if (highlight.start == 0) {
          highlightNoLines = true;
        }
        else {
          highlight.start = highlight.start - startFrom + 1;
          elementsToHighlight = [].slice.call( block.querySelectorAll( 'table tr:nth-child('+highlight.start+')' ) );
        }
      }

      if( elementsToHighlight.length || highlightNoLines ) {
        elementsToHighlight.forEach( function( lineElement ) {
          lineElement.classList.add( 'highlight-line' );
        } );

        block.classList.add( 'has-highlights' );
      }

    } );

  }

};
