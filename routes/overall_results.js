// TODO: define object to use with async

function PageData() {
   this.rank = null;
   this.player_id = null;
   this.player_name = null;
   this.overall = null;
   this.projected = null;
   this.possible = null;
   this.weeks = null;
   this.last_week_state = null;
   this.last_week_projected = null;
   this.last_week_possible = null;
}

function get_all_game_ids(weeks) {
   var game_ids = new Array();
   for (var i=0; i < weeks.length; i++) {
      week_games = weeks[i].games;
      for (var j=0; j < week_games.length; j++) {
         game_ids.push(week_games[j]);
      }
   }
   return game_ids;
}

function get_team_ids(games) {
   var team_ids = new Array();
   for (var i=0; i < games.length; i++) {
      team_ids.push(games[i].away_team);
      team_ids.push(games[i].home_team);
   }
   return team_ids;
}

function get_week_games(week,games) {
   var week_games = new Array();
   for (var i=0; i < week.games.length; i++) {
      game_id = week.games[i];
      for (var j=0; j < games.length; j++) {
         if (game_id == games[j].id) {
            week_games.push(games[j]);
            break;
         } 
      }
   }
   return week_games;
}

function get_player_picks(player,picks) {
   var player_picks = new Array();
   for (var i=0; i < picks.length; i++) {
      if (picks[i].player == player) {
         player_picks.push(picks[i]);
      }
   }
   return player_picks;
}

function sum_array(a) {
   var total = 0;
   for (var i=0; i < a.length; i++) {
      total += a[i];
   }
   return total;
}

function sum_array_except_for_last_element(a) {
   var total = 0;
   for (var i=0; i < a.length-1; i++) {
      total += a[i];
   }
   return total;
}

function assign_rank_by_property_value(property,data) {
   var value = data[0][property];
   var rank = 1;
   for (var i=0; i < data.length; i++) {
      value_changed = data[i][property] != value;
      if (value_changed) {
         rank = i+1;
         value = data[i][property];
      }
      data[i].rank = rank;
   }
}

function assign_rank(sorter,sort_by,data) {
   if (sort_by.indexOf('projected') == 0) {
      sorter.sort_overall_results("projected",data);
      assign_rank_by_property_value("projected",data);
   } else if (sort_by.indexOf('possible') == 0) {
      sorter.sort_overall_results("possible",data);
      assign_rank_by_property_value("possible",data);
   } else {
      sorter.sort_overall_results("overall",data);
      assign_rank_by_property_value("overall",data);
   }
}

exports.get = function(req, res){
   models = res.locals.models;
   var picks_model = models.picks;
   var weeks_model = models.weeks;
   var games_model = models.games;
   var teams_model = models.teams;
   var players_model = models.players;
   var year_number = parseInt(req.params.year);

   var async = require('async');

   async.auto({
      weeks: function(next) {
         weeks_model.findAll({where:{year:year_number}}).complete(next);
      },
      players: function(next) {
         players_model.findAll({where:{year:year_number}}).complete(next);
      },
      games: ['weeks',function(next,results) {
         var game_ids = get_all_game_ids(results.weeks);
         games_model.findAll({where: {id:game_ids}}).complete(next);
      }],
      picks: ['weeks',function(next,results) {
         var game_ids = get_all_game_ids(results.weeks);
         picks_model.findAll({where: {game:game_ids}}).complete(next);
      }],
      teams: ['games',function(next,results) {
         var team_ids = get_team_ids(results.games);
         teams_model.findAll({where: ['id=ANY(?)',team_ids]}).complete(next);
      }]}, function(err,results) {
         console.log("overall data retrieved");
         console.log(results.weeks.length + " weeks.");
         console.log(results.players.length + " players.");
         console.log(results.games.length + " games.");
         console.log(results.picks.length + " picks.");
         console.log(results.teams.length + " teams.");

         var get_sort_by_param = function(last_week_state) {
            if (req.query.hasOwnProperty('sort_by') == false)  {
               return "overall";
            } else if (req.query.sort_by == "player") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "player_reversed") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "overall") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "overall_reversed") {
               return req.query.sort_by;
            } else if (last_week_state == "in_progress" && req.query.sort_by == "projected") {
               return req.query.sort_by;
            } else if (last_week_state == "in_progress" && req.query.sort_by == "projected_reversed") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "possible") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "possible_reversed") {
               return req.query.sort_by;
            }
            return "overall";
         }

         var Calculator = require('./calculator.js');

         var data = new Array();
         for (var i=0; i < results.players.length; i++) {
            var player_id = results.players[i].id;

            var player_picks = get_player_picks(player_id,results.picks);

            var page_data = new PageData()
            page_data.player_id = results.players[i].id;
            page_data.player_name = results.players[i].name;
            page_data.overall = 0;
            page_data.projected = 0;
            page_data.possible = 0;
            page_data.weeks = new Array(results.weeks.length);

            var last_week_index = results.weeks.length-1;

            for (var j=0; j < results.weeks.length;j++) {
               var week = results.weeks[j];
               var week_games = get_week_games(week,results.games);
               var calc = new Calculator(week_games,player_picks,results.teams);

               var week_index = week.number - 1;
               page_data.weeks[week_index] = calc.get_number_of_wins();

               if (week_index == last_week_index) {
                  page_data.last_week_state = calc.get_summary_state_of_all_games();
                  if (page_data.last_week_state != "final") {
                     page_data.last_week_projected = calc.get_number_of_projected_wins();
                  }
                  page_data.last_week_possible = calc.get_number_of_possible_wins();
               }
            }
            page_data.overall = sum_array(page_data.weeks);

            var number_of_weeks = 13;
            var number_of_weeks_left = number_of_weeks - page_data.weeks.length;
            page_data.possible = sum_array_except_for_last_element(page_data.weeks) + page_data.last_week_possible + 10*number_of_weeks_left;
            if (page_data.last_week_state != "final") {
               page_data.projected = sum_array_except_for_last_element(page_data.weeks) + page_data.last_week_projected + 10*number_of_weeks_left;
            }
            data.push(page_data);
         }
         var sort_by = get_sort_by_param(data[0].last_week_state);

         sorter = require('./sort_overall.js');
         assign_rank(sorter,sort_by,data);
         sorter.sort_overall_results(sort_by,data);

         res.render('overall_results', { year: req.params.year, data:data, sort_by:sort_by });
   });
}; 
