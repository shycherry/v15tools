// no userCallback support
exports.get = function(iTCKLevel){
  var tck_level = (iTCKLevel)?iTCKLevel : 'R217';
  var newShellTask = new vt.ShellTask({
    command : '\\\\dsone\\rnd\\tools\\tck_init && tck_profile '+tck_level,    
    completeCallback : function(err, data){
      if(newShellTask.userCallback){
        newShellTask.userCallback(err, data);
      }
    }
  });

  return newShellTask;
};
  
