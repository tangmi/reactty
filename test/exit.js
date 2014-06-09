var reactty = require('..');

var view = new reactty.View('im a boring template');

setTimeout(function() {
	view.stop();

	// once stopped, the view won't step on normal output
	console.log('hi there');
	console.log('how are you?');
	console.log();

	setTimeout(function() {
		// view.start();

		setTimeout(function() {
			// will render and print applicatio output
			console.log('DUMPING OUTPUT:');
			view.dump();

			process.exit(0);
		}, 100);
	}, 500);
}, 100);