function PageData() {
   this.game_id = null;
   this.away_team = null;
   this.home_team = null;
   this.away_score = null;
   this.home_score = null;
   this.state = null;
   this.quarter = null;
   this.time = null;
   this.away_score_input_name = null;
   this.home_score_input_name = null;
   this.qtr_input_name = null;
   this.time_input_name = null;
   this.final_checkbox_name = null;
}


exports.get = function(req, res){
   models = res.locals.models;
   var weeks_model = models.weeks;
   var games_model = models.games;
   var teams_model = models.teams;
   var year_number = parseInt(req.params.year);
   var week_number = parseInt(req.params.wknum);

   var async = require('async');

   // see: https://github.com/caolan/async#auto
   // see: http://redotheweb.com/2013/02/20/sequelize-the-javascript-orm-in-practice.html
   /* some learnings:
      - executes a series of sql queries
      - queries are executed asynchronously unless specify dependencies
      - define dependencies like this:  [ 'dependency1','dependency2',...,function ]
      - results passed in as 2nd argument contains the prior query results
      - can use results in the next query
    */

   async.auto({
      week: function(next) {
         weeks_model.find({where:{year:year_number,number:week_number}}).complete(next);
      },
      games: ['week',function(next,results) {
         games_model.findAll({where: ['id=ANY(?)',results.week.games],order:'number'}).complete(next);
      }], 
      teams: ['games',function(next,results) {
         var team_ids = new Array();
         for (var i=0; i < results.games.length; i++) {
            team_ids.push(results.games[i].away_team);
            team_ids.push(results.games[i].home_team);
         }
         teams_model.findAll({where: ['id=ANY(?)',team_ids]}).complete(next);
      }]}, function(err, results) {
         var lookup_team = function(team_id) { 
            for (var i=0; i < results.teams.length; i++) {
               if (results.teams[i].id == team_id) {
                  return results.teams[i].pool_name;
               }
            }
            return null;
         };
  
         var get_score_str = function(score) {
            if (score == null) {
               return "";
            }
            return ""+score;
         };

         var get_value_or_empty_string = function(value) {
            if (value == null) {
                return "";
            }
            return value;
         };

         var data = new Array();
         for (var i=0; i < results.games.length; i++) {
            game = results.games[i]
            var page_data = new PageData();
            page_data.away_team = lookup_team(game.away_team);
            page_data.home_team = lookup_team(game.home_team);
            page_data.away_score = get_score_str(game.away_score);
            page_data.home_score = get_score_str(game.home_score);
            page_data.state = game.state;

            page_data.quarter = get_value_or_empty_string(game.quarter);
            page_data.time = get_value_or_empty_string(game.time);

            page_data.game_id = game.id;
            page_data.away_score_input_name = "away_score_" + game.id;
            page_data.home_score_input_name = "home_score_" + game.id;
            page_data.qtr_input_name = "quarter_" + game.id;
            page_data.time_input_name = "time_" + game.id;
            page_data.final_checkbox_name = "final_" + game.id;

            data.push(page_data);
         }
         res.render('update_games', { year: req.params.year, week:req.params.wknum, data:data });
   });
}; 

