// vim:  set shiftwidth=3 softtabstop=3
// TODO:  player did not pick:  adjust projected and possible to 0, return "loss"
/* 
   (done) this.get_team_picked_to_win
   (done) this.get_team_name_picked_to_win
   (done) this.get_game
   (done) this.get_game_pick
   (done) this.get_team_name
   (done) this.is_home_team_winning_pool
   (done) this.is_away_team_winning_pool
   (done) this.get_pool_game_winner
   (done) this.get_pool_game_winner_team_name
   (done) this.get_game_winner
   (done) this.get_game_winner_team_name
   (done) this.get_game_away_team
   (done) this.get_game_home_team
   (done) this.get_team_winning_pool_game
   (done) this.get_team_name_winning_pool_game
   (done) this.get_team_winning_game
   (done) this.get_team_name_winning_game
   (done) this.get_game_state
   (done) this.did_player_win_game
   (done) this.get_number_of_wins
   (done) this.did_player_lose_game
   (done) this.get_number_of_losses
   (done) this.is_player_winning_game
   (done) this.is_player_losing_game
   (done) this.is_player_projected_to_win_game
   (done) this.is_player_possible_to_win_game
   (done) this.get_number_of_projected_wins
   (done) this.get_number_of_possible_wins
   (done) this.all_games_final
   (done) this.no_games_started
   (done) this.at_least_one_game_in_progress
   (done) this.get_summary_state_of_all_games
   (done) this.get_game_result_string
   (done) this.get_favored_team_name
   (done) this.get_game_score_spread
   (done) this.player_did_not_pick
*/

