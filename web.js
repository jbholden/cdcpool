var express = require('express');
var app = express();
app.use(express.logger());

var Sequelize = require("sequelize");

//var sequelize = new Sequelize('postgres://ubuntu@localhost:5432/mydb'
var sequelize = new Sequelize('mydb','postgres', 'midnight', {
	host: '127.0.0.1',
	port: 5432,
	dialect: 'postgres'
});

sequelize.query("SELECT * FROM Games").success(function(myTableRows) {
	console.log(myTableRows)
});


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
