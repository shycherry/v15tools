var app = document.querySelector('#app');

function relayout(){
  $('#vt-central').height($(window).height() -  $('#vt-tabs').height());
  $('#vt-central').width($(window).width());
  app.$['vt-main'].fire('iron-resize');
}

app.addEventListener("dom-change", function () {

  window.addEventListener('resize', function(){
    setTimeout(relayout);
  }, false);

  relayout();
});