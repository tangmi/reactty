# reactty

a reactive templating solution for TTY environments!

# usage

```
npm install reactty
```

for now, check out `./test/basic.js` for features

things to node:

* if the output is too big, scroll around with the arrow keys (issue #2)
* the display seen when resizing the window is a little bit broken (due to how node triggers its resize event, it will always be one step late)

```js
var reactty = require('reactty');

/*
 * new reactty.View(TEMPLATE_SOURCE_STRING[, optionInitalContext])
 *
 * Create a view that will clear and replace stdout with your template.
 * Any updates to the view's data will immediately reflect in the
 * rendered text, without needs for manually notifying the view of
 * changes. Neato!
 *
 * It'll throw an error if the terminal running the program does not
 * support TTY, and will tell you to fallback to peasant logging schemes
 * for output.
 */
var view = new reactty.View('Hi, my name is {{name}}');

// update the context and the view will update accordingly
setTimeout(function() {
	view.data.name = 'tangmi';
}, 1000);

```
