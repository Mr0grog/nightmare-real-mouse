# nightmare-real-mouse

[![Greenkeeper badge](https://badges.greenkeeper.io/Mr0grog/nightmare-real-mouse.svg)](https://greenkeeper.io/)

An experimental [Nightmare](https://github.com/segmentio/nightmare) plugin for triggering true mouse events in the browser (instead of simulated ones as Nightmare currently does).

Example usage:

```js
const Nightmare = require('nightmare');
const realMouse = require('nightmare-real-mouse');

// add the plugin
realMouse(Nightmare);

nightmare
  .goto('http://yahoo.com')
  .type('form[action*="/search"] [name=p]', 'github nightmare')
  // use realClick() instead of click()
  .realClick('form[action*="/search"] [type=submit]')
  .wait('#main')
  .evaluate(function () {
    return document.querySelector('#main .searchCenterMiddle li a').href
  })
  .end()
  .then(function (result) {
    console.log(result)
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });
```


## Installation

Install from NPM!

```
npm install nightmare-real-mouse
```

And then use in your Nightmare scripts:

```js
const Nightmare = require('nightmare');
require('nightmare-real-mouse')(Nightmare);
```


## API

The plugin provides three methods that are alternatives to those built into Nightmare:


### realClick(selector, [position])

Click on the element with the specified `selector`. Note that, because this is a real mouse event, the click won’t actually happen directly on the specified element if it is obscured by some other element (instead, it will happen on the element that is visually "in front").

The actual location of the click can be specified with the second argument, `position`, which should be an object with `x` and `y` properties that are numbers. They represent offsets from the top/left corner of the element specified by `selector`. If unspecified, the position will be the center of the element.

Issuing two `realClick()` calls within 300ms of each other on the same element will additionally trigger a `dblclick` event.

**Example:**

```js
// Click the top-left corner of the "I'm Feeling Lucky" button on Google
Nightmare()
  .goto('https://google.com')
  .realClick('input[value*="Lucky"]', {x: 1, y: 1})
  .then(() => console.log('Clicked “I’m Feeling Lucky!”'));
```


### realMouseover(selector, [position])

Fires `mouseover` and `mouseenter` events on the given `selector`. This will also fire the relevant `mouseout` and `mouseleave` events on elements that the mouse was previously over, if any.

Like `realClick()`, the optional `position` argument is an object with `x` and `y` properties specifying the location of the event inside the element. If unspecified, the location will be the center of the element.


### realMousedown(selector, [position])

Fires the `mousedown` event on the given `selector`. It will also cause `mouseover` and `mouseenter` events on the element and `mouseout` and `mouseleave` events on whatever element the mouse *was* over if the mouse is not already over the element.

Like `realClick()`, the optional `position` argument is an object with `x` and `y` properties specifying the location of the event inside the element. If unspecified, the location will be the center of the element.


## License

Nightmare-real-mouse is open source software. It is (c) 2016 Rob Brackett and licensed under
the BSD license. The full license text is in the `LICENSE` file.
