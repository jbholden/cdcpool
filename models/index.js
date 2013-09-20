var Sequelize = require('sequelize');

var sequelize = new Sequelize('pooldb','postgres', 'football', {
	   host: '127.0.0.1',
	   port: 5432,
	   dialect: 'postgres'
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

