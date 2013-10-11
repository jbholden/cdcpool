function WinnerInput() {
   this.player_ids = null;
   this.player_wins = null;
   this.featured_game = null;
   this.player_featured_game_picks = null;
   this.week = null;
}


function get_winner_input_data_from_week_results(page_data,database_results) {
   var input_data = new WinnerInput();

   input_data.week = database_results.week;
   input_data.featured_game = null;
   var games = database_results.games;
   for (var i=0; i < games.length; i++) {
      if (games[i].number == 10) {
         input_data.featured_game = games[i];
         break;
      }
   }

   input_data.player_ids = new Array();
   input_data.player_wins = new Array();
   for (var i=0; i < page_data.length; i++) {
      input_data.player_ids.push(page_data[i].player_id);
      input_data.player_wins.push(page_data[i].wins);
   }

   var picks = database_results.picks;
   input_data.player_featured_game_picks = new Array()
   for (var i=0; i < input_data.player_ids.length; i++) {
      var player_id = input_data.player_ids[i];
      for (var j=0; j < picks.length; j++) {
         var pick = picks[j]
         if (pick.player == player_id && pick.game == input_data.featured_game.id) {
            input_data.player_featured_game_picks.push(pick);
         }
      }
   }
   return input_data;
}

function get_winner_input_data_from_tiebreaker(database_results) {
   var get_player_picks = function(player_id,all_picks) {
      player_picks = new Array()
      for (var i=0; i < all_picks.length; i++) {
         if (all_picks[i].player == player_id) {
            player_picks.push(all_picks[i]);
         }
      }
      return player_picks;
   }

   var Calculator = require('./calculator.js');

   var input_data = new WinnerInput();

   for (var i=0; i < database_results.games.length; i++) {
      if (database_results.games[i].number == 10) {
         input_data.featured_game = database_results.games[i];
         break;
      }
   }

   input_data.player_ids = new Array();
   input_data.player_wins = new Array();
   for (var i=0; i < database_results.players.length; i++) {
      var player_id = database_results.players[i].id;

      var player_picks = get_player_picks(player_id,database_results.picks)
      var calc = new Calculator(database_results.games,player_picks,null);
      var wins = calc.get_number_of_wins();

      input_data.player_ids.push(player_id);
      input_data.player_wins.push(wins);
   }

   var picks = database_results.picks;
   input_data.player_featured_game_picks = new Array()
   for (var i=0; i < input_data.player_ids.length; i++) {
      var player_id = input_data.player_ids[i];
      for (var j=0; j < picks.length; j++) {
         var pick = picks[j]
         if (pick.player == player_id && pick.game == input_data.featured_game.id) {
            input_data.player_featured_game_picks.push(pick);
         }
      }
   }
   return input_data;
}


