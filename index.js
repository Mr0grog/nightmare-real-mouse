'use strict';

const debug = require('debug')('nightmare:realClick');

module.exports = function realMouse(Nightmare) {
  if (!Nightmare) { Nightmare = require('nightmare'); }
  
  Nightmare.action(
    'realClick',
    realClickInternal,
    actionOnElement('realClick'));
  Nightmare.action(
    'realMousedown',
    realMousedownInternal,
    actionOnElement('realMousedown'));
  Nightmare.action(
    'realMouseover',
    realMouseoverInternal,
    actionOnElement('realMouseover'));
}

function realMousedownInternal(name, options, parent, window, renderer, done) {
  const LAST_CLICK = Symbol();
  parent.respondTo('realMousedown', function(x, y, done) {
    // check the last click event to see if this is a double-click
    const previous = window[LAST_CLICK] || {};
    const now = Date.now();
    const repeat =
      previous.x === x &&
      previous.y === y &&
      (now - previous.time) < 300;
    let clickCount = repeat ? 2 : 1;
    window[LAST_CLICK] = repeat ? undefined : {x: x, y: y, time: now};
    
    // DO THE THING!
    window.webContents.sendInputEvent({
      type: 'mousedown',
      x: x,
      y: y,
      clickCount: clickCount
    });
    setTimeout(function() { done(); }, 25);
  });
  done();
}

function realMouseoverInternal(name, options, parent, window, renderer, done) {
  parent.respondTo('realMouseover', function(x, y, done) {
    window.webContents.sendInputEvent({
      // `enter` doesn't directly trigger anything, so use `move`
      type: 'mousemove',
      x: x,
      y: y,
      movementX: 1,
      movementY: 1
    });
    setTimeout(function() { done(); }, 25);
  });
  done();
}

function realClickInternal(name, options, parent, window, renderer, done) {
  const LAST_CLICK = Symbol();
  parent.respondTo('realClick', function(x, y, done) {
    // check the last click event to see if this is a double-click
    const previous = window[LAST_CLICK] || {};
    const now = Date.now();
    const repeat =
      previous.x === x &&
      previous.y === y &&
      (now - previous.time) < 300;
    let clickCount = repeat ? 2 : 1;
    window[LAST_CLICK] = repeat ? undefined : {x: x, y: y, time: now};
    
    // CLICKITY-CLICK
    window.webContents.sendInputEvent({
      type: 'mousedown',
      x: x,
      y: y,
      clickCount: clickCount
    });
    window.webContents.sendInputEvent({
      type: 'mouseup',
      x: x,
      y: y
    });
    setTimeout(function() { done(); }, 25);
  });
  done();
}


// Utilities

function actionOnElement(actionName) {
  return function(selector /*[, position], done */) {
    const done = arguments[arguments.length - 1]
    const position = arguments.length > 2 ? arguments[1] : undefined;
    if (typeof selector !== 'string') {
      return done(new TypeError(`${actionName}: "selector" must be a string`));
    }
    else if (position && (typeof position.x !== 'number' || typeof position.y !== 'number')) {
      return done(new TypeError(`${actionName}: "position.x" and ".y" must be numbers`));
    }
    var child = this.child;

    debug(`Finding "${selector}"`);
    getBounds(this, selector)
      .then(function(bounds) {
        return position ? relativePosition(bounds, position) : center(bounds);
      })
      .then(function(point) {
        debug(`${actionName} "${selector}" at ${point.x}, ${point.y}`);
        child.call(actionName, point.x, point.y, done);
      })
      .catch(done);
  }
}

function getBounds(nightmare, selector) {
  return new Promise(function(resolve, reject) {
    nightmare.evaluate_now(function(selector) {
      let element = document.querySelector(selector);
      if (!element) { throw new Error(`Cannot find element: "${selector}"`); }
      let rect = element.getBoundingClientRect();
      // sadly, Chromium ClientRects are not JSON-serializable :(
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height 
      };
    }, function(error, bounds) {
      if (error) return reject(error);
      resolve(bounds);
    }, selector);
  });
}

function center(bounds) {
  return {
    x: Math.floor(bounds.left + bounds.width / 2),
    y: Math.floor(bounds.top + bounds.height / 2)
  };
}

function relativePosition(bounds, position) {
  return {
    x: Math.floor(bounds.left + position.x),
    y: Math.floor(bounds.top + position.y)
  };
}
