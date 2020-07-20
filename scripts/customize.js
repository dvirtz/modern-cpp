Reveal.addEventListener('ready', (event) => {
  $('ul > li > input[type=checkbox]').parent()
    .css("margin-left", "-1.5em")
    .css("list-style-type", "none");
    $('li > ul > li > input[type=checkbox]').parent()
      .css("margin-left", "-5.5em");
  $('li:has(.fragment[type=checkbox])')
    .attr('class', 'fragment')
    .attr('data-fragment-index', function () {
      var child = $(this).children('.fragment[type=checkbox]')
      var fragmentIndex = child.attr('data-fragment-index')
      child.removeAttr('data-fragment-index').removeClass('fragment')
      return fragmentIndex;
    });
  $('.aside').attr('data-background-color', "#bee4fd");
  $('.container code').attr('data-fragment-index', 0);
  $('.animated').addClass('should-animate').removeClass('animated');
  $(Reveal.getRevealElement()).prepend($('<a>', {
    class: 'github-fork-ribbon top-right fixed',
    href: 'https://github.com/dvirtz/modern-cpp',
    'data-ribbon': 'Fork me on GitHub'
  }));
  $('.chapter').addClass('r-stretch');
  if (Reveal.isSpeakerNotes()) {
    $('.github-fork-ribbon').css('visibility', 'hidden');
  }
  $('pre.split').each(function() {
    $(this).removeClass('split').css('width', '100%')
    if (!$(this).attr("style").includes('font-size')) {
      $(this).css('font-size', '0.35em');
    }
    $(this).children('code').addClass('split').each(function() {
      const lastNotEmpty = $('tr td:nth-child(2)', this).filter(function() {
        return $(this).text().trim() !== '';
      }).get(-1);
      if (lastNotEmpty) {
        const index = $(lastNotEmpty.parentElement).index();
        $('tr td:nth-child(1)', this).slice(index + 1).hide();
      }
    });
  });
  $('.split[column-count]').css('column-count', function() {
    return $(this).attr('column-count');
  });
  Reveal.sync();
});

Reveal.addEventListener('slidechanged', (event) => {
  $(event.currentSlide).children('.should-animate').addClass('animated');
  $(event.previousSlide).children('.should-animate').removeClass('animated');
  $(event.currentSlide).find('pre[data-auto-animate-target]')
    .on('transitionstart', function () {
      $(this).find('code').css('overflow', 'hidden')
    })
    .on('transitionend', function () {
      $(this).find('code').css('overflow', 'auto')
    })
  $(event.previousSlide).find('pre[data-auto-animate-target] code').css('overflow', 'hidden')
});
