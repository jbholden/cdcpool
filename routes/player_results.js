function PageData() {
   this.player_pick = null;
   this.result = null;
   this.away_team = null;
   this.home_team = null;
   this.away_score = null;
   this.home_score = null;
   this.game_state = null;
   this.favored = null;
   this.favored_spread = null;
   this.winning_team = null;
   this.game_spread = null;
   this.game_quarter = null;
   this.game_time = null;
}

function PageSummaryData() {
   this.player_id = null;
   this.wins = null;
   this.losses = null;
   this.win_pct = null;
   this.possible_wins = null;
   this.projected_wins = null;
   this.week_state = null;
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
   var player_number = parseInt(req.params.playernum);

   var async = require('async');

   async.auto({
      num_weeks: function(next) {
         weeks_model.count({where:{year:year_number}}).complete(next);
      },
      week: function(next) {
         weeks_model.find({where:{year:year_number,number:week_number}}).complete(next);
      },
      player: function(next) {
         players_model.find({where:{id:player_number}}).complete(next);
      },
      picks: ['week',function(next,results) {
         picks_model.findAll({where: {player:player_number,game:results.week.games}}).complete(next);
      }],
      games: ['week',function(next,results) {
         games_model.findAll({where: {id:results.week.games},order: 'number'}).complete(next);
      }],
      teams: ['games',function(next,results) {
         var team_ids = new Array();
         for (var i=0; i < results.games.length; i++) {
            team_ids.push(results.games[i].away_team);
            team_ids.push(results.games[i].home_team);
         }
         teams_model.findAll({where: ['id=ANY(?)',team_ids]}).complete(next);
      }]}, function(err,results) {
         var player_name = results.player.name;
         var Calculator = require('./calculator.js');
         var calc = new Calculator(results.games,results.picks,results.teams);
         var data = new Array();
         for (var i=0; i < results.games.length; i++) {
            var game_id = results.games[i].id;
            var page_data = new PageData();
            page_data.player_pick = calc.get_team_name_picked_to_win(game_id);
            page_data.result = calc.get_game_result_string(game_id);
            page_data.away_team = calc.get_game_away_team(game_id);
            page_data.home_team = calc.get_game_home_team(game_id);
            page_data.away_score = results.games[i].away_score;
            page_data.home_score = results.games[i].home_score;
            page_data.game_state = calc.get_game_state(game_id);
            page_data.favored = calc.get_favored_team_name(game_id);
            page_data.favored_spread = results.games[i].spread;
            if (results.games[i].state == "final") {
               page_data.winning_team = calc.get_game_winner_team_name(game_id);
               //page_data.winning_team = calc.get_pool_game_winner_team_name(game_id);
               page_data.game_spread = calc.get_game_score_spread(game_id);
            } else if (results.games[i].state == "in_progress") {
               page_data.winning_team = calc.get_team_name_winning_game(game_id);
               //page_data.winning_team = calc.get_team_name_winning_pool_game(game_id);
               page_data.game_spread = calc.get_game_score_spread(game_id);
               page_data.game_quarter = results.games[i].quarter
               page_data.game_time = results.games[i].time
            } else if (results.games[i].state == "not_started") {
               page_data.game_time = results.games[i].time
            }
            data.push(page_data);
         }
         var summary_data = new PageSummaryData();
         summary_data.player_id = results.player.id;
         summary_data.wins = calc.get_number_of_wins();
         summary_data.losses = calc.get_number_of_losses();
         summary_data.win_pct = calc.get_win_pct_string(summary_data.wins,summary_data.losses);
         summary_data.possible_wins = calc.get_number_of_possible_wins();
         summary_data.projected_wins = calc.get_number_of_projected_wins();
         summary_data.week_state = calc.get_summary_state_of_all_games();

         res.render('player_results', { year: req.params.year, week:req.params.wknum, player:player_name,data:data,summary:summary_data,num_weeks:results.num_weeks });
   });
}; 
