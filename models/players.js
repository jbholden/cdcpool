/*
CREATE TABLE players (
    id serial primary key,
    name text,
    year int
);
*/

module.exports = function(sequelize, DataTypes) {
   return sequelize.define('players', {
      id: DataTypes.INTEGER,    
      name: DataTypes.TEXT,    
      year: DataTypes.INTEGER
  }, {
    timestamps: false,
    instanceMethods: {
      countTasks: function() {
        // how to implement this method ?
      }
    }
  });
};
