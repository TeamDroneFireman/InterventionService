module.exports = function(Intervention) {

    const PRIVATE_CONST_PATH = '/home/kozhaa/Documents/Master2/'+
    'project/API_Provider/'+'InterventionService/private.json';

    Intervention.disableRemoteMethod('deleteById', true);
    Intervention.disableRemoteMethod('updateAll', true);
    Intervention.disableRemoteMethod('createChangeStream', true);
    Intervention.disableRemoteMethod('findOne', true);
    Intervention.disableRemoteMethod('exists', true);

    /***
    * auth required before all methods
    */
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

  Intervention.findByIdWithElements = function(id,cb){
    Intervention.findById(id,function (err,intervention){
      if (intervention !== null) {
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
      }
      else cb(null, null);
    });
  };

  Intervention.remoteMethod('findByIdWithElements', {
    description: 'Find a model instance by id from the data source.',
    accessType: 'READ',
    accepts: [{ arg: 'id', type: 'any', description: 'Model id', required: true,
        http: {source: 'path'}}],
    returns: {arg: 'data', type: 'intervention', root: true},
    http: {verb: 'get', path: '/:id/WithElements'},
    rest: {after: convertNullToNotFoundError}
  });


  /***
   * Register a new device to the push service of the given intervention
   * non atomic operation, Loopback doesn't handle $addToSet mongo operator!
   *
   * @param registration object contains interventionId and new registration Key
   * @param callback
   */
  Intervention.register = function(registration, callback){
    Intervention.exists(registration.interventionId, function(err, response) {
      if (response) {
        //get document registred devices
        Intervention.findById(
          registration.interventionId,
          function (err, document) {
            var jsonfile = require('jsonfile');
            jsonfile.readFile(PRIVATE_CONST_PATH, function(err, obj) {
              var key = obj.gcmkey;
              if('groupKey' in document){
                var groupKey = document.groupKey;
                var groupName = document.name;
                Intervention.app.datasources.gcmService
                .addToList(key,
                'add',
                groupKey,
                groupName,
                registration.registrationId,
                function(err, response){
                  callback(err,response);
                });
              }else{
                var error = new Error('GCM Group key does not exists');
                error.statusCode = error.status = 404;
                error.code = 'GCM_KEY_NOT_FOUND';
                callback(error);
              }
            });
          });
      }else{
        callback(null, {});
      }
    });
  };

  Intervention.remoteMethod('register', {
    description: 'add a new GCM key to an intervention',
    accepts:{arg: 'registration', type: 'object', http: {source: 'body'}},
    returns: {arg: 'data', type: 'intervention', root: true},
    http: {verb: 'post', path: '/register/'}
  });


  /***
   * Handle push event for the intervention passed as parameter
   *
   * @param interventionId
   * @param message Object contains topic and changed object Id
   */
  Intervention.push = function(interventionId, message, callback){
    Intervention.exists(interventionId, function(err, response){
      if(response){
        Intervention.findById(interventionId, function(err, document){
          var jsonfile = require('jsonfile');
          jsonfile.readFile(PRIVATE_CONST_PATH, function(err, obj) {
            var key = obj.gcmkey;
            var registredKey = document.registredKey;
            Intervention.app.datasources.gcmService
            .sendMessage(key, registredKey,message, function(err, response){
              callback(err,response);
            });
          });
        });
      }
      else callback(null,{});
    });
  };

  Intervention.remoteMethod('push', {
    description: 'send push event to registred devices of the current interv.',
    accepts:[
      {arg: 'id', type: 'any', http: {source: 'path'}},
      {arg: 'message', type: 'object', http: {source: 'body'}}
    ],
    http: {verb: 'post', path: '/:id/push/'}
  });

  /***
  * Create a GCM group after document creation
  */
  Intervention.afterRemote(
    'create',
    function(ctx, unused, next){
      if(ctx.res.status === 200){
        var groupName = ctx.res.body.name;
        var jsonfile = require('jsonfile');
        jsonfile.readFile(PRIVATE_CONST_PATH, function(err, obj) {
          var key = obj.gcmkey;
          Intervention.app.datasources.gcmService
          .manageList(key, 'create', null, function(err, response){
            if(err){
              next(err);
            }
            Intervention.updateAll(
            {'id': ctx.res.body.id},
            {'registredKey': response.body.notification_key},
            function(err, info){
              if(err){
                next(err);
              }
              next();
            });
          });
        });
      }
      next();
    }
  );

  /*!
   * Convert null callbacks to 404 error objects.
   * @param  {HttpContext} ctx
   * @param  {Function} cb
   */
  function convertNullToNotFoundError(ctx, cb) {
    if (ctx.result !== null) return cb();

    var modelName = ctx.method.sharedClass.name;
    var id = ctx.getArgByName('id');
    var msg = 'Unknown "' + modelName + '" id "' + id + '".';
    var error = new Error(msg);
    error.statusCode = error.status = 404;
    error.code = 'MODEL_NOT_FOUND';
    cb(error);
  }
};
