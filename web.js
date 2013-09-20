var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var wk_leaderboard = require('./routes/week_leaderboard.js');
var update_games = require('./routes/update_games.js');
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


//var sequelize = new Sequelize('postgres://ubuntu@localhost:5432/mydb'
/*var sequelize = new Sequelize('pooldb','postgres', 'football', {
	host: '127.0.0.1',
	port: 5432,
	dialect: 'postgres'
});

sequelize.query("SELECT * FROM weeks").success(function(myTableRows) {
	console.log(myTableRows)
});

app.get('/routes', routes.index);
app.get('/users', user.list);*/

app.get('/', function(request, response) {
  response.send('Overall Leaderboard');
});

app.param('wknum');
app.param('year');

var load_model = function(req,res,next) {
   res.locals.models = app.get('models');
   next();
};

app.get('/:year/week/:wknum/leaderboard', wk_leaderboard.leaderboard);
app.get('/:year/week/:wknum/update_games', load_model, update_games.update);


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
