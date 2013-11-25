exports.get = function(iWSName){
  var newShellTask = new vt.ShellTask({
    command : '\\\\dsone\\rnd\\tools\\tck_init && tck_profile SCMV5 && adl_ds_ws '+iWSName,
    completeCallback : function(err, data){
      if(err){
        if(newShellTask.userCallback){
          newShellTask.userCallback(err, null);
        }
        return;
      }
      if(newShellTask.userCallback){
        var winImagePathMatch = /WINDOWS.+(\\\\.+)/.exec(data);
        if(!winImagePathMatch){
          newShellTask.userCallback('no match', null);
          return;
        }
        newShellTask.userCallback(null, winImagePathMatch[1]);
      }
    }
  });

  return newShellTask;
};
  
