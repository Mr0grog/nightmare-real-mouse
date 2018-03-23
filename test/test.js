'use strict';
const http = require('http');
const express = require('express');
const expect = require('chai').expect;
const Nightmare = require('nightmare');
const realMouse = require('../');

realMouse(Nightmare);

describe('real-mouse', function() {
  let baseUrl, nightmare;
  before((done) => {
    server.listen(0, 'localhost', () => {
      var address = server.address();
      baseUrl = `http://${address.address}:${address.port}`;
      done();
    });
  });
  after(() => server.close());
  
  beforeEach(() => nightmare = Nightmare());
  afterEach(() => nightmare.end());
  
  describe('realClick', function() {
    it('should trigger all related mouse events', function() {
      const messages = [];
      return nightmare
        .on('console', (type, message) => messages.push(message))
        .goto(`${baseUrl}/simple`)
        .evaluate(function() {
          function logEvent(event) { console.log(event.type); }
          document.body.addEventListener('mouseover', logEvent);
          document.body.addEventListener('mouseout', logEvent);
          document.body.addEventListener('mouseenter', logEvent);
          document.body.addEventListener('mouseleave', logEvent);
          document.body.addEventListener('mousedown', logEvent);
          document.body.addEventListener('mouseup', logEvent);
          document.body.addEventListener('click', logEvent);
        })
        .realClick('#first')
        .then(() => {
          expect(messages).to.deep.equal([
            'mouseover',
            'mouseenter',
            'mousedown',
            'mouseup',
            'click'
          ]);
        });
    });
    
    it('should trigger out/over events when changing targets', function() {
      const messages = [];
      return nightmare
        .on('console', (type, message) => messages.push(message))
        .goto(`${baseUrl}/simple`)
        .evaluate(function() {
          function logEvent(event) {
            console.log(`${event.type} on ${event.target.id || 'body'}`);
          }
          document.body.addEventListener('mouseover', logEvent, true);
          document.body.addEventListener('mouseout', logEvent, true);
          document.body.addEventListener('mouseenter', logEvent, true);
          document.body.addEventListener('mouseleave', logEvent, true);
          document.body.addEventListener('mousedown', logEvent, true);
          document.body.addEventListener('mouseup', logEvent, true);
          document.body.addEventListener('click', logEvent, true);
          document.body.addEventListener('dblclick', logEvent, true);
          document.body.addEventListener('dblclick', logEvent, true);
        })
        .realClick('#first')
        .realClick('#second')
        .then(() => {
          expect(messages).to.deep.equal([
            'mouseover on first',
            'mouseenter on body',
            'mouseenter on first',
            'mousedown on first',
            'mouseup on first',
            'click on first',
            'mouseout on first',
            'mouseleave on first',
            'mouseover on second',
            'mouseenter on second',
            'mousedown on second',
            'mouseup on second',
            'click on second'
          ]);
        });
    });
    
    it('should trigger dblclick for rapid clicks in the same spot targets', function() {
      const messages = [];
      return nightmare
        .on('console', (type, message) => messages.push(message))
        .goto(`${baseUrl}/simple`)
        .evaluate(function() {
          function logEvent(event) {
            console.log(`${event.type} on ${event.target.id || 'body'}`);
          }
          document.body.addEventListener('mousedown', logEvent, true);
          document.body.addEventListener('mouseup', logEvent, true);
          document.body.addEventListener('click', logEvent, true);
          document.body.addEventListener('dblclick', logEvent, true);
        })
        .realClick('#first')
        .realClick('#first')
        .then(() => {
          expect(messages).to.deep.equal([
            'mousedown on first',
            'mouseup on first',
            'click on first',
            'mousedown on first',
            'mouseup on first',
            'click on first',
            'dblclick on first'
          ]);
        });
    });
    
    it('should trigger actual button behaviors', function() {
      return nightmare
        .goto(`${baseUrl}`)
        .realClick('#submit')
        .title()
        .then(title => {
          expect(title).to.equal('Submitted Page');
        });
    });
    
    it('should reject if the selector is not found', function() {
      return nightmare
        .goto(`${baseUrl}/simple`)
        .realClick('#does-not-exist')
        .then(() => {
          throw new Error('Using a non-existent selector did not reject');
        }, error => {
          expect(error.message).to.equal('Cannot find element: "#does-not-exist"');
        });
    });
    
    it('should reject if the selector was not a string', function() {
      return nightmare
        .goto(`${baseUrl}/simple`)
        .realClick(5)
        .then(() => {
          throw new Error('Using a non-string selector did not reject');
        }, error => {
          expect(error.message).to.have.string('"selector" must be a string');
        });
    });
  });
  
  describe('realMouseover', function() {
    it('should trigger mouseover related mouse events', function() {
      const messages = [];
      return nightmare
        .on('console', (type, message) => messages.push(message))
        .goto(`${baseUrl}/simple`)
        .evaluate(function() {
          function logEvent(event) {
            console.log(`${event.type} on ${event.target.id || 'body'}`);
          }
          document.body.addEventListener('mouseover', logEvent, true);
          document.body.addEventListener('mouseout', logEvent, true);
          document.body.addEventListener('mouseenter', logEvent, true);
          document.body.addEventListener('mouseleave', logEvent, true);
        })
        .realMouseover('#first')
        .then(() => {
          expect(messages).to.deep.equal([
            'mouseover on first',
            'mouseenter on body',
            'mouseenter on first'
          ]);
        });
    });
    
    it('should trigger events on the element that was left', function() {
      const messages = [];
      return nightmare
        .on('console', (type, message) => messages.push(message))
        .goto(`${baseUrl}/simple`)
        .evaluate(function() {
          function logEvent(event) {
            console.log(`${event.type} on ${event.target.id || 'body'}`);
          }
          document.body.addEventListener('mouseover', logEvent, true);
          document.body.addEventListener('mouseout', logEvent, true);
          document.body.addEventListener('mouseenter', logEvent, true);
          document.body.addEventListener('mouseleave', logEvent, true);
        })
        .realMouseover('#first')
        .realMouseover('#second')
        .realMouseover('body')
        .then(() => {
          expect(messages).to.deep.equal([
            'mouseover on first',
            'mouseenter on body',
            'mouseenter on first',
            'mouseout on first',
            'mouseleave on first',
            'mouseover on second',
            'mouseenter on second',
            'mouseout on second',
            'mouseleave on second',
            'mouseover on body'
          ]);
        });
    });
    
    it('should reject the nightmare promise if the selector is not found', function() {
      return nightmare
        .goto(`${baseUrl}/simple`)
        .realMouseover('#does-not-exist')
        .then(() => {
          throw new Error('Using a non-existent selector did not reject');
        }, error => {
          expect(error.message).to.equal('Cannot find element: "#does-not-exist"');
        });
    });
  });
  
  describe('realMousedown', function() {
    it('should trigger mouseover related mouse events', function() {
      const messages = [];
      return nightmare
        .on('console', (type, message) => messages.push(message))
        .goto(`${baseUrl}/simple`)
        .evaluate(function() {
          function logEvent(event) {
            console.log(`${event.type} on ${event.target.id || 'body'}`);
          }
          document.body.addEventListener('mouseover', logEvent, true);
          document.body.addEventListener('mouseout', logEvent, true);
          document.body.addEventListener('mouseenter', logEvent, true);
          document.body.addEventListener('mouseleave', logEvent, true);
          document.body.addEventListener('mousedown', logEvent, true);
          document.body.addEventListener('mouseup', logEvent, true);
          document.body.addEventListener('click', logEvent, true);
          document.body.addEventListener('dblclick', logEvent, true);
          document.body.addEventListener('dblclick', logEvent, true);
        })
        .realMousedown('#first')
        .then(() => {
          expect(messages).to.deep.equal([
            'mouseover on first',
            'mouseenter on body',
            'mouseenter on first',
            'mousedown on first'
          ]);
        });
    });
    
    it('should reject the nightmare promise if the selector is not found', function() {
      return nightmare
        .goto(`${baseUrl}/simple`)
        .realMousedown('#does-not-exist')
        .then(() => {
          throw new Error('Using a non-existent selector did not reject');
        }, error => {
          expect(error.message).to.equal('Cannot find element: "#does-not-exist"');
        });
    });
  });
});

let server = express();
server.get('/', function(request, response) {
  response.end(`<!DOCTYPE html>
    <html>
      <head><title>Index</title></head>
      <body>
        <form method="GET" action="/submit">
          <input type="submit" id="submit" value="Submit!" />
        </form>
      </body>
    </html>
  `);
});
server.get('/submit', function(request, response) {
  response.end(`<!DOCTYPE html>
    <html>
      <head><title>Submitted Page</title></head>
      <body>
        You got to the second page!
      </body>
    </html>
  `);
});
server.get('/simple', function(request, response) {
  response.end(`<!DOCTYPE html>
    <html>
      <head><title>Simple Page</title></head>
      <body>
        <p id="first">Paragraph with text</p>
        <p id="second">Another paragraph</p>
      </body>
    </html>
  `);
});
server = http.createServer(server);
