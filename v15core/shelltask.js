var globId = 0;

function ShellTask(iInfos){
  this.vid = 'ShellTask_'+globId;
  globId++;  
  
  this.callback = (iInfos.callback!=undefined)?iInfos.callback: function(err, result){
    console.log(err);
    console.log(result);
  };
  this.releaseAtEnd = (iInfos.releaseAtEnd!=undefined)? iInfos.releaseAtEnd : true;
  this.command = (iInfos.command!=undefined)? iInfos.command : 'echo pas de commande';    
}

exports.ShellTask = ShellTask;
