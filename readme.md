# reactty

a reactive templating solution for TTY environments!

# usage

```
npm install reactty
```

for now, check out `./test/basic.js` for features

```js
var reactty = require('reactty');

var view = new reactty.View(TEMPLATE_SOURCE_STRING[, optionInitalContext]);

view.data = {} // update the context and the view will update accordingly
```
