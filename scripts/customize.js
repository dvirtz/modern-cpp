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
  const highlight = Reveal.getPlugin('highlight');
  $('pre code').each(function () {
    highlight.highlightBlock($(this).get(0));
  });
  Reveal.sync();
});

Reveal.addEventListener('slidechanged', (event) => {
  $(event.currentSlide).children('.should-animate').addClass('animated');
  $(event.previousSlide).children('.should-animate').removeClass('animated');
});
