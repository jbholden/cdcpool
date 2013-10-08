/*
CREATE TABLE weeks (
    id serial primary key,
    year int,
    number int,
    winner int,
    games int ARRAY[10]
);
*/

module.exports = function(sequelize, DataTypes) {
   return sequelize.define('weeks', {
      id: DataTypes.INTEGER,
      year: DataTypes.INTEGER,
      number: DataTypes.INTEGER,
      winner: DataTypes.INTEGER,
      games: DataTypes.ARRAY(DataTypes.INTEGER)
  }, {
    timestamps: false,
    instanceMethods: {
      countTasks: function() {
        // how to implement this method ?
      }
    }
  });
}; 
