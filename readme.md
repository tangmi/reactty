# reactty

a reactive templating solution for TTY environments!

# usage

```
npm install reactty
```

for now, check out `./test/basic.js` for features

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
 */
var view = new reactty.View('Hi, my name is {{name}}');

// update the context and the view will update accordingly
setTimeout(function() {
	view.data.name = 'tangmi';
}, 1000);

```
