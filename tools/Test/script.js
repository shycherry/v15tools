exports.dir = function(){
  var shelltask = new vt.ShellTask({
    command:'dir',
    completeCallback:function(err, data){
      $('#console-out').html(encodeHTML(data));
    }
  });

  vt.pushShellTask(shelltask);
};

exports.ping = function(){
  var shelltask = new vt.ShellTask({
    command:'ping 1.1.1.1 -n 3 -w 3000'
  });

  vt.pushShellTask(shelltask);
};

exports.calc = function(){
  var shelltask = new vt.ShellTask({
    command:'calc'
  });

  vt.pushShellTask(shelltask);
};

exports.load = function(){
  
}

exports.reload = function(){
  
}