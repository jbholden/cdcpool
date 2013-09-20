function SQLTest() {
   this.result = null;

   var Sequelize = require("sequelize");
   var sequelize = new Sequelize('pooldb','postgres', 'football', {
	   host: '127.0.0.1',
	   port: 5432,
	   dialect: 'postgres'
   });

   this.testsql = function() {
      var chainer = new Sequelize.Utils.QueryChainer;
      chainer.add(sequelize.query("SELECT * from players").success(function(myrows) { console.log("1 finished"); }));
      chainer.add(sequelize.query("SELECT * from weeks where weeks.year = 2013").success(function(myrows) { console.log("2 finished"); }));
      chainer.add(sequelize.query("SELECT * from games where games.id < 20").success(function(myrows) { console.log("3 finished"); }));

      chainer.run().success(function(results) { console.log("chain success"); });

      /*sequelize.query("SELECT name FROM players").success(function(myTableRows) {
         this.result = myTableRows;
      }*/
   }
} 

exports.SQLTest = SQLTest;
