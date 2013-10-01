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

function assign_rank_by_wins_and_losses(data) {
   var wins = data[0].wins;
   var losses = data[0].losses;
   var rank = 1;
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

function assign_rank_by_property_wins(property,data) {
   var wins = data[0][property];
   var rank = 1;
   for (var i=0; i < data.length; i++) {
      wins_changed = data[i][property] != wins;
      if (wins_changed) {
         rank = i+1;
         wins = data[i][property];
      }
      data[i].rank = rank;
   }
}

function assign_rank(sorter,sort_by,data) {
   if (sort_by.indexOf('projected') == 0) {
      sorter.sort_week_results("projected",data);
      assign_rank_by_property_wins("projected_wins",data);
   } else if (sort_by.indexOf('possible') == 0) {
      sorter.sort_week_results("possible",data);
      assign_rank_by_property_wins("possible_wins",data);
   } else {
      sorter.sort_week_results("wins",data);
      assign_rank_by_wins_and_losses(data);
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
         console.log("err:" + err);

         if (results.week == null) {
            console.log("week missing");
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
               console.log("week_state=" + week_state);
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

         sorter = require('./sort_week.js');
         assign_rank(sorter,sort_by,data);
         sorter.sort_week_results(sort_by,data);

         res.render('week_results', { year: req.params.year, week:req.params.wknum, data:data, week_state:week_state, sort_by:sort_by, num_weeks:results.num_weeks });
   });
}; 
