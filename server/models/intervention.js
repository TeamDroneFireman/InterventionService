module.exports = function(Intervention) {
  Intervention.disableRemoteMethod('deleteById', true);
  Intervention.disableRemoteMethod("updateAll", true);
  Intervention.disableRemoteMethod('createChangeStream', true);
  Intervention.disableRemoteMethod('findOne', true);
  Intervention.disableRemoteMethod('exists', true);

  Intervention.findByIdWithElements = function(id,cb){
    Intervention.findById(id,function (err,intervention){
      var droneService = Intervention.app.dataSources.droneService;
      droneService.findById(id,function(err, response) {
        if (err) throw err;
        if (response.error) {
          next('> response error: ' + response.error.stack);
        }
        intervention.drones = response;
        cb(null, intervention);
      });
    });
  };


  Intervention.remoteMethod('findByIdWithElements', {
    description: 'Find a model instance by id from the data source.',
    accessType: 'READ',
    accepts: [{ arg: 'id', type: 'any', description: 'Model id', required: true,
        http: {source: 'path'}}],
    returns: {arg: 'data', type: "intervention", root: true},
    http: {verb: 'get', path: '/:id/WithElements'}
  });
};
