function PageSummaryData() {
   this.player_id = null;
   this.player_name = null;
   this.number_of_tiebreaks = 0;
   this.tiebreak0 = null;
   this.tiebreak1 = null;
   this.tiebreak2 = null;
   this.tiebreak3 = null;
}

function PageTiebreaker0Data() {
   this.player_id = null;
   this.player_name = null;
   this.result = null;
   this.player_pick = null;
   this.featured_game_winner = null;
}


function lookup_player_name(players,player_id) {
   for (var i=0; i < players.length; i++) {
      if (players[i].id == player_id) {
         return players[i].name;
      }
   }
   return null;
}

function get_player_picks(player_id,all_picks) {
   player_picks = new Array()
   for (var i=0; i < all_picks.length; i++) {
      if (all_picks[i].player == player_id) {
         player_picks.push(all_picks[i]);
      }
   }
   return player_picks;
}

function calculate_tiebreaker0_details(results,won_tiebreak0,lost_tiebreak0,featured_game_id) {
   var Calculator = require('./calculator.js');
   var tiebreak0_data = new Array();
   for (var i=0; i < won_tiebreak0.length; i++) {
      var p = new PageTiebreaker0Data();
      p.player_id = won_tiebreak0[i];
      p.player_name = lookup_player_name(results.players,p.player_id);
      p.result = "won";

      var player_picks = get_player_picks(p.player_id,results.picks);
      var calc = new Calculator(results.games,player_picks,results.featured_teams);

      p.player_pick = calc.get_team_name_picked_to_win(featured_game_id);
      p.featured_game_winner = calc.get_pool_game_winner_team_name(featured_game_id);
      tiebreak0_data.push(p);
   }
   for (var i=0; i < lost_tiebreak0.length; i++) {
      var p = new PageTiebreaker0Data();
      p.player_id = lost_tiebreak0[i];
      p.player_name = lookup_player_name(results.players,p.player_id);
      p.result = "lost";

      var player_picks = get_player_picks(p.player_id,results.picks);
      var calc = new Calculator(results.games,player_picks,results.featured_teams);

      p.player_pick = calc.get_team_name_picked_to_win(featured_game_id);
      p.featured_game_winner = calc.get_pool_game_winner_team_name(featured_game_id);
      tiebreak0_data.push(p);
   }
   return tiebreak0_data;
}

exports.get = function(req, res){
   models = res.locals.models;

   var picks_model = models.picks;
   var weeks_model = models.weeks;
   var games_model = models.games;
   var teams_model = models.teams;
   var players_model = models.players;
   var year_number = parseInt(req.params.year);
   var week_number = parseInt(req.params.wknum);

   var async = require('async');

   async.auto({
      num_weeks: function(next) {
         weeks_model.count({where:{year:year_number}}).complete(next);
      },
      week: function(next) {
         weeks_model.find({where:{year:year_number,number:week_number}}).complete(next);
      },
      players: function(next) {
         players_model.findAll({where:{year:year_number}}).complete(next);
      },
      games: ['week',function(next,results) {
         games_model.findAll({where: {id:results.week.games}}).complete(next);
      }],
      picks: ['week',function(next,results) {
         picks_model.findAll({where: {game:results.week.games}}).complete(next);
      }],
      featured_teams: ['games',function(next,results) {
         var team_ids = new Array();
         for (var i=0; i < results.games.length; i++) {
            if (results.games[i].number == 10) {
               team_ids.push(results.games[i].away_team);
               team_ids.push(results.games[i].home_team);
            }
         }
         teams_model.findAll({where: ['id=ANY(?)',team_ids]}).complete(next);
      }]}, function(err,results) {
         if (results.week == null) {
            console.log("week missing");
            res.send("week missing");
            return
         }
         var lookup_data_index = function(data,player_id) {
            for (var i=0; i < data.length; i++) {
               if (data[i].player_id == player_id) {
                  return i;
               }
            }
            return null;
         }
         var winner_class = require('./winner.js');
         var input = winner_class.get_winner_input_data_from_tiebreaker(results)
         var winner = new winner_class.Winner(input);

         var data = new Array();
         var tied_for_first = winner.get_players_tied_for_first();
         for (var i=0; i < tied_for_first.length; i++) {
            p = new PageSummaryData();
            p.player_id = tied_for_first[i];
            p.player_name = lookup_player_name(results.players,p.player_id);
            data.push(p);
         }
         var won_tiebreak0 = winner.get_players_that_won_tiebreak_0();
         var lost_tiebreak0 = winner.get_players_that_lost_tiebreak_0();
         for (var i=0; i < won_tiebreak0.length; i++) {
            var idx = lookup_data_index(data,won_tiebreak0[i]);
            data[idx].tiebreak0 = "won";
            data[idx].number_of_tiebreaks++;
         }
         for (var i=0; i < lost_tiebreak0.length; i++) {
            var idx = lookup_data_index(data,lost_tiebreak0[i]);
            data[idx].tiebreak0 = "lost";
            data[idx].number_of_tiebreaks++;
         }
         var won_tiebreak1 = winner.get_players_that_won_tiebreak_1();
         var lost_tiebreak1 = winner.get_players_that_lost_tiebreak_1();
         for (var i=0; i < won_tiebreak1.length; i++) {
            var idx = lookup_data_index(data,won_tiebreak1[i]);
            data[idx].tiebreak1 = "won";
            data[idx].number_of_tiebreaks++;
         }
         for (var i=0; i < lost_tiebreak1.length; i++) {
            var idx = lookup_data_index(data,lost_tiebreak1[i]);
            data[idx].tiebreak1 = "lost";
            data[idx].number_of_tiebreaks++;
         }
         var won_tiebreak2 = winner.get_players_that_won_tiebreak_2();
         var lost_tiebreak2 = winner.get_players_that_lost_tiebreak_2();
         for (var i=0; i < won_tiebreak2.length; i++) {
            var idx = lookup_data_index(data,won_tiebreak2[i]);
            data[idx].tiebreak2 = "won";
            data[idx].number_of_tiebreaks++;
         }
         for (var i=0; i < lost_tiebreak2.length; i++) {
            var idx = lookup_data_index(data,lost_tiebreak2[i]);
            data[idx].tiebreak2 = "lost";
            data[idx].number_of_tiebreaks++;
         }
         var won_tiebreak3 = winner.get_players_that_won_tiebreak_3();
         var lost_tiebreak3 = winner.get_players_that_lost_tiebreak_3();
         for (var i=0; i < won_tiebreak3.length; i++) {
            var idx = lookup_data_index(data,won_tiebreak3[i]);
            data[idx].tiebreak3 = "won";
            data[idx].number_of_tiebreaks++;
         }
         for (var i=0; i < lost_tiebreak3.length; i++) {
            var idx = lookup_data_index(data,lost_tiebreak3[i]);
            data[idx].tiebreak3 = "lost";
            data[idx].number_of_tiebreaks++;
         }

         var sorter = require('./sort_tiebreak');
         sorter.sort_tiebreak(data);

         var featured_game_id = input.featured_game.id;
         var tiebreak0_data = calculate_tiebreaker0_details(results,won_tiebreak0,lost_tiebreak0,featured_game_id);

         res.render('tiebreaker', { year: year_number, week:week_number, data:data, tiebreak0:tiebreak0_data });
   });
}
