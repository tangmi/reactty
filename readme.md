# reactty

have **YOU** ever wanted to make a cli app that looks and feels kinda maybe like a desktop or webapp? is ncurses too rich for your blood? have you had to settle for spamming `console.log`s like a peasant? have **I** got a thing for **YOU**!

introducing (for the first time ever) reactive mustache-like templating for TTY!!!

just follow the steps:

1. create a template (any mustache template will do, i'm using [`handlebars`](http://handlebarsjs.com/) under the hood)
2. create a view with that template
3. just update the context object and...
4. voilà, shit just rendered the change itself!

# usage

```
npm install --save reactty
```

for now, check out `./test/basic.js` for features

things to note:

* if the output is too big, scroll around with the arrow keys (issue #2) or the mouse wheel (issue #12). if excess data exists above or below, indicator arrows will appear (issue #4)
* the display seen when resizing the window is a little bit broken (due to how node triggers its resize event, it will always be one step late)
* templates now support color and styles. the (tentative) syntax is available in `test/styles-template.hbs` (issue #8)
* display will only re-render if its contents have changed (issue #10)
* on a safe (code 0) exit from the program, the full output, as defined in the template, will be printed for easy copy/paste of the output (issue #6)

```js
var reactty = require('reactty');

/*
 * new reactty.View(TEMPLATE_SOURCE_STRING)
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

// TODO:
//   * talk about color helpers `test/styles.js`
//   * talk about .stop() and .start() `test/exit.js`

```
