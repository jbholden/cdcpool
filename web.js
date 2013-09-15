var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var Sequelize = require("sequelize");

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

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//var sequelize = new Sequelize('postgres://ubuntu@localhost:5432/mydb'
var sequelize = new Sequelize('pooldb','postgres', 'football', {
	host: '127.0.0.1',
	port: 5432,
	dialect: 'postgres'
});

sequelize.query("SELECT * FROM weeks").success(function(myTableRows) {
	console.log(myTableRows)
});

app.get('/routes', routes.index);
app.get('/users', user.list);

app.get('/', function(request, response) {
  response.send('Overall Leaderboard');
});

app.param('wknum');

app.get('/week/:wknum', function(request, response) {
  response.send('Week ' + request.params.wknum + ' Leaderboard');
});

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
