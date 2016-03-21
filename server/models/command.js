module.exports = function(Command) {

  Command.disableRemoteMethod("create", true);
  Command.disableRemoteMethod("findOne", true);
  
};
