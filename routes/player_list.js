exports.get = function(req, res){
   var players_model = models.players;
   var year_number = parseInt(req.params.year);

   var async = require('async');

   async.auto({
      players: function(next) {
         players_model.findAll({where:{year:year_number},order:"name"}).complete(next);
      }
   }, function(err,results) {
      res.render('player_list', { year:year_number, players:results.players });
   });
}
