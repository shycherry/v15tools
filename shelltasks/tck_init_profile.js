var Fs = require('fs');

function getWithCGMToolsTaskIfp(iTCKLevel){
  
  var regExResults = /[0-9]+/.exec(iTCKLevel);
  if(! regExResults) return;  
  var iLevel = parseInt(regExResults[0]);
  if(! iLevel) return;  

  var cgmToolsDirName = 'Outils_CXR'+iLevel;
  var remoteCGMToolsPath = '\\\\techno\\home\\'+cgmToolsDirName;
  if(!Fs.existsSync(remoteCGMToolsPath)) return; //...not async, block execution

  return new vt.ShellTask({
    command : 'ROBOCOPY '+remoteCGMToolsPath+' E:\\'+cgmToolsDirName+' /MIR /NP >nul & CALL ',
    completeCallback : function(err, data){
      if(newShellTask.userCallback){
        newShellTask.userCallback(err, data);
      }
    }
  });

}

function getGoodOldWayTask(iTCKLevel){  
  var newShellTask = new vt.ShellTask({
    command : '\\\\dsone\\rnd\\tools\\tck_init && tck_profile '+iTCKLevel,    
    completeCallback : function(err, data){
      if(newShellTask.userCallback){
        newShellTask.userCallback(err, data);
      }
    }
  });
  return newShellTask;
}

exports.get = function(iTCKLevel){
  var tck_level = (iTCKLevel)?iTCKLevel : 'R217';

  //try to get cgmtools first (switched tools)
  var newShellTask = getWithCGMToolsTaskIfp(tck_level);  
  
  //else do the good old way...
  if(!newShellTask){
    newShellTask = getGoodOldWayTask(tck_level);
  }
  
  return newShellTask;
};
  
