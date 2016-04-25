module.exports = function(Intervention) {
  console.log('Disabled methods');
  // Removes (PUT) /products/:id
  Intervention.disableRemoteMethod('updateAttributes', false);
  // removes (GET|POST) /products/change-stream
  Intervention.disableRemoteMethod('createChangeStream', true);

  Intervention.beforeRemote('find', function(ctx, unused, next) {
    console.log('Before remote find:');
    console.log('Argument filter: ' + ctx.args.filter);
    // Next is needed to call find method
    // If you want another response, don't use it
    next();
  });

  Intervention.afterRemote('find', function(ctx, modelInstance, next) {
    // Model instance is the returned array
    if(Array.isArray(modelInstance)){
      console.log(' modelInstance is array');
      ctx.result.forEach(function(intervention){
        var temp = {};
        temp[intervention]=ctx.result[intervention];
        // Here creationDate is a field of my intervention adapt it mtfk !! :)
        console.log('   creationDate : ' +intervention.creationDate);
      });
    }
    next();
  });

};
