/*
 final leaderboard:
 - list of players
 - list of wins
 - list of losses
 - list if win pct.

 get games for the week and year
 calculate the pool winner of each game
 for each player, calculate wins/losses/win pct

 add(sql query)
 add(sql query)
 ...
 run query 1
 run query 2
 ...
 call render
*/

function PageData() {
   this.rank = null;
   this.player_name = null;
   this.wins = null;
   this.losses = null;
   this.win_pct = null;
}


function WeekLeaderboardData(year,week) {
   this.year = year;
   this.week = week;
   this.games = null;
   this.players = null;
   this.picks = null;

   this.get_page_data = function() {
      var data = new Array();
      for (var i=0; i < this.players.length; i++) {
         d = new PageData();
         d.rank = 1;
         d.player_name = this.players[i].name;
         d.wins = this.get_number_of_player_wins(this.players[i].id);  
         d.losses = this.get_number_of_player_losses(this.players[i].id);  

         var num_games = d.wins + d.losses;
         if (num_games == 0) {
            d.win_pct = "0.000";
         } else {
            var winpct = d.wins / num_games;
            d.win_pct = winpct.toFixed(3);
         }
         data.push(d);
      }
      return data;
   }

   this.get_number_of_player_wins = function(player_id) {
      var player_picks = this.get_player_picks(player_id);
      if (player_picks.length == 0) {
         return null;
      }
      wins = 0;
      for (var i=0; i < player_picks.length; i++) {
         winner = this.get_pool_game_winner(player_picks[i].game);
         if (winner != null && winner == player_picks[i].winner) {
            wins++;
         }
      }
      return wins;
   }

   this.get_number_of_player_losses = function(player_id) {
      var player_picks = this.get_player_picks(player_id);
      if (player_picks.length == 0) {
         return null;
      }
      losses = 0;
      for (var i=0; i < player_picks.length; i++) {
         winner = this.get_pool_game_winner(player_picks[i].game);
         if (winner != null && winner != player_picks[i].winner) {
            losses++;
         }
      }
      return losses;
   }

   this.get_game = function(game_id) {
      for (var i=0; i < this.games.length; i++) {
         if (this.games[i].id == game_id) {
            return this.games[i];
         }
      }
      return null;
   }

   this.get_player_picks = function(player_id) {
      player_picks = new Array();
      for (var i=0; i < this.picks.length; i++) {
         if (this.picks[i].player == player_id) {
            player_picks.push(this.picks[i]);
         }
      }
      return player_picks;
   }


   this.is_home_team_winning_pool = function(game) {
      var score_diff = game.home_score-game.away_score;
      var spread = 0;
      if (game.favored == 'home') {
            spread = game.spread;
      } else if (game.favored == 'away') {
            spread = -game.spread;
      } 
      return score_diff > spread;
   }

   this.is_away_team_winning_pool = function(game) {
      var score_diff = game.home_score-game.away_score;
      var spread = 0;
      if (game.favored == 'home') {
            spread = game.spread;
      } else if (game.favored == 'away') {
            spread = -game.spread;
      }
      return score_diff < spread;
   }


   this.get_game_state = function(game_id) {
      game = this.get_game(game_id);
      if (game != null) {
         return game.state;
      }
      return null;
   }

   this.get_team_winning_pool_game = function(game_id) {
      game = this.get_game(game_id);
      if (game != null && game.state == "in_progress") {
         if (is_home_team_winning_pool(game)) {
            return "home";
         } else if (is_away_team_winning_pool(game)) {
            return "away";
         }
      }
      return null;
   }

   this.get_team_winning_game = function(game_id) {
      game = this.get_game(game_id);
      if (game != null && game.state == "in_progress") {
         if (this.game[i].home_score > this.game[i].away_score) {
            return "home";
         } else {
            return "away";
         }
      }
      return null;
   }

   this.get_pool_game_winner = function(game_id) {
      game = this.get_game(game_id);
      if (game != null && game.state == "final") {
         if (this.is_home_team_winning_pool(game)) {
            return "home";
         } else if (this.is_away_team_winning_pool(game)) {
            return "away";
         }
      }
      return null;
   }

   this.get_game_winner = function(game_id) {
      game = this.get_game(game_id);
      if (game != null && game.state == "final") {
         if (this.game[i].home_score > this.game[i].away_score) {
            return "home";
         } else {
            return "away";
         }
      }
      return null;
   }

   this.get_week_state = function() {
      final_games = 0;
      in_progress = 0;
      not_started = 0;
      for (var i=0; i < this.games.length; i++) {
         if (this.games[i].state == "in_progress") {
            in_progress++;
         } else if (this.games[i].state == "final") {
            final_games++;
         } else if (this.games[i].state == "not_started") {
            not_started++;
         }
      }  
      week_final = final_games == this.games.length;
      week_not_started = not_started == this.games.length;
      week_in_progress = !week_final && !week_not_started;

      if (week_final) {
         return "final";
      } else if (week_not_started) { 
         return "not started";
      } else if (week_in_progress) { 
         return "in progress";
      }
      return null;
   };
};


exports.leaderboard = function(req, res){
   var Sequelize = require("sequelize");
   var sequelize = new Sequelize('pooldb','postgres', 'football', {
	   host: '127.0.0.1',
	   port: 5432,
	   dialect: 'postgres'
   });
   var year_number = parseInt(req.params.year);
   var week_number = parseInt(req.params.wknum);

   var get_week_games_sql = "SELECT games FROM weeks WHERE weeks.year=" + year_number + 
      " and weeks.number=" + week_number;

   sequelize.query(get_week_games_sql).success(function(myTableRows) {
      if (myTableRows.length == 1) {
         var game_array = "ARRAY[" + myTableRows[0].games + "]";
         var games_sql = "SELECT * FROM games WHERE games.id = ANY(" + game_array + ")";
         var players_sql = "SELECT * FROM players WHERE year="+req.params.year;
         var picks_sql = "SELECT * FROM picks WHERE picks.game = ANY(" + game_array + ")";

         sequelize.query(games_sql).success(function(myTableRows) {
            var data = new WeekLeaderboardData(year_number,week_number);
            data.games = myTableRows;
            sequelize.query(players_sql).success(function(myTableRows) {
               data.players = myTableRows;
               sequelize.query(picks_sql).success(function(myTableRows) {
                  data.picks = myTableRows;
                  var page_data = data.get_page_data();
                  res.render('week_leaderboard', { year: req.params.year, week:req.params.wknum, data:page_data });
               });
            });
         });
      }
   });

   /*sequelize.query("SELECT name FROM players").success(function(myTableRows) {
	   //console.log(myTableRows)
      var player_names = new Array();
      for (var i=0;i<myTableRows.length;i++) {
         player_names.push(myTableRows[i].name)
      }
      res.render('week_leaderboard', { year: req.params.year, week:req.params.wknum, players:player_names });
   });*/
};
