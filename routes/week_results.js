function PageData() {
   this.rank = null;
   this.player_name = null;
   this.wins = null;
   this.losses = null;
   this.win_pct = null;
   this.projected_wins = null;
   this.possible_wins = null;
}

function sort_by_player_ascending(a,b) {
   if (a.player_name==b.player_name) { return 0; }
   return a.player_name < b.player_name? -1 : 1;
}
function sort_by_player_descending(a,b) {
   if (a.player_name==b.player_name) { return 0; }
   return a.player_name < b.player_name? 1 : -1;
}
function sort_by_wins(a,b) {
   if (a.wins==b.wins) { return 0; }
   return a.wins < b.wins? 1 : -1;
}
function sort_by_wins_reverse(a,b) {
   if (a.wins==b.wins) { return 0; }
   return a.wins < b.wins? -1 : 1;
}
function sort_by_losses(a,b) {
   if (a.losses==b.losses) { return 0; }
   return a.losses < b.losses? 1 : -1;
}
function sort_by_losses_reverse(a,b) {
   if (a.losses==b.losses) { return 0; }
   return a.losses < b.losses? -1 : 1;
}
function sort_by_projected_wins(a,b) {
   if (a.projected_wins==b.projected_wins) { return 0; }
   return a.projected_wins < b.projected_wins? 1 : -1;
}
function sort_by_projected_wins_reverse(a,b) {
   if (a.projected_wins==b.projected_wins) { return 0; }
   return a.projected_wins < b.projected_wins? -1 : 1;
}
function sort_by_possible_wins(a,b) {
   if (a.possible_wins==b.possible_wins) { return 0; }
   return a.possible_wins < b.possible_wins? 1 : -1;
}
function sort_by_possible_wins_reverse(a,b) {
   if (a.possible_wins==b.possible_wins) { return 0; }
   return a.possible_wins < b.possible_wins? -1 : 1;
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
      week: function(next) {
         weeks_model.find({where:{year:year_number,number:week_number}}).complete(next);
      },
      players: function(next) {
         players_model.findAll({where:{year:year_number}}).complete(next);
      },
      games: ['week',function(next,results) {
         games_model.findAll({where: {id:results.week.games}}).complete(next);
      }],
      picks: ['games',function(next,results) {
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
            page_data.player_name = results.players[i].name;
            page_data.wins = calc.get_number_of_wins();
            page_data.losses = calc.get_number_of_losses();
            page_data.win_pct = calc.get_win_pct_string(page_data.wins,page_data.losses);
            page_data.projected_wins = calc.get_number_of_projected_wins();
            page_data.possible_wins = calc.get_number_of_possible_wins();
            data.push(page_data);
         }

         var sort_by = req.query.sort_by;
         if (req.query.hasOwnProperty('sort_by') == false)  {
            data.sort(sort_by_wins);
            sort_by = "wins";
         } else if (req.query.sort_by == "player") {
            data.sort(sort_by_player_ascending);
         } else if (req.query.sort_by == "player_reversed") {
            data.sort(sort_by_player_descending);
         } else if (req.query.sort_by == "wins") {
            data.sort(sort_by_wins);
         } else if (req.query.sort_by == "wins_reversed") {
            data.sort(sort_by_wins_reverse);
         } else if (req.query.sort_by == "losses") {
            data.sort(sort_by_losses);
         } else if (req.query.sort_by == "losses_reversed") {
            data.sort(sort_by_losses_reverse);
         } else if (week_state != "final" && req.query.sort_by == "projected") {
            data.sort(sort_by_projected_wins);
         } else if (week_state != "final" && req.query.sort_by == "projected_reversed") {
            data.sort(sort_by_projected_wins_reverse);
         } else if (week_state != "final" && req.query.sort_by == "possible") {
            data.sort(sort_by_possible_wins);
         } else if (week_state != "final" && req.query.sort_by == "possible_reversed") {
            data.sort(sort_by_possible_wins_reverse);
         } else {
            sort_by = "wins";
            data.sort(sort_by_wins);
         }
         res.render('week_results', { year: req.params.year, week:req.params.wknum, data:data, week_state:week_state, sort_by:sort_by });
   });
}; 
