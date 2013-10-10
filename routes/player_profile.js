exports.get = function(req, res){
   var players_model = models.players;
   var year_number = parseInt(req.params.year);
   var player_number = parseInt(req.params.playernum);

   var async = require('async');

   async.auto({
      player: function(next) {
         players_model.find({where:{id:player_number,year:year_number}}).complete(next);
      }
   }, function(err,results) {
      res.render('player_profile', { player:results.player });
   });
}

exports.post = function(req, res){

   console.log("player profile post");

   // cancel button pressed
   if (req.body.hasOwnProperty('cancel_form')) {
      console.log("cancel pressed");
      res.redirect('/' + req.params.year + '/results');
      return;
   }

   // don't know what happened, submit button should have been pressed
   if (req.body.hasOwnProperty('submit_form') == false) {
      res.redirect('/' + req.params.year + '/results');
      return;
   }
   console.log("submit pressed");

   var year_number = parseInt(req.params.year);
   var player_number = parseInt(req.params.playernum);
   var players_model = models.players;

   var new_name = req.body['player_name_input'];

   var async = require('async');

   async.auto({
      player: function(next) {
         players_model.find({where:{id:player_number,year:year_number}}).complete(next);
      },
      player_save: ['player',function(next,results) {
         var m = results.player;
         m.name = new_name;
         m.save(['name']).complete(next);
      }]}, function(err, results) {
        res.redirect('/' + req.params.year + '/results');
      });
}
