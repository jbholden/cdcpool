var Sequelize = require('sequelize');

var fs = require('fs');
var sqlLogFile = fs.createWriteStream("/home/ubuntu/cdcpool/public/logs/sql.log", {flags:'a'});

function log_sql(text) {
   var d = new Date();
   var logstr = d.toUTCString() + ": *********************\n" + text + "\n\n";
   sqlLogFile.write(new Buffer(logstr));
}

var sequelize = new Sequelize('pooldb','postgres', 'football', {
	   host: '127.0.0.1',
	   port: 5432,
	   dialect: 'postgres',
      logging: log_sql
});

var models = [
  'teams',
  'games',
  'picks',
  'players',
  'weeks',
];
models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

/*
(function(m) {
  m.PhoneNumber.belongsTo(m.User);
  m.Task.belongsTo(m.User);
  m.User.hasMany(m.Task);
  m.User.hasMany(m.PhoneNumber);
})(module.exports);
*/

module.exports.sequelize = sequelize;

