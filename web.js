// TODO:
// - error handling (bad parameters, missing weeks, missing players) http://expressjs.com/guide.html#error-handling
// - clean up async (read documentation)
// - clean up callbacks (see callbackhell.com)
// - fix title
// - move error functions to another file?

var express = require('express');
var update_games = require('./routes/update_games.js');
var update_games_post = require('./routes/update_games_post.js');
var player_results = require('./routes/player_results.js');
var week_results = require('./routes/week_results.js');
var overall_results = require('./routes/overall_results.js');
var http = require('http');
var path = require('path');

var app = express();

var fs = require('fs');
var logFile = fs.createWriteStream(__dirname + "/public/logs/cdcpool.log", {flags:'a'});

app.use(express.logger({stream: logFile}));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('models',require('./models'));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
   res.redirect('2013/results');
});

app.param('wknum');
app.param('year');
app.param('playernum');

var load_model = function(req,res,next) {
   res.locals.models = app.get('models');
   next();
};

var check_for_week_missing = function(req,res,next) {
   models = res.locals.models;
   var weeks_model = models.weeks;
   var year_number = parseInt(req.params.year);
   var week_number = parseInt(req.params.wknum);
   if (isNaN(week_number)) {
         console.log("week " + req.params.wknum + " is invalid.");
         res.send("Error:  week " + req.params.wknum + " is invalid");
         return;
   }
   if (isNaN(year_number)) {
         console.log("year " + req.params.year + " is invalid.");
         res.send("Error:  year " + req.params.year + " is invalid");
         return;
   }
   weeks_model.find({where:{year:year_number,number:week_number}}).success( function(week) {
      if (week == null) {
         console.log("week " + week_number + " missing.");
         res.send("Error:  week " + week_number + " is invalid");
      } else {
         next();
      }
   });
}

var check_for_player_missing = function(req,res,next) {
   models = res.locals.models;
   var players_model = models.players;
   var player_number = parseInt(req.params.playernum);
   if (isNaN(player_number)) {
         console.log("player " + req.params.playernum + " is invalid.");
         res.send("Error:  player " + req.params.playernum + " is invalid");
         return;
   }
   players_model.find({where:{id:player_number}}).success( function(player) {
      if (player == null) {
         console.log("player " + player_number + " missing.");
         res.send("Error:  player " + player_number + " is invalid");
      } else {
         next();
      }
   });
}

app.get('/:year/results', load_model, overall_results.get);
app.get('/:year/week/:wknum/results', load_model, check_for_week_missing, week_results.get);
app.get('/:year/week/:wknum/games', load_model, check_for_week_missing, update_games.get);
app.post('/:year/week/:wknum/games', load_model, check_for_week_missing, update_games_post.post);
app.get('/:year/week/:wknum/player/:playernum/results', load_model, 
         check_for_week_missing, check_for_player_missing, player_results.get);


var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
