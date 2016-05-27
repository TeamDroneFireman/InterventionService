module.exports = function(Intervention) {
/*
  Intervention.beforeRemote('*', function(ctx, unused, next) {
    Intervention.app.datasources.userService
    .checkAuth(ctx.req.headers.userid, ctx.req.headers.token,
        function (err, response) {
      if (err || response.error || response.id !== ctx.req.headers.token) {
        var e = new Error('You must be logged in to access database');
        e.status = 401;
        next(e);
      } else {
        next();
      }
    });
  });
*/
  Intervention.disableRemoteMethod('deleteById', true);
  Intervention.disableRemoteMethod('updateAll', true);
  Intervention.disableRemoteMethod('createChangeStream', true);
  Intervention.disableRemoteMethod('findOne', true);
  Intervention.disableRemoteMethod('exists', true);

  Intervention.findByIdWithElements = function(id,cb){
    Intervention.findById(id,function (err,intervention){
      var droneService = Intervention.app.dataSources.droneService;
      var sigService = Intervention.app.dataSources.sigService;
      var meanService = Intervention.app.dataSources.meanService;
        droneService.findByInterventionId(id, function (err, response) {
          if (err) throw err;
          if (response.error) next('> response error: ' + response.error.stack);
          intervention.drones = response;
          sigService.findByInterventionId(id, function (err, response) {
            if (err) throw err;
            if (response.error)
              next('> response error: ' + response.error.stack);
            intervention.SIGs = response;
            meanService.findByInterventionId(id, function (err, response) {
              if (err) throw err;
              if (response.error)
                next('> response error: ' + response.error.stack);
              intervention.means = response;
              cb(null, intervention);
            });
          });
        });
    });
  };

  Intervention.remoteMethod('findByIdWithElements', {
    description: 'Find a model instance by id from the data source.',
    accessType: 'READ',
    accepts: [{ arg: 'id', type: 'any', description: 'Model id', required: true,
        http: {source: 'path'}}],
    returns: {arg: 'data', type: 'intervention', root: true},
    http: {verb: 'get', path: '/:id/WithElements'}
  });

  /***
  * Register a new device to the push service of the intervention passed as parameter
  *
  * @param idRegistration
  * @param callback
  */
  Intervention.register = function(id, gcmKey, callback){
    //non atomic operation because Loopback doesn't handle $addToSet mongo operator

    //get document registred devices
    Intervention.findById(id, function(err, document){
      var registredList = document.registred;
      if(!registredList){
        registredList = [gcmKey];
      }else{
        registredList.push(gcmKey);
      }
      document.updateAttribute('registred', registredList);
      document.save;
    });
    callback(null,this);
  }

  Intervention.remoteMethod('register', {
    description: 'add a new GCM key to an intervention',
    isStatic: 'false',
    accepts: [
      { arg: 'id',
        type: 'any',
        description: 'intervention id',
        required: true,
        http: {source: 'path'}
      },
      { arg: 'gcmKey',
        type: 'any',
        description: 'registration key',
        required: true,
        http: {source: 'path'}
      }],
    returns: {arg: 'data', type: 'intervention', root: true},
    http: {verb: 'post', path: '/:id/register/:gcmKey'}
  });
};
