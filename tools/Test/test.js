exports.dir = function(){  
  var shelltask = new vt.ShellTask({
    command:'dir', 
    callback:function(err, data){      
      eData = String(data).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(\n)/g,'<br/>');
      $('#console-out').html(eData);
    }
  });

  vt.pushShellTask(shelltask);
}

exports.calc = function(){
  var shelltask = new vt.ShellTask({
    command:'calc', 
    callback:function(err, data){}
  });

  vt.pushShellTask(shelltask);
}
