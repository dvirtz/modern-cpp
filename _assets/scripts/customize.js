Reveal.addEventListener('ready', (event) => {
  $('[type=checkbox]').parent()
    .css("margin-left", "-1.5em")
    .css("list-style-type", "none");
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