function Calculator(games,picks,teams) {
   this.games = games;
   this.picks = picks;
   this.teams = teams;

   this.get_team_picked_to_win = function(game_id) {
      pick = this.get_game_pick(game_id);
      return pick.winner;
   }

   this.get_team_name_picked_to_win = function(game_id) {
      game = this.get_game(game_id);
      team = this.get_team_picked_to_win(game_id);

      if (team == "home") {
         return this.get_team_name(game.home_team)
      } else if (team == "away") {
         return this.get_team_name(game.away_team)
      }
      return null;
   }

   this.get_game = function(game_id) {
      for (var i=0; i < this.games.length; i++) {
         if (this.games[i].id == game_id) {
            return this.games[i];
         }
      }
      return null;
   }

   this.get_game_pick = function(game_id) {
      for (var i=0; i < this.picks.length; i++) {
         if (this.picks[i].game == game_id) {
            return this.picks[i];
         }
      }
      return null;
   }

   this.get_team_name = function(team_id) {
      for (var i=0; i < this.teams.length; i++) {
         if (this.teams[i].id == team_id) {
            return this.teams[i].pool_name;
         }
      }
      return null;
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

   this.get_pool_game_winner_team_name = function(game_id) {
      game = this.get_game(game_id);
      winner = this.get_pool_game_winner(game_id);
      if (winner == "home") {
         return this.get_team_name(game.home_team);
      } else if (winner == "away") {
         return this.get_team_name(game.away_team);
      }
      return null;
   }

   this.get_game_winner = function(game_id) {
      game = this.get_game(game_id);
      if (game != null && game.state == "final") {
         if (game.home_score > game.away_score) {
            return "home";
         } else {
            return "away";
         }
      }
      return null;
   }

   this.get_game_winner_team_name = function(game_id) {
      game = this.get_game(game_id);
      winner = this.get_game_winner(game_id);
      if (winner == "home") {
         return this.get_team_name(game.home_team);
      } else if (winner == "away") {
         return this.get_team_name(game.away_team);
      }
      return null;
   }

   this.get_game_away_team = function(game_id) {
      game = this.get_game(game_id);
      return this.get_team_name(game.away_team);
   }

   this.get_game_home_team = function(game_id) {
      game = this.get_game(game_id);
      return this.get_team_name(game.home_team);
   }

   this.get_team_winning_pool_game = function(game_id) {
      game = this.get_game(game_id);
      if (game != null && game.state == "in_progress") {
         if (this.is_home_team_winning_pool(game)) {
            return "home";
         } else if (this.is_away_team_winning_pool(game)) {
            return "away";
         }
      }
      return null;
   }

   this.get_team_name_winning_pool_game = function(game_id) {
      game = this.get_game(game_id);
      team = this.get_team_winning_pool_game(game_id);
      if (team == "home") {
         return this.get_team_name(game.home_team);
      } else if (team == "away") {
         return this.get_team_name(game.away_team);
      }
   }

   this.get_team_winning_game = function(game_id) {
      game = this.get_game(game_id);
      if (game != null && game.state == "in_progress") {
         if (game.home_score > game.away_score) {
            return "home";
         } else {
            return "away";
         }
      }
      return null;
   }

   this.get_team_name_winning_game = function(game_id) {
      game = this.get_game(game_id);
      team = this.get_team_winning_game(game_id);
      if (team == "home") {
         return this.get_team_name(game.home_team);
      } else if (team == "away") {
         return this.get_team_name(game.away_team);
      }
   }

   this.get_game_state = function(game_id) {
      game = this.get_game(game_id);
      return game.state;
   }

   /*
   this.get_game_state_string = function(game_id) {
      game = this.get_game(game_id);
      if (game.state == "final") {
         return "final";
      } else if (game.state == "in_progress") {
         return "in progress";
      } else if (game.state == "not_started") {
         return "";
      }
      return null;
   }*/

   this.player_did_not_pick = function(game_id) {
      team_pick = this.get_team_picked_to_win(game_id);
      return team_pick == null;
   }

   this.did_player_win_game = function(game_id) {
      if (this.player_did_not_pick(game_id)) {
            return false;
      }
      game = this.get_game(game_id);
      winner = this.get_pool_game_winner(game_id);
      if (winner != null) {
         team_pick = this.get_team_picked_to_win(game_id);
         return winner == team_pick;
      }
      return false;
   }

   this.did_player_lose_game = function(game_id) {
      if (this.player_did_not_pick(game_id)) {
            return true;
      }
      game = this.get_game(game_id);
      winner = this.get_pool_game_winner(game_id);
      if (winner != null) {
         team_pick = this.get_team_picked_to_win(game_id);
         return winner != team_pick;
      }
      return false;
   }

   this.get_number_of_wins = function() {
      wins = 0;
      for (var i=0; i < this.games.length; i++) {
         if (this.did_player_win_game(this.games[i].id)) {
            wins++;
         }
      }
      return wins;
   }

   this.get_number_of_losses = function() {
      losses = 0;
      for (var i=0; i < this.games.length; i++) {
         if (this.did_player_lose_game(this.games[i].id)) {
            losses++;
         }
      }
      return losses;
   }

   this.is_player_winning_game = function(game_id) {
      if (this.player_did_not_pick(game_id)) {
            return false;
      }
      game = this.get_game(game_id);
      team_ahead = this.get_team_winning_pool_game(game_id);
      if (team_ahead != null) {
         team_pick = this.get_team_picked_to_win(game_id);
         return team_ahead == team_pick;
      }
      return false;
   }

   this.is_player_losing_game = function(game_id) {
      if (this.player_did_not_pick(game_id)) {
            return true;
      }
      game = this.get_game(game_id);
      team_ahead = this.get_team_winning_pool_game(game_id);
      if (team_ahead != null) {
         team_pick = this.get_team_picked_to_win(game_id);
         return team_ahead != team_pick;
      }
      return false;
   }

   this.is_player_projected_to_win_game = function(game_id) {
      if (this.player_did_not_pick(game_id)) {
            return false;
      }
      game_state = this.get_game_state(game_id);
      if (game_state == "final") {
         return this.did_player_win_game(game_id);
      } else if (game_state == "in_progress") {
         return this.is_player_winning_game(game_id);
      } else if (game_state == "not_started") {
         return true;
      }
      return null;  // error
   }

   this.is_player_possible_to_win_game = function(game_id) {
      if (this.player_did_not_pick(game_id)) {
            return false;
      }
      game_state = this.get_game_state(game_id);
      if (game_state == "final") {
         return this.did_player_win_game(game_id);
      } else if (game_state == "in_progress") {
         return true;
      } else if (game_state == "not_started") {
         return true;
      }
      return null;  // error
   }

   this.get_number_of_projected_wins = function() {
      wins = 0;
      for (var i=0; i < this.games.length; i++) {
         if (this.is_player_projected_to_win_game(this.games[i].id)) {
            wins++;
         }
      }
      return wins;
   }

   this.get_number_of_possible_wins = function() {
      wins = 0;
      for (var i=0; i < this.games.length; i++) {
         if (this.is_player_possible_to_win_game(this.games[i].id)) {
            wins++;
         }
      }
      return wins;
   }

   this.all_games_final = function() {
      final_games = 0;
      for (var i=0; i < this.games.length; i++) {
        if (this.games[i].state == "final") {
           final_games++;
        }
      }
      return final_games == this.games.length;
   }

   this.no_games_started = function() {
      not_started = 0;
      for (var i=0; i < this.games.length; i++) {
        if (this.games[i].state == "not_started") {
           not_started++;
        }
      }
      return not_started == this.games.length;
   }

   this.at_least_one_game_in_progress = function() {
      in_progress = 0;
      for (var i=0; i < this.games.length; i++) {
         console.log("game["+i+"].state=" + this.games[i].state);
        if (this.games[i].state == "in_progress") {
           in_progress++;
        }
      }
      return in_progress > 0;
   }

   this.get_summary_state_of_all_games = function() {
      if (this.all_games_final()) {
         return "final";
      }
      if (this.no_games_started()) {
         return "not_started";
      }
      return "in_progress";
   }

   this.get_game_result_string = function(game_id) {
      if (this.did_player_win_game(game_id)) {
         return "win";
      }
      if (this.did_player_lose_game(game_id)) {
         return "loss";
      }
      if (this.is_player_winning_game(game_id)) {
         return "ahead";
      }
      if (this.is_player_losing_game(game_id)) {
         return "behind";
      }
      return "";
   }

   this.get_favored_team_name = function(game_id) {
      game = this.get_game(game_id);
      if (game.favored == "home") {
         return this.get_team_name(game.home_team);
      } else if (game.favored == "away") {
         return this.get_team_name(game.away_team);
      }
      return null;
   }

   this.get_game_score_spread = function(game_id) {
      game = this.get_game(game_id);
      if (game.home_score > game.away_score) {
         return game.home_score - game.away_score;
      } else {
         return game.away_score - game.home_score;
      }
   }

   this.get_win_pct = function(wins,losses) {
      var num_games = wins+losses;
      if (num_games == 0) {
         return 0.000;
      }
      return wins / num_games;
   }

   this.get_win_pct_string = function(wins,losses) {
      win_pct = this.get_win_pct(wins,losses);
      return "" + win_pct.toFixed(3);
   }
}

module.exports = Calculator;
