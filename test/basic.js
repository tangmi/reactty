var fs = require('fs');
var reactty = require('..');

var view = new reactty.View(fs.readFileSync(__dirname + '/simple-template.hbs').toString());

// view.config('wrap', true); // haven't figured out how to architech a solution for this yet


setTimeout(function() {
	view.data = {
		"name": "Alan",
		"hometown": "Somewhere, TX",
		"kids": [{
			"name": "Jimmy",
			"age": "12"
		}, {
			"name": "Sally",
			"age": "4"
		}],
		"unescaped": "<h1>NO ESCAPING</h1>"
	};

	setInterval(function() {
		// no need to notify the view of updates, just change the context
		view.data.time = +new Date();
	}, 1000);
}, 1000);

setTimeout(function() {
	// we'll actually get the stack trace printed out
	throw new Error('it also handles errors!');
}, 20000);