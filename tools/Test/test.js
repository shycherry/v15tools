exports.dir = function(){
  var shelltask = new vt.ShellTask({
    command:'dir',
    callback:function(err, data){
      $('#console-out').html(encodeHTML(data));
    }
  });

  vt.pushShellTask(shelltask);
};

exports.calc = function(){
  var shelltask = new vt.ShellTask({
    command:'calc',
    callback:function(err, data){}
  });

  vt.pushShellTask(shelltask);
};
