/*
CREATE TABLE picks (
    id serial primary key,
    week int REFERENCES weeks,
    player int REFERENCES players,
    game int REFERENCES games,
    winner text,
    away_score int,
    home_score int
);
*/

module.exports = function(sequelize, DataTypes) {
   return sequelize.define('picks', {
      id: DataTypes.INTEGER,
      week: DataTypes.INTEGER,
      player: DataTypes.INTEGER,
      game: DataTypes.INTEGER,
      winner: DataTypes.TEXT,
      away_score: DataTypes.INTEGER,
      home_score: DataTypes.INTEGER
  }, {
    timestamps: false,
    instanceMethods: {
      countTasks: function() {
        // how to implement this method ?
      }
    }
  });
};
