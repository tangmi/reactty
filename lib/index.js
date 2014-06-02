var fs = require('fs');

var handlebars = require('handlebars');
var gameloop = require('node-gameloop');

var log = console.log;
/*
console.log = function() {
	// replace console.log to print to the template (or sub-panel?)
}
 */


function View(templateSource, context) {
	this.data = context || {};

	template = handlebars.compile(templateSource);

	var h = process.stdout.rows;
	process.stdout.on('resize', function() {
		h = process.stdout.rows;
	});

	var id = gameloop.setGameLoop((function(delta) {
		var result = template(this.data);

		log('\033[2J'); // clear the screen
		process.stdout.cursorTo(0, 0); // reset cursor position
		process.stdout.write(result);
		process.stdout.cursorTo(0, h - 1);

	}).bind(this), 1000 / 15);

	process.on('uncaughtException', function(e) {
		// show error, and exit program
		gameloop.clearGameLoop(id);
		log(e.stack);
		process.exit(1);
	});

}

module.exports.View = View;