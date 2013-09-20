/*
CREATE TABLE weeks (
    id serial primary key,
    year int,
    number int,
    games int ARRAY[10]
);
*/

module.exports = function(sequelize, DataTypes) {
   return sequelize.define('weeks', {
      id: DataTypes.INTEGER,
      year: DataTypes.INTEGER,
      number: DataTypes.INTEGER,
      games: DataTypes.ARRAY(DataTypes.INTEGER)
  }, {
    instanceMethods: {
      countTasks: function() {
        // how to implement this method ?
      }
    }
  });
}; 
