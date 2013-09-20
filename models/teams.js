/*
CREATE TABLE teams (
    id serial primary key,
    pool_name text,
    conference text
);
*/

module.exports = function(sequelize, DataTypes) {
   return sequelize.define('teams', {
      id: DataTypes.INTEGER,    
      pool_name: DataTypes.TEXT,    
      conference: DataTypes.TEXT
  }, {
    instanceMethods: {
      countTasks: function() {
        // how to implement this method ?
      }
    }
  });
};
