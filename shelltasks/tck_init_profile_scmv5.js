// no userCallback support
exports.get = function(iWSName){
  var newShellTask = new vt.ShellTask({
    command : '\\\\dsone\\rnd\\tools\\tck_init && tck_profile SCMV5',    
    completeCallback : function(err, data){
      if(newShellTask.userCallback){
        newShellTask.userCallback(err, data);
      }
    }
  });

  return newShellTask;
};
  
