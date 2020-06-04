Reveal.addEventListener('ready', (event) => {
  $('[type=checkbox]').parent()
    .css("margin-left", "-1.5em")
    .css("list-style-type", "none");
  $('li:has(.fragment[type=checkbox])')
    .attr('class', 'fragment')
    .attr('data-fragment-index', function() {
      var child = $(this).children('.fragment[type=checkbox]')
      var fragmentIndex = child.attr('data-fragment-index')
      child.removeAttr('data-fragment-index').removeClass('fragment')
      return fragmentIndex;
    });
  $('.aside').attr('data-background-color', "#bee4fd");
  Reveal.sync();
});
