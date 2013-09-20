/*
CREATE TABLE games (
    id serial primary key,
    away_team int REFERENCES teams,
    home_team int REFERENCES teams,
    away_score int,
    home_score int,
    favored text,
    spread real,
    state text,
    quarter text,
    time_left text
);
*/

module.exports = function(sequelize, DataTypes) {
   return sequelize.define('games', {
      id: DataTypes.INTEGER,    
      away_team: DataTypes.INTEGER,    
      home_team: DataTypes.INTEGER,    
      away_score: DataTypes.INTEGER,    
      home_score: DataTypes.INTEGER,    
      favored: DataTypes.TEXT,    
      spread: DataTypes.FLOAT,    
      state: DataTypes.TEXT,    
      quarter: DataTypes.TEXT,    
      time_left: DataTypes.TEXT
  }, {
    instanceMethods: {
      countTasks: function() {
        // how to implement this method ?
      }
    }
  });
};
