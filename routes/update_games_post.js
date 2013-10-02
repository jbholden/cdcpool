// TODO:  handle case where wrong score format entered

function PageData() {
   this.game_id = null;
   this.away_score = null;
   this.home_score = null;
   this.state = null;
}


exports.post = function(req, res){

   var extract_id = function(s) {
      s_array = s.split('_');
      s_id = s_array[s_array.length-1];
      return parseInt(s_id);
   };

   var get_game_index_and_create = function(game_id,game_data) {
      for (var i=0; i < game_data.length; i++) {
         if (game_data[i].game_id == game_id) {
            return i;
         }
      }
      var d = new PageData();
      d.game_id = game_id;
      game_data.push(d);
      return game_data.length - 1;
   };

   var assign_null_states = function(game_data) {
      for (var i=0; i < game_data.length; i++) {
         if (game_data[i].state == null) {
            if (game_data[i].away_score == "" || game_data[i].home_score == "") {
               game_data[i].state = "not_started";
            } else {
               game_data[i].state = "in_progress";
            }
         }
      }
   };

   var convert_scores_to_ints = function(game_data) {
      for (var i=0; i < game_data.length; i++) {
         if (game_data[i].state != "not_started") {
            game_data[i].away_score = parseInt(game_data[i].away_score);
            game_data[i].home_score = parseInt(game_data[i].home_score);
         } else {
            game_data[i].away_score = null;
            game_data[i].home_score = null;
         }
      }
   };

   var print_data = function(game_data) {
      for (var i=0; i < game_data.length; i++) {
         g = game_data[i];
         console.log("id="+g.game_id+", away="+g.away_score+", home="+g.home_score+", state="+g.state);
      }
   };

   var data = new Array();
   
   for (var property in req.body) {
      if (property.indexOf('away_score') == 0) {
         game_id = extract_id(property);
         idx = get_game_index_and_create(game_id,data);
         data[idx].away_score = req.body[property];
      } else if (property.indexOf('home_score') == 0) {
         game_id = extract_id(property);
         idx = get_game_index_and_create(game_id,data);
         data[idx].home_score = req.body[property];
      } else if (property.indexOf('final') == 0) {
         game_id = extract_id(property);
         idx = get_game_index_and_create(game_id,data);
         if (req.body[property] == "checked") {
            data[idx].state = "final";
         } 
      }
   }
   assign_null_states(data);
   convert_scores_to_ints(data);

   var games_model = res.locals.models.games;

   var async = require('async');
   // use async.parallel?
   // define object
   // find where id=value, change model, save

   /*
   sql_updates = new Object();
   for (var i=0; i < data.length; i++) {
      get_prop_name
      sql_updates[i] = function(next) {
         games_model.
         games_model.save([])
      }
   }
   for (var property in sql_updates) {
      console.log('prop=' + property + ", value=" + sql_updates[property]);
   }*/
   async.auto({
      game0_find: function(next) {
         games_model.find({where:{id:data[0].game_id}}).complete(next);
      },
      game1_find: function(next) {
         games_model.find({where:{id:data[1].game_id}}).complete(next);
      },
      game2_find: function(next) {
         games_model.find({where:{id:data[2].game_id}}).complete(next);
      },
      game3_find: function(next) {
         games_model.find({where:{id:data[3].game_id}}).complete(next);
      },
      game4_find: function(next) {
         games_model.find({where:{id:data[4].game_id}}).complete(next);
      },
      game5_find: function(next) {
         games_model.find({where:{id:data[5].game_id}}).complete(next);
      },
      game6_find: function(next) {
         games_model.find({where:{id:data[6].game_id}}).complete(next);
      },
      game7_find: function(next) {
         games_model.find({where:{id:data[7].game_id}}).complete(next);
      },
      game8_find: function(next) {
         games_model.find({where:{id:data[8].game_id}}).complete(next);
      },
      game9_find: function(next) {
         games_model.find({where:{id:data[9].game_id}}).complete(next);
      },
      game0_save: ['game0_find',function(next,results) {
         var d = data[0];
         var m = results.game0_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
      }],
      game1_save: ['game1_find',function(next,results) {
         var d = data[1];
         var m = results.game1_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
      }],
      game2_save: ['game2_find',function(next,results) {
         var d = data[2];
         var m = results.game2_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
      }],
      game3_save: ['game3_find',function(next,results) {
         var d = data[3];
         var m = results.game3_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
      }],
      game4_save: ['game4_find',function(next,results) {
         var d = data[4];
         var m = results.game4_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
      }],
      game5_save: ['game5_find',function(next,results) {
         var d = data[5];
         var m = results.game5_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
      }],
      game6_save: ['game6_find',function(next,results) {
         var d = data[6];
         var m = results.game6_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
      }],
      game7_save: ['game7_find',function(next,results) {
         var d = data[7];
         var m = results.game7_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
      }],
      game8_save: ['game8_find',function(next,results) {
         var d = data[8];
         var m = results.game8_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
      }],
      game9_save: ['game9_find',function(next,results) {
         var d = data[9];
         var m = results.game9_find;
         m.away_score = d.away_score;
         m.home_score = d.home_score;
         m.state = d.state;
         m.save(['home_score','away_score','state']).complete(next);
         
      }]}, function(err, results) {
         res.redirect(req.params.year+'/week/'+req.params.wknum+'/results')
      });
}
