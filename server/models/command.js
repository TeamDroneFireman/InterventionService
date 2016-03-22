module.exports = function(Command) {

  Command.save = function(data, callback) {
    callback(null, data);
  };
     
  Command.remoteMethod(
    'save', {
      http: { verb: 'post',path:'/' },
      description: "Post Command",
      accepts:  {arg: 'data', type: 'object', description: 'Model instance data', http: {source: 'body'}},
      return:  {arg: 'data', type: 'command', root: true}
  });


  
};
