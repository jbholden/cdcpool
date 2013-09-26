var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var wk_leaderboard = require('./routes/week_leaderboard.js');
var update_games = require('./routes/update_games.js');
var update_games_post = require('./routes/update_games_post.js');
var player_results = require('./routes/player_results.js');
var week_results = require('./routes/week_results.js');
var http = require('http');
var path = require('path');

/* sql testing... */
//var sqltest = require('./routes/sql_test.js');
//var test = new sqltest.SQLTest();
//console.log(test.testsql());
/* ============================== */

var app = express();
app.use(express.logger());

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

/*
app.get('/routes', routes.index);
app.get('/users', user.list);*/

app.get('/', function(request, response) {
  response.send('Overall Leaderboard');
});

app.param('wknum');
app.param('year');
app.param('playernum');

var load_model = function(req,res,next) {
   res.locals.models = app.get('models');
   next();
};

app.get('/:year/week/:wknum/leaderboard', wk_leaderboard.leaderboard);
app.get('/:year/week/:wknum/results', load_model, week_results.get);
app.get('/:year/week/:wknum/games', load_model, update_games.get);
app.post('/:year/week/:wknum/games', load_model, update_games_post.post);
app.get('/:year/week/:wknum/player/:playernum/results', load_model, player_results.get);


/*
app.get('/week/leaderboard', function(request, response) {
  response.send('Weekly Leaderboard');
});

app.get('/week/player/picks', function(request, response) {
  response.send('Player picks');
});
*/

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