function Winner(input) {
   this.input = input;
   this.calculated_winner = null;
   this.players_tied_for_first = null;
   this.players_won_tiebreak0 = null;
   this.players_lost_tiebreak0 = null;
   this.players_won_tiebreak1 = null;
   this.players_lost_tiebreak1 = null;
   this.players_won_tiebreak2 = null;
   this.players_lost_tiebreak2 = null;
   this.players_won_tiebreak3 = null;
   this.players_lost_tiebreak3 = null;

   this.calculate_tied_for_first = function() {
      var most_wins = Math.max.apply(Math,this.input.player_wins);
      var tied_for_first = new Array();
      for (var i=0; i < this.input.player_wins.length; i++) {
         if (this.input.player_wins[i] == most_wins) {
            tied_for_first.push(i);
         }
      }
      this.players_tied_for_first = tied_for_first;
   }


   this.calculate_tiebreaker_0 = function() {
      if (this.tiebreaker_0_unnecessary()) {
         this.players_won_tiebreak0 = new Array();
         this.players_lost_tiebreak0 = new Array();
         return;
      }
      var featured_winner = this.get_team_that_won_featured_game();
      if (featured_winner == null) { return null; }
      var won_tiebreaker0 = new Array();
      var lost_tiebreaker0 = new Array();
      for (var i=0; i < this.players_tied_for_first.length; i++) {
         var index = this.players_tied_for_first[i];
         var player_pick = this.input.player_featured_game_picks[index];
         if (player_pick.winner == featured_winner) {
            won_tiebreaker0.push(index);
         } else {
            lost_tiebreaker0.push(index);
         }
      }
      this.players_won_tiebreak0 = won_tiebreaker0;
      this.players_lost_tiebreak0 = lost_tiebreaker0;
   }

   this.calculate_tiebreaker_1 = function() {
      if (this.tiebreaker_1_unnecessary()) {
         this.players_won_tiebreak1 = new Array();
         this.players_lost_tiebreak1 = new Array();
         return;
      }
      var players = this.get_players_to_use(1);

      var game = this.input.featured_game; 
      var result_spread = game.away_score - game.home_score;
      var min_difference = 0;
      for (var i=0; i < players.length; i++) {
         var index = players[i];
         var pick = this.input.player_featured_game_picks[index];
         var pick_spread = pick.away_score - pick.home_score
         var pick_difference = Math.abs(pick_spread - result_spread);
         if (i==0 || pick_difference < min_difference) {
            min_difference = pick_difference;
         }
      }
      var won_tiebreak1 = new Array();
      var lost_tiebreak1 = new Array();
      for (var i=0; i < players.length; i++) {
         var index = players[i];
         var pick = this.input.player_featured_game_picks[index];
         var pick_spread = pick.away_score - pick.home_score
         var pick_difference = Math.abs(pick_spread - result_spread);
         if (pick_difference == min_difference) {
            won_tiebreak1.push(index);
         } else {
            lost_tiebreak1.push(index);
         }
      }
      this.players_won_tiebreak1 = won_tiebreak1;
      this.players_lost_tiebreak1 = lost_tiebreak1;
   }

   this.calculate_tiebreaker_2 = function() {
      if (this.tiebreaker_2_unnecessary()) {
         this.players_won_tiebreak2 = new Array();
         this.players_lost_tiebreak2 = new Array();
         return;
      }
      var players = this.get_players_to_use(2);

      var game = this.input.featured_game; 
      var result_total = game.away_score + game.home_score;
      var min_difference = 0;
      for (var i=0; i < players.length; i++) {
         var index = players[i];
         var pick = this.input.player_featured_game_picks[index];
         var pick_total = pick.away_score + pick.home_score
         var pick_difference = Math.abs(result_total-pick_total);
         if (i==0 || pick_difference < min_difference) {
            min_difference = pick_difference;
         }
      }
      var won_tiebreak2 = new Array();
      var lost_tiebreak2 = new Array();
      for (var i=0; i < players.length; i++) {
         var index = players[i];
         var pick = this.input.player_featured_game_picks[index];
         var pick_spread = pick.away_score - pick.home_score
         var pick_difference = Math.abs(pick_spread - result_spread);
         if (pick_difference == min_difference) {
            won_tiebreak2.push(tied_players_picks[i]);
         } else {
            lost_tiebreak2.push(tied_players_picks[i]);
         }
      }
      this.players_won_tiebreak2 = won_tiebreak2;
      this.players_lost_tiebreak2 = lost_tiebreak2;
   }

   this.calculate_tiebreaker_3 = function() {
      if (this.tiebreaker_3_unnecessary()) {
         this.players_won_tiebreak3 = new Array();
         this.players_lost_tiebreak3 = new Array();
         return;
      }
      var players = this.get_players_to_use(3);
      this.players_won_tiebreak3 = players;
      this.players_lost_tiebreak3 = new Array();
      return players;  // not implemented yet
   }

   this.tiebreaker_0_unnecessary = function() {
      return this.players_tied_for_first.length == 1;
   }
   this.tiebreaker_1_unnecessary = function() {
      return this.tiebreaker_0_unnecessary() || this.players_won_tiebreak0.length == 1;
   }
   this.tiebreaker_2_unnecessary = function() {
      return this.tiebreaker_1_unnecessary() || 
             this.players_won_tiebreak1.length == 1;
   }
   this.tiebreaker_3_unnecessary = function() {
      return this.tiebreaker_2_unnecessary() || 
             this.players_won_tiebreak2.length == 1;
   }

   this.get_players_to_use = function(tiebreaker) {
      // tiebreak0:  use players tied for first
      // tiebreak1:  use tiebreak0 or players tied for first
      // tiebreak2:  use tiebreak1, tiebreak0, players tied for first
      // tiebreak3:  use tiebreak2, tiebreak1, tiebreak0, players_tied_for_first
      if (tiebreaker == 0) {
         return this.players_tied_for_first;
      }
      if (tiebreaker == 1) {
         if (this.players_won_tiebreak0.length == 0) {
            return this.players_tied_for_first;
         }
         return this.players_won_tiebreak0;
      }
      if (tiebreaker == 2) {
         if (this.players_won_tiebreak1.length == 0) {
            if (this.players_won_tiebreak0.length == 0) {
               return this.players_tied_for_first;
            }
            return this.players_won_tiebreak0;
         }
         return this.players_won_tiebreak1;
      }
      if (tiebreaker == 3) {
         if (this.players_won_tiebreak2.length == 0) {
            if (this.players_won_tiebreak1.length == 0) {
               if (this.players_won_tiebreak0.length == 0) {
                  return this.players_tied_for_first;
               }
               return this.players_won_tiebreak0;
            }
            return this.players_won_tiebreak1;
         }
         return this.players_won_tiebreak2;
      }
      return null;
   }

   this.calculate_winner = function() {
      if (this.players_won_tiebreak3.length > 0) {
         this.calculated_winner = this.convert_indexes_to_player_ids(this.players_won_tiebreak3);
         return;
      }
      if (this.players_won_tiebreak2.length == 1) {
         this.calculated_winner = this.convert_indexes_to_player_ids(this.players_won_tiebreak2);
         return;
      }
      if (this.players_won_tiebreak1.length == 1) {
         this.calculated_winner = this.convert_indexes_to_player_ids(this.players_won_tiebreak1);
         return;
      }
      if (this.players_won_tiebreak0.length == 1) {
         this.calculated_winner = this.convert_indexes_to_player_ids(this.players_won_tiebreak0);
         return;
      }
      if (this.players_tied_for_first.length == 1) {
         this.calculated_winner = this.convert_indexes_to_player_ids(this.players_tied_for_first);
         return;
      }
      this.calculated_winner = null; // error
   }

   this.is_winner_official = function() {
       return this.input.week.winner != null;
   }

   this.get_winner = function() {
      if (this.input.week.winner != null) {
         return this.input.week.winner;
      }

      if (this.input.featured_game.state == "not_started") {
         return null;   
      }
      if (this.input.featured_game.state == "in_progress") {
         return null;   
      }
      return this.calculated_winner;
   }

   this.get_projected_winner = function() {
      if (this.input.featured_game.state == "in_progress") {
         return this.calculated_winner;
      }
      return null;
   }

   this.verify_winner = function() {
      if (this.input.featured_game.state != "final") {
         return null;   
      }
      return this.calculated_winner == this.input.week.winner;
   }

   this.get_players_tied_for_first = function() {
    return this.convert_indexes_to_player_ids(this.players_tied_for_first);
   }
   this.get_players_that_won_tiebreak_0 = function() {
    return this.convert_indexes_to_player_ids(this.players_won_tiebreak0);
   }
   this.get_players_that_lost_tiebreak_0 = function() {
    return this.convert_indexes_to_player_ids(this.players_lost_tiebreak0);
   }
   this.get_players_that_won_tiebreak_1 = function() {
    return this.convert_indexes_to_player_ids(this.players_won_tiebreak1);
   }
   this.get_players_that_lost_tiebreak_1 = function() {
    return this.convert_indexes_to_player_ids(this.players_lost_tiebreak1);
   }
   this.get_players_that_won_tiebreak_2 = function() {
    return this.convert_indexes_to_player_ids(this.players_won_tiebreak2);
   }
   this.get_players_that_lost_tiebreak_2 = function() {
    return this.convert_indexes_to_player_ids(this.players_lost_tiebreak2);
   }
   this.get_players_that_won_tiebreak_3 = function() {
    return this.convert_indexes_to_player_ids(this.players_won_tiebreak3);
   }
   this.get_players_that_lost_tiebreak_3 = function() {
    return this.convert_indexes_to_player_ids(this.players_lost_tiebreak3);
   }

   this.get_team_that_won_featured_game = function() {
      game = this.input.featured_game;
      if (this.is_home_team_ahead(game)) {
         return "home";
      } else if (this.is_away_team_ahead(game)) {
         return "away";
      }
      return null;
   }


   this.is_home_team_ahead = function(game) {
      var score_diff = game.home_score-game.away_score;
      var spread = 0;
      if (game.favored == 'home') {
            spread = game.spread;
      } else if (game.favored == 'away') {
            spread = -game.spread;
      } 
      return score_diff > spread;
   }

   this.is_away_team_ahead = function(game) {
      var score_diff = game.home_score-game.away_score;
      var spread = 0;
      if (game.favored == 'home') {
            spread = game.spread;
      } else if (game.favored == 'away') {
            spread = -game.spread;
      }
      return score_diff < spread;
   }

   this.convert_indexes_to_player_ids = function(indexes) {
      player_ids = new Array();
      for (var i=0; i < indexes.length; i++) {
         var idx = indexes[i];
         var id = this.input.player_ids[idx];
         player_ids.push(id);
      }
      return player_ids;
   }

   this.get_winner_data_object = function() {
      var winner = this.get_winner();
      var projected_winner = this.get_projected_winner();
      var featured_game_state = this.input.featured_game.state;
      var official = this.is_winner_official();
      return { featured_game_state:featured_game_state, winner:winner, projected:projected_winner, official:official };
      // return { featured_game_state:featured_game_state, winner:new Array(75,56), projected:projected_winner, official:official };
   }

   this.calculate_tied_for_first();
   this.calculate_tiebreaker_0();
   this.calculate_tiebreaker_1();
   this.calculate_tiebreaker_2();
   this.calculate_tiebreaker_3();
   this.calculate_winner();
}

module.exports = {
   WinnerInput:WinnerInput,
   Winner:Winner,
   get_winner_input_data_from_week_results: get_winner_input_data_from_week_results,
   get_winner_input_data_from_tiebreaker:get_winner_input_data_from_tiebreaker
}
