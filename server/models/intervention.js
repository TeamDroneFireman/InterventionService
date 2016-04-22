module.exports = function(Intervention) {
  const serviceName = 'Service Intervention : ';
  const USERSERVICE_URL='http://0.0.0.0:3004/SITUsers/'
  const http = require('http');

  /**
   * Disable auto-generated methods
    */
  var disabledMethods = [
    'upsert',
    "deleteById",
    "updateAll",
    "updateAttributes",
    "createChangeStream",
    "exists",
    "find",
    "findOne",
    "count",
    "findById"];
  for(method in disabledMethods){
    console.log(serviceName+"disabled auto-generated method \"" + disabledMethods[method]+"\"");
    Intervention.disableRemoteMethod(disabledMethods[method], true);
  }
  // Tricky bug here (passing false to disable)
  Intervention.disableRemoteMethod('updateAttributes', false);


  /**
   * isConnected contact an authentification api
   *
   * @param accessToken
   * @param userid
   * @returns {boolean}
     */
  var isConnecdted = function (accessToken, userid){
    // if(isConnected(ctx.req.accessToken, ctx.req.headers.userid)
    if(userid != null && accessToken != null){
      console.log("User "+ ctx.req.headers.userid +" is connected");
      http.get()
      return true;
    }else {
      console.log("User "+ ctx.req.headers.userid +" is not connected");
      return false;
    }
  };

  var httpUserServiceOptions = {
    port: 3004,
    hostname: '0.0.0.0',
    method: 'GET'
  };
  var isConnected = function (callback, token, userid)
  {
    //var token = "";
    httpUserServiceOptions.path=USERSERVICE_URL+userid+"/accessTokens/"+token+"?access_token="+token;
    console.log("Calling : "+httpUserServiceOptions);
    http.get(httpUserServiceOptions, function(response){
      if(response.statusCode==200){
        console.log("User connected");
        callback(true);
      }else{
        console.log("User not connected");
        callback(false);
      }
    }).on("error", function(e){
      console.log("Got error: " + e.message);
      callback(false);
    });
  };


  /**
   * Before every remoteMethod, check that the token correspond to the user
   */
    Intervention.beforeRemote('*', function(ctx, unused, next) {
      var a = "3wz5T7FNF0godeHowO105ikFaLHVYF9N92cK3TMfUOKI9RNGz2omVhCaSpcSaFgZ";
      var userid = 1;
      //ctx.req.headers.userid
      isConnected(function(result, a, userid){
          if(result){
            console.log("User connected, remote ");
            next();
          } else {
            console.log("User not connected");
            next(new Error('You must be logged in to access database'));
          }
      });
  });


  /**
   * After every remoteMethod
   */
  Intervention.afterRemote('find', function(ctx, modelInstance, next) {
    if(Array.isArray(modelInstance)){
      console.log(" modelInstance is array");
      ctx.result.forEach(function(intervention){
        var temp = {};
        temp[intervention]=ctx.result[intervention];

        console.log("   creationDate : " +intervention.creationDate);
      })
    }
    next();
  });




};

