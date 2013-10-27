function PageData() {
   this.rank = null;
   this.player_id = null;
   this.player_name = null;
   this.wins = null;
   this.losses = null;
   this.win_pct = null;
   this.projected_wins = null;
   this.possible_wins = null;
}

function assign_rank_by_wins_and_losses(data,first_rank) {
   var wins = data[0].wins;
   var losses = data[0].losses;
   var rank = first_rank;
   for (var i=0; i < data.length; i++) {
      wins_changed = data[i].wins != wins;
      losses_changed = data[i].losses != losses;
      if (wins_changed) {
         rank = i+1;
         wins = data[i].wins;
         losses = data[i].losses;
      } else if (losses_changed) {
         rank = i+1;
         losses = data[i].losses;
      }
      data[i].rank = rank;
   }
}

function assign_leaders_rank_1(data,leaders) {
   if (leaders == null) { return; }
   if (leaders.hasOwnProperty('length') == false) {
      var index = get_winner_index(data,leaders);
      data[index].rank = 1;
   } else {
      for (var i=0; i < leaders.length; i++) {
         var index = get_winner_index(data,leaders);
         data[index].rank = 1;
      }
   }
}

function calculate_winner(data,results,week_state) {
   var use_projected = week_state == "in_progress"? true : false;
   winner_class = require('./winner.js');
   var win_input = winner_class.get_winner_input_data_from_week_results(data,results);
   var winner = new winner_class.Winner(win_input,use_projected);
   return winner.get_winner_data_object();
}

function assign_rank_by_property_wins(property,data,first_rank) {
   var wins = data[0][property];
   var rank = first_rank;
   for (var i=0; i < data.length; i++) {
      wins_changed = data[i][property] != wins;
      if (wins_changed) {
         rank = i+1;
         wins = data[i][property];
      }
      data[i].rank = rank;
   }
}

function get_winner_index(data,player_id) {
    for (var i=0; i < data.length; i++) {
        if (data[i].player_id == player_id) {
            return i;
        }
    }
    return -1;
}


function assign_all_players_rank_1(data) {
   for (var i=0; i < data.length; i++) {
      data[i].rank = 1;
   }
}

function assign_rank(sorter,sort_by,data,winner_data,week_state) {
   if (week_state == "final") {
      sorter.sort_week_results_with_leaders("wins",data,winner_data.winner);
      assign_rank_by_wins_and_losses(data,2);
      assign_leaders_rank_1(data,winner_data.winner)
      return;
   } else if (week_state == "not_started") {
      assign_all_players_rank_1(data);
      return;
   } else if (week_state != "in_progress") {
      assign_all_players_rank_1(data);  // error
      return;
   }
   assign_week_in_progress_rank(sorter,sort_by,data,winner_data);
}

function get_projected_winner(winner_data) {
   if (winner_data.featured_game_state == "final") {
      return winner_data.winner;
   } else if (winner_data.featured_game_state == "in_progress") {
      return winner_data.projected;
   }
   return null;
}

function assign_week_in_progress_rank(sorter,sort_by,data,winner_data) {
   //TODO: fix this
   //var projected_winner = get_projected_winner(winner_data);
   var projected_winner = null;

   if (sort_by.indexOf('wins') == 0) {
      sorter.sort_week_results_with_leaders("wins",data,projected_winner);
      assign_rank_by_wins_and_losses(data,1);
   } else if (sort_by.indexOf('losses') == 0) {
      sorter.sort_week_results_with_leaders("wins",data,projected_winner);
      assign_rank_by_wins_and_losses(data,1);
   } else if (sort_by.indexOf('projected') == 0) {
      //TODO: fix this
      sorter.sort_week_results_with_leaders("projected",data,projected_winner);
      if (projected_winner == null) {
         assign_rank_by_property_wins("projected_wins",data,1);
      } else {
         assign_rank_by_property_wins("projected_wins",data,2);
         assign_leaders_rank_1(data,projected_winner);
      }
   } else if (sort_by.indexOf('possible') == 0) {
      sorter.sort_week_results_with_leaders("possible",data,projected_winner);
      assign_rank_by_property_wins("possible_wins",data,1);
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
      teams: ['games',function(next,results) {
         var team_ids = new Array();
         for (var i=0; i < results.games.length; i++) {
            team_ids.push(results.games[i].away_team);
            team_ids.push(results.games[i].home_team);
         }
         teams_model.findAll({where: ['id=ANY(?)',team_ids]}).complete(next);
      }]}, function(err,results) {
         //console.log("err:" + err);

         if (results.week == null) {
            console.log("week missing");
            res.send("week missing");
            //res.render('week_missing', { year: req.params.year, week:req.params.wknum});
            return
         }

         var Calculator = require('./calculator.js');

         var get_player_picks = function(player_id,all_picks) {
            player_picks = new Array()
            for (var i=0; i < all_picks.length; i++) {
               if (all_picks[i].player == player_id) {
                  player_picks.push(all_picks[i]);
               }
            }
            return player_picks;
         }

         var get_sort_by_param = function(week_state) {
            if (req.query.hasOwnProperty('sort_by') == false)  {
               return "wins";
            } else if (req.query.sort_by == "player") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "player_reversed") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "wins") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "wins_reversed") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "losses") {
               return req.query.sort_by;
            } else if (req.query.sort_by == "losses_reversed") {
               return req.query.sort_by;
            } else if (week_state != "final" && req.query.sort_by == "projected") {
               return req.query.sort_by;
            } else if (week_state != "final" && req.query.sort_by == "projected_reversed") {
               return req.query.sort_by;
            } else if (week_state != "final" && req.query.sort_by == "possible") {
               return req.query.sort_by;
            } else if (week_state != "final" && req.query.sort_by == "possible_reversed") {
               return req.query.sort_by;
            }
            return "wins";
         }
         
         var data = new Array();
         var week_state = null;
         for (var i=0; i < results.players.length; i++) {
            player_picks = get_player_picks(results.players[i].id,results.picks);
            var calc = new Calculator(results.games,player_picks,results.teams);

            if (i==0) {
               week_state = calc.get_summary_state_of_all_games();
            }

            var page_data = new PageData()
            page_data.rank = 1;
            page_data.player_id = results.players[i].id;
            page_data.player_name = results.players[i].name;
            page_data.wins = calc.get_number_of_wins();
            page_data.losses = calc.get_number_of_losses();
            page_data.win_pct = calc.get_win_pct_string(page_data.wins,page_data.losses);
            page_data.projected_wins = calc.get_number_of_projected_wins();
            page_data.possible_wins = calc.get_number_of_possible_wins();
            data.push(page_data);
         }

         var sort_by = get_sort_by_param(week_state);
         var winner_data = calculate_winner(data,results,week_state);

         sorter = require('./sort_week.js');
         assign_rank(sorter,sort_by,data,winner_data,week_state);
         // TODO:  fix this
         if (week_state == "final") {
            sorter.sort_week_results_with_leaders(sort_by,data,get_projected_winner(winner_data));
         } else if (week_state == "in_progress" && sort_by.indexOf("projected") == 0) {
            sorter.sort_week_results_with_leaders(sort_by,data,get_projected_winner(winner_data));
         } else {
            sorter.sort_week_results_with_leaders(sort_by,data,null);
         }

         res.render('week_results', { year: req.params.year, week:req.params.wknum, data:data, week_state:week_state, sort_by:sort_by, num_weeks:results.num_weeks, winner_data:winner_data });
   });
}; 
