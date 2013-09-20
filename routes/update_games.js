exports.update = function(req, res){
   console.log("update games, res.locals.models=" + res.locals.models);
   models = res.locals.models;
   var weeks_model = models.weeks;
   var games_model = models.games;
   var year_number = parseInt(req.params.year);
   var week_number = parseInt(req.params.wknum);

   /*
   weeks.find({ where: { year:year_number, number:week_number }}).success(function(rows) {
      console.log(year_number + " Week " + week_number);
      console.log(rows);
   });*/

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
         games_model.find({where: ['id=ANY(?)',results.week.games]}).complete(next);
      }]}, function(err, results) {
         //var week = results.week;
         //var games = results.games;
         console.log("week=" + results.week);
         console.log("games=" + results.games);
   });
}; 
