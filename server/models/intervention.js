module.exports = function(Intervention) {
  const serviceName = 'Service Intervention : ';

  /**
   * Disabled auto-generated methods
    */

  var disabledMethods = ['upsert', "deleteById", "updateAll", "updateAttributes", "createChangeStream", "exists", "find", "findOne", "count", "findById"];
  for(method in disabledMethods){
    console.log(serviceName+"disabled auto-generated method \"" + disabledMethods[method]+"\"");
    Intervention.disableRemoteMethod(disabledMethods[method], true);
  }
  // Due to a bug, we have to disable updateAttributes by passing false to disableRemoteMethod... tricky dev
  Intervention.disableRemoteMethod('updateAttributes', false);

  /**
   *
   * @param accessToken
   * @param userid
   * @returns {boolean}
     */
  var isConnected = function (accessToken, userid){
    if(userid != null && accessToken != null){
      console.log("User "+ ctx.req.headers.userid +" is connected");
      return true;
    }else {
      console.log("User "+ ctx.req.headers.userid +" is not connected");
      return false;
    }
  };

  function httpGet(theUrl)
  {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
  }


  /**
   * Before every remoteMethod, check that the token correspond to the user
    */

  Intervention.beforeRemote('*', function(ctx, unused, next) {
    if(isConnected(ctx.req.accessToken, ctx.req.headers.userid)){

      next();
    }else{
      next(new Error('You must be logged in to access database'));
    }
  });


  /**
   * After every remoteMethod, check that the token correspond to the user
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

